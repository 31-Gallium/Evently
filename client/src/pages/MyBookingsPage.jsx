import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import styles from '../App.module.css';
import CalendarView from '../components/Calendar/CalendarView';

const Icons = {
    calendar: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>,
    mapPin: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>,
};
const getFallbackImage = () => 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=800';


const BookingCard = ({ booking, onCancel }) => { 
    const { event } = booking; 
    const formattedDate = new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }); 
    return ( 
        <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -100, transition: { duration: 0.3 } }} className={styles.bookingCard}> 
            <img src={event.imageUrl || getFallbackImage(event.tags)} alt={event.name} className={styles.bookingImage} /> 
            <div className={styles.bookingDetails}> 
                <h3>{event.name}</h3> 
                <p>{Icons.calendar} {formattedDate}</p> 
                <p>{Icons.mapPin} {event.location}</p> 
            </div> 
            <div className={styles.bookingActions}> 
                 <button className={styles.viewTicketButton}>View Ticket</button>
                <button className={styles.cancelButton} onClick={() => onCancel(booking.id, event.id)}>Cancel</button> 
            </div> 
        </motion.div> 
    ); 
};

const MyBookingsPage = () => {
    const { user, setUserBookings } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [view, setView] = useState('list'); // 'list' or 'calendar'

    const fetchBookings = React.useCallback(async () => { 
        if (!user) { 
            setError("You must be logged in to see your bookings."); 
            setLoading(false); 
            return; 
        } 
        setLoading(true); 
        try { 
            const headers = await getAuthHeader();
        const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
// ...
const response = await fetch(`${API_BASE_URL}/users/bookings`, { headers }); 
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`); 
            setBookings(await response.json()); 
        } catch (e) { 
            setError(e.message); 
        } finally { 
            setLoading(false); 
        } 
    }, [user]);
    
    useEffect(() => {
        fetchBookings();
    }, [user, fetchBookings]);

    import { getAuthHeader } from '../utils/auth';
    
    // ... (imports)
    
    const MyBookingsPage = () => {
        // ... (state)
        const { user, refetchProfile } = useAuth();
    
        // ... (useEffect)
    
        const cancelBooking = async (bookingId) => {
            if (!user) return;
            const headers = await getAuthHeader();
            const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}`, {
                method: 'DELETE',
                headers
            });
    
            if (response.ok) {
                refetchProfile();
            }
        };
    
        // ... (render)
    };
    return ( 
        <div className={styles.pageContainer} style={{paddingTop: '70px'}}> 
            <div className={styles.pageHeader}>
                <h2 className={styles.pageTitle}>My Booked Events</h2> 
                <div className={styles.viewToggle}>
                    <button onClick={() => setView('list')} className={view === 'list' ? styles.active : ''}>List</button>
                    <button onClick={() => setView('calendar')} className={view === 'calendar' ? styles.active : ''}>Calendar</button>
                </div>
            </div>
            {loading && <p>Loading your bookings...</p>} 
            {error && <p>Error: {error}</p>} 
            {!loading && bookings.length === 0 && !error && <p>You haven't booked any events yet.</p>} 
            {view === 'list' ? (
                <div className={styles.bookingsList}>
                    <AnimatePresence>
                        {bookings.map((booking) => ( 
                            <BookingCard key={booking.id} booking={booking} onCancel={handleCancel} /> 
                        ))}
                    </AnimatePresence>
                </div> 
            ) : (
                <CalendarView events={bookings.map(b => b.event)} />
            )}
        </div> 
    );
};

export default MyBookingsPage;