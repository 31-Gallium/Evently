import React, { createContext, useState, useEffect, useContext } from 'react';
import { onAuthStateChanged } from "firebase/auth";
import { auth } from '../firebase';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [userBookings, setUserBookings] = useState(new Set());
    const [userWaitlist, setUserWaitlist] = useState(new Set());
    const [userHypes, setUserHypes] = useState(new Set()); // New state for hypes
    const [userWatchlist, setUserWatchlist] = useState(new Set());
    const [isLoading, setIsLoading] = useState(true);

    const fetchUserProfile = async (currentUser) => {
        if (!currentUser) {
            setUserProfile(null);
            setUserBookings(new Set());
            setUserWaitlist(new Set());
            setUserHypes(new Set());
            return;
        }
        try {
            // Fetch profile, bookings, waitlist, and hypes in parallel
import { getAuthHeader } from '../utils/auth';

const AuthContext = React.createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [version, setVersion] = useState(0);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setLoading(true);
            if (currentUser) {
                const headers = await getAuthHeader();
                const [profileRes, bookingsRes, waitlistRes, hypesRes, watchlistRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/users/me`, { headers }),
                    fetch(`${API_BASE_URL}/users/bookings`, { headers }),
                    fetch(`${API_BASE_URL}/users/waitlist`, { headers }),
                    fetch(`${API_BASE_URL}/users/hypes`, { headers }),
                    fetch(`${API_BASE_URL}/users/watchlist`, { headers })
                ]);

                const profile = await profileRes.json();
                const bookings = await bookingsRes.json();
                const waitlist = await waitlistRes.json();
                const hypes = await hypesRes.json();
                const watchlist = await watchlistRes.json();

                setUser(currentUser);
                setUserRole(profile.role);
                setUserProfile({ ...profile, bookings, waitlist, hypes, watchlist });
            } else {
                setUser(null);
                setUserRole(null);
                setUserProfile(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, [version]);

            if (profileRes.ok) {
                setUserProfile(await profileRes.json());
            } else {
                setUserProfile({ role: null });
            }

            if (bookingsRes.ok) {
                const data = await bookingsRes.json();
                setUserBookings(new Set(data.map(b => b.eventId)));
            } else {
                setUserBookings(new Set());
            }

            if (waitlistRes.ok) {
                const data = await waitlistRes.json();
                setUserWaitlist(new Set(data.map(w => w.eventId)));
            } else {
                setUserWaitlist(new Set());
            }

            if (hypesRes.ok) {
                const data = await hypesRes.json();
                setUserHypes(new Set(data.map(h => h.eventId)));
            } else {
                setUserHypes(new Set());
            }

            if (watchlistRes.ok) {
                const data = await watchlistRes.json();
                setUserWatchlist(new Set(data.map(w => w.eventId)));
            } else {
                setUserWatchlist(new Set());
            }



        } catch (error) {
            console.error("Failed to fetch user data:", error);
            setUserProfile({ role: null });
            setUserBookings(new Set());
            setUserWaitlist(new Set());
            setUserHypes(new Set());
            setUserWatchlist(new Set());
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            console.log("onAuthStateChanged", currentUser);
            setIsLoading(true);
            setUser(currentUser);
            if (currentUser) {
                await fetchUserProfile(currentUser);
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const value = {
        user,
        userProfile,
        userRole: userProfile?.role,
        userBookings,
        userWaitlist,
        userHypes, // Provide hypes
        userWatchlist,
        isLoading,
        refetchProfile: () => fetchUserProfile(user),
        setUserBookings,
        setUserWaitlist,
        setUserHypes, // Provide setter for optimistic updates
        setUserWatchlist,
    };

    return <AuthContext.Provider value={value}>{!isLoading && children}</AuthContext.Provider>;
};

export const useAuth = () => {
    return useContext(AuthContext);
};