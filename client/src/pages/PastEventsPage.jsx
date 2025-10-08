
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import StandardEventCard from '../components/StandardEventCard';
import styles from './PastEventsPage.module.css';

const PastEventsPage = () => {
    const [allEvents, setAllEvents] = useState([]);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const { userBookings } = useAuth();

    useEffect(() => {
        const fetchPastEvents = async () => {
            try {
                const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
// ...
const response = await fetch(`${API_BASE_URL}/past`);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const events = await response.json();
                setAllEvents(events);
                setFilteredEvents(events);
            } catch (e) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };
        fetchPastEvents();
    }, []);

    useEffect(() => {
        let events = [...allEvents];
        if (searchTerm) {
            events = events.filter(event => event.name.toLowerCase().includes(searchTerm.toLowerCase()));
        }
        if (dateFilter) {
            events = events.filter(event => new Date(event.date).toDateString() === new Date(dateFilter).toDateString());
        }
        setFilteredEvents(events);
    }, [searchTerm, dateFilter, allEvents]);

    return (
        <div className={`page-container ${styles.pastEventsPage}`}>
            <div className={styles.header}>
                <h2 className="page-title">Explore Past Events</h2>
                <p>Relive the moments. Here you can find all the events that have already taken place.</p>
            </div>

            <div className={styles.filters}>
                <input
                    type="text"
                    placeholder="Search by event name..."
                    className={styles.searchInput}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <input
                    type="date"
                    className={styles.dateInput}
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                />
            </div>

            {loading && <p>Loading past events...</p>}
            {error && <p>Error: {error}</p>}
            {!loading && filteredEvents.length === 0 && <p>There are no past events matching your criteria.</p>}
            
            <motion.div layout className="event-grid">
                {filteredEvents.map((event) => (
                    <StandardEventCard
                        key={event.id}
                        event={event}
                        isPast={true}
                        isBooked={userBookings.has(event.id)}
                    />
                ))}
            </motion.div>
        </div>
    );
};

export default PastEventsPage;