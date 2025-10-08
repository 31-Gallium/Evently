import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { onAuthStateChanged } from "firebase/auth";
import { auth } from '../firebase';
import { getAuthHeader } from '../utils/auth';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Derived state for easier consumption in components
    const userBookings = React.useMemo(() => new Set(userProfile?.bookings?.map(b => b.eventId) || []), [userProfile?.bookings]);
    const userWaitlist = React.useMemo(() => new Set(userProfile?.waitlist?.map(w => w.eventId) || []), [userProfile?.waitlist]);
    const userHypes = React.useMemo(() => new Set(userProfile?.hypes?.map(h => h.eventId) || []), [userProfile?.hypes]);

    const fetchFullUserProfile = useCallback(async (currentUser) => {
        if (!currentUser) {
            setUserProfile(null);
            setIsLoading(false);
            return;
        }
        
        setIsLoading(true);
        try {
            const headers = await getAuthHeader();
            // Fetch all user-related data in parallel
            const [profileRes, bookingsRes, waitlistRes, hypesRes, watchlistRes] = await Promise.all([
                fetch(`${API_BASE_URL}/users/me`, { headers }),
                fetch(`${API_BASE_URL}/users/bookings`, { headers }),
                fetch(`${API_BASE_URL}/users/waitlist`, { headers }),
                fetch(`${API_BASE_URL}/users/hypes`, { headers }),
                fetch(`${API_BASE_URL}/users/watchlist`, { headers })
            ]);

            // Check for network errors
            if (!profileRes.ok) throw new Error('Failed to fetch user profile.');

            const profile = await profileRes.json();
            const bookings = bookingsRes.ok ? await bookingsRes.json() : [];
            const waitlist = waitlistRes.ok ? await waitlistRes.json() : [];
            const hypes = hypesRes.ok ? await hypesRes.json() : [];
            const watchlist = watchlistRes.ok ? await watchlistRes.json() : [];

            // Combine all data into a single profile object
            setUserProfile({ ...profile, bookings, waitlist, hypes, watchlist });

        } catch (error) {
            console.error("Failed to fetch user data:", error);
            setUserProfile(null); // Clear profile on error
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            fetchFullUserProfile(currentUser);
        });

        return () => unsubscribe();
    }, [fetchFullUserProfile]);

    const value = {
        user,
        userProfile,
        isLoading,
        // Pass derived sets directly
        userBookings,
        userWaitlist,
        userHypes,
        // Watchlist is not a Set in the original logic, but an array. Let's keep it that way.
        userWatchlist: userProfile?.watchlist || [],
        // A function to manually refetch all profile data
        refetchProfile: () => fetchFullUserProfile(user),
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
