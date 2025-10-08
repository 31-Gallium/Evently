import React, { useState, useEffect, useCallback } from 'react';
import styles from '../../App.module.css';
import CalendarView from '../Calendar/CalendarView';
import AdminEventAnalytics from './AdminEventAnalytics';
import EventFormModal from '../Calendar/EventFormModal';
import { getAuthHeader } from '../../utils/auth';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const OrganizerDashboard = ({ user }) => {
    const [myEvents, setMyEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [view, setView] = useState('list'); // 'list' or 'calendar'
    const [viewingEventId, setViewingEventId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [eventToEdit, setEventToEdit] = useState(null);

    const fetchMyEvents = useCallback(async () => {
        setIsLoading(true);
        try {
            const headers = await getAuthHeader();
            const response = await fetch(`${API_BASE_URL}/organizer/events`, { headers });
            if (!response.ok) throw new Error('Failed to fetch events');
            setMyEvents(await response.json());
        } catch (error) {
            console.error("Failed to fetch organizer events:", error);
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        if (!viewingEventId) {
            fetchMyEvents();
        }
    }, [viewingEventId, fetchMyEvents]);

    const handleOpenEditModal = (event) => {
        setEventToEdit(event);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setEventToEdit(null);
        setIsModalOpen(false);
        fetchMyEvents(); // Refetch events after modal is closed
    };

    const handleSubmitForApproval = async (eventId) => {
        if (window.confirm('Are you sure you want to submit this event for approval?')) {
            try {
                const headers = await getAuthHeader();
                const response = await fetch(`${API_BASE_URL}/organizer/events/${eventId}/submit`, { method: 'PUT', headers });
                if (!response.ok) throw new Error('Failed to submit event for approval');
                fetchMyEvents();
            } catch (error) {
                alert(`Error: ${error.message}`);
            }
        }
    };

    if (viewingEventId) {
        return <AdminEventAnalytics eventId={viewingEventId} user={user} onBack={() => setViewingEventId(null)} />;
    }

    return (
        <div className={styles.pageContainer}>
            <div className={styles.adminHeader}>
                <h1 className={styles.pageTitle}>My Events</h1>
                <div className={styles.viewToggle}>
                    <button onClick={() => setView('list')} className={view === 'list' ? styles.active : ''}>List</button>
                    <button onClick={() => setView('calendar')} className={view === 'calendar' ? styles.active : ''}>Calendar</button>
                </div>
            </div>
            {isLoading ? <p>Loading...</p> : view === 'list' ? (
                <div className={styles.tableContainer}>
                    <table className={styles.adminTable}>
                        <thead><tr><th>Name</th><th>Date</th><th>Status</th><th>Created On</th><th>Actions</th></tr></thead>
                        <tbody>
                            {myEvents.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center' }}>You have not created any events yet.</td></tr>}
                            {myEvents.map(event => (
                                <tr key={event.id}>
                                    <td>{event.name}</td><td>{new Date(event.date).toLocaleString('en-IN')}</td>
                                    <td><span className={`${styles.statusBadge} ${styles['status' + event.status]}`}>{event.status.replace(/_/g, ' ')}</span></td>
                                    <td>{new Date(event.createdAt).toLocaleDateString('en-IN')}</td>
                                    <td className={styles.actionButtons}>
                                        {(event.status === 'DRAFT' || event.status === 'REJECTED') && (<><button onClick={() => handleOpenEditModal(event)}>Edit</button><button className={styles.submitButton} onClick={() => handleSubmitForApproval(event.id)}>Submit for Approval</button></>)}
                                        {event.status === 'PENDING_APPROVAL' && <button disabled>Pending Review</button>}
                                        {event.status === 'PUBLISHED' && <button onClick={() => setViewingEventId(event.id)}>View Analytics</button>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <CalendarView events={myEvents} />
            )}
            {isModalOpen && <EventFormModal event={eventToEdit} onClose={handleCloseModal} userRole={user.role} />}
        </div>
    );
};

export default OrganizerDashboard;
