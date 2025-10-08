import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './EventsView.module.css';
import cardStyles from './Card.module.css';
import useDebounce from '../../hooks/useDebounce';

import { IconGrid, IconCalendar } from '../../utils/Icons';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const EventsView = ({ user, onEdit, onEventsUpdate, setViewingEventId }) => {
    const [events, setEvents] = useState([]);
    const [eventSearch, setEventSearch] = useState('');
    const [eventStatusFilter, setEventStatusFilter] = useState('all');
    const [sortOrder, setSortOrder] = useState('name-asc');
    const [isLoading, setIsLoading] = useState(true);
    const [visibleEvents, setVisibleEvents] = useState(10);
    const [viewMode, setViewMode] = useState('grid');

    const debouncedEventSearch = useDebounce(eventSearch, 300);

import { getAuthHeader } from '../../utils/auth';

// ... (imports)

export const EventsView = ({ user, onEdit, onEventsUpdate, setViewingEventId }) => {
    // ... (state)

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const headers = await getAuthHeader();
            const eventsRes = await fetch(`${API_BASE_URL}/admin/events`, { headers });
            setEvents(await eventsRes.json());
        } catch (error) { console.error("Failed to fetch events:", error); }
        setIsLoading(false);
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleDeleteEvent = async (eventId) => {
        if (window.confirm('Are you sure you want to delete this event? This is irreversible.')) {
            try {
                const headers = await getAuthHeader();
                const response = await fetch(`${API_BASE_URL}/admin/events/${eventId}`, { method: 'DELETE', headers });
                if (!response.ok) throw new Error('Failed to delete event');
                fetchData(); 
                onEventsUpdate();
            } catch (error) { alert(`Error: ${error.message}`); }
        }
    };

    // ... (rest of the component)
};

    const filteredAndSortedEvents = useMemo(() => {
        return events
            .filter(event => 
                (debouncedEventSearch === '' || event.name.toLowerCase().includes(debouncedEventSearch.toLowerCase())) &&
                (eventStatusFilter === 'all' || 
                 (eventStatusFilter === 'upcoming' && new Date(event.date) >= new Date()) || 
                 (eventStatusFilter === 'past' && new Date(event.date) < new Date()))
            )
            .sort((a, b) => {
                const [field, order] = sortOrder.split('-');
                const factor = order === 'asc' ? 1 : -1;
                if (field === 'date') {
                    return (new Date(a.date) - new Date(b.date)) * factor;
                }
                if (a[field] < b[field]) return -1 * factor;
                if (a[field] > b[field]) return 1 * factor;
                return 0;
            });
    }, [events, debouncedEventSearch, eventStatusFilter, sortOrder]);

    const currentEvents = filteredAndSortedEvents.slice(0, visibleEvents);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <div className={styles.eventsViewContainer}>
            <div className={styles.header}>
                <h2>Event Management</h2>
                <div className={styles.viewToggle}>
                    <button onClick={() => setViewMode('grid')} className={viewMode === 'grid' ? styles.active : ''}><IconGrid /></button>
                </div>
                <div className={styles.filters}>
                    <input type="search" placeholder="Search by name..." className={styles.searchInput} value={eventSearch} onChange={e => setEventSearch(e.target.value)} />
                    <select className={styles.filterSelect} value={eventStatusFilter} onChange={e => setEventStatusFilter(e.target.value)}>
                        <option value="all">All Events</option>
                        <option value="upcoming">Upcoming</option>
                        <option value="past">Past</option>
                    </select>
                    <select className={styles.filterSelect} value={sortOrder} onChange={e => setSortOrder(e.target.value)}>
                        <option value="name-asc">Name (A-Z)</option>
                        <option value="name-desc">Name (Z-A)</option>
                        <option value="date-asc">Date (Oldest)</option>
                        <option value="date-desc">Date (Newest)</option>
                    </select>
                    <button className={styles.createButton} onClick={() => onEdit(null)}>+ Create New Event</button>
                </div>
            </div>
            <div className={styles.mainContent}>
                {viewMode === 'grid' ? (
                    <motion.div layout variants={containerVariants} initial="hidden" animate="visible" className={cardStyles.grid}>
                        <AnimatePresence>
                            {isLoading ? (
                                <p>Loading...</p>
                            ) : currentEvents.length === 0 ? (
                                <p>No events found.</p>
                            ) : (
                                currentEvents.map(event => (
                                    <motion.div
                                        variants={itemVariants}
                                        key={event.id}
                                        className={cardStyles.card}
                                    >
                                        <div className={cardStyles.cardHeader}>
                                            <span className={styles.eventName} onClick={() => setViewingEventId(event.id)}>{event.name}</span>
                                            <span className={`${styles.statusBadge} ${styles['status' + event.status]}`}>{event.status.replace(/_/g, ' ')}</span>
                                        </div>
                                        <div className={cardStyles.cardBody}>
                                            <p>Date: {new Date(event.date).toLocaleString('en-IN')}</p>
                                            <p>Created: {new Date(event.createdAt).toLocaleDateString('en-IN')}</p>
                                        </div>
                                        <div className={styles.cardFooter}>
                                            <button onClick={() => onEdit(event)}>Edit</button>
                                            <button onClick={() => handleDeleteEvent(event.id)} className={styles.deleteButton}>Delete</button>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </motion.div>
                ) : null}
            </div>
            {viewMode === 'grid' && visibleEvents < filteredAndSortedEvents.length && (
                <button className={styles.loadMoreButton} onClick={() => setVisibleEvents(prev => prev + 10)}>
                    Load More
                </button>
            )}
        </div>
    );
};