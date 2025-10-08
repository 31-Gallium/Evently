import React, { useState, useMemo, useEffect, useCallback } from 'react';
import styles from './AdminDashboard.module.css';
import CalendarView from '../Calendar/CalendarView';
import { Users, Briefcase, CheckSquare, BarChart2 } from 'lucide-react';
import AdminStatsDashboard from './AdminStatsDashboard';
import AdminEventAnalytics from './AdminEventAnalytics';
import { UsersView } from './UsersView';
import { EventsView } from './EventsView';
import { OrganizerRequestsView } from './OrganizerRequestsView';
import { EventApprovalsView } from './EventApprovalsView';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const AdminDashboard = ({ user, userProfile, onEventsUpdate }) => {
    const [adminView, setAdminView] = useState('dashboard');
    const [viewingEventId, setViewingEventId] = useState(null);
    const [eventsView, setEventsView] = useState('list'); // 'list' or 'calendar'
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

import { getAuthHeader } from '../../utils/auth';

// ... (imports)

const AdminDashboard = ({ user, userProfile, onEventsUpdate }) => {
    // ... (state)

    const fetchData = useCallback(async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const headers = await getAuthHeader();
            const eventsRes = await fetch(`${API_BASE_URL}/admin/events`, { headers });
            const eventsData = await eventsRes.json();
            console.log('Fetched events data:', eventsData);
            const formattedEvents = eventsData.map(event => ({
                id: event.id,
                title: event.name,
                start: event.date,
                end: event.date, // Assuming end date is same as start date for now
                allDay: true,
                ...event
            }));
            console.log('Formatted events:', formattedEvents);
            setEvents(formattedEvents);
        } catch (error) { console.error("Failed to fetch events:", error); }
        setIsLoading(false);
    }, [user]);

    // ... (rest of the component)
};

    useEffect(() => {
        if (user && adminView === 'events') {
            fetchData();
        }
    }, [user, adminView, fetchData]);

    const renderContent = () => {
        if (viewingEventId) {
            return <AdminEventAnalytics eventId={viewingEventId} user={user} onBack={() => setViewingEventId(null)} />;
        }

        switch (adminView) {
            case 'dashboard':
                return <AdminStatsDashboard user={user} />;
            case 'organizerRequests':
                return <OrganizerRequestsView user={user} />;
            case 'approvals':
                return <EventApprovalsView user={user} onEventsUpdate={onEventsUpdate} />;
            case 'events':
                console.log('Rendering events view with events:', events);
                return (
                    <div>
                        <div className={styles.viewToggle}>
                            <button onClick={() => setEventsView('list')} className={eventsView === 'list' ? styles.active : ''}>List</button>
                            <button onClick={() => setEventsView('calendar')} className={eventsView === 'calendar' ? styles.active : ''}>Calendar</button>
                        </div>
                        {eventsView === 'list' ?
                            <EventsView user={user} onEventsUpdate={onEventsUpdate} setViewingEventId={setViewingEventId} /> :
                            (isLoading ? <p>Loading...</p> : <CalendarView events={events} />)
                        }
                    </div>
                );
            case 'users':
                return <UsersView user={user} />;
            default:
                return <AdminStatsDashboard user={user} />;
        }
    };

    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

    const handleMouseEnter = () => {
        setIsSidebarCollapsed(false);
    };

    const handleMouseLeave = () => {
        setIsSidebarCollapsed(true);
    };

    return (
        <div className={styles.adminContainer} style={{paddingTop: '70px'}}>
            <aside
                className={`${styles.sidebar} ${isSidebarCollapsed ? styles.collapsed : ''}`}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >

                <nav className={styles.nav}>
                    <a href="#" onClick={() => setAdminView('dashboard')} className={adminView === 'dashboard' ? styles.active : ''}><BarChart2 /> <span>Dashboard</span></a>
                    <a href="#" onClick={() => setAdminView('organizerRequests')} className={adminView === 'organizerRequests' ? styles.active : ''}><Briefcase /> <span>Organizer Requests</span></a>
                    <a href="#" onClick={() => setAdminView('approvals')} className={adminView === 'approvals' ? styles.active : ''}><CheckSquare /> <span>Event Approvals</span></a>
                    <a href="#" onClick={() => setAdminView('events')} className={adminView === 'events' ? styles.active : ''}><Users /> <span>Events</span></a>
                    <a href="#" onClick={() => setAdminView('users')} className={adminView === 'users' ? styles.active : ''}><Users /> <span>Users</span></a>
                </nav>
            </aside>
            <main className={styles.mainContent}>
                {renderContent()}
            </main>
        </div>
    );
};


export default AdminDashboard;