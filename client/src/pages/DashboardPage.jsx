import React from 'react';
import { useAuth } from '../context/AuthContext';
import styles from '../App.module.css';
import { OrganizerDashboard } from '../components/Dashboard';
import AdminDashboard from '../components/Dashboard/AdminDashboard';

const DashboardPage = ({ onEventsUpdate }) => {
    const { user, userProfile } = useAuth();

    if (!user || !userProfile) return null;

    if (userProfile.role === 'ADMIN') {
        return <AdminDashboard user={user} userProfile={userProfile} onEventsUpdate={onEventsUpdate} />;
    }
    
    if (userProfile.role === 'ORGANIZER') {
        return <OrganizerDashboard user={user} userProfile={userProfile} />;
    }

    return (
        <div className={styles.pageContainer} style={{paddingTop: '70px'}}>
            <h1 className={styles.pageTitle}>Dashboard</h1>
            <p>You do not have sufficient privileges to view this page.</p>
        </div>
    );
};

export default DashboardPage;