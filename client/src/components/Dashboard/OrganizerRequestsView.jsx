
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import styles from './OrganizerRequestsView.module.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const OrganizerRequestsView = ({ user }) => {
    const [organizerRequests, setOrganizerRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

import { getAuthHeader } from '../../utils/auth';

// ... (imports)

export const OrganizerRequestsView = ({ user }) => {
    // ... (state)

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const headers = await getAuthHeader();
            const orgRequestsRes = await fetch(`${API_BASE_URL}/admin/organizer-requests`, { headers });
            setOrganizerRequests(await orgRequestsRes.json());
        } catch (error) { console.error("Failed to fetch organizer requests:", error); }
        setIsLoading(false);
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleOrganizerRequestAction = async (requestId, action) => {
        try {
            const headers = await getAuthHeader();
            await fetch(`${API_BASE_URL}/admin/organizer-requests/${requestId}/${action}`, { method: 'POST', headers });
            fetchData();
        } catch (error) { alert(`Error: ${error.message}`); }
    };

    // ... (rest of the component)
};

    return (
        <div className={styles.requestsViewContainer}>
            <div className={styles.header}>
                <h2>Organizer Requests</h2>
            </div>
            <div className={styles.requestGrid}>
                {isLoading ? <p>Loading...</p> : organizerRequests.length === 0 ? (<p>No pending requests.</p>) : 
                (organizerRequests.map(req => (
                    <div key={req.id} className={styles.requestCard}>
                        <div className={styles.cardHeader}>
                            <span className={styles.userEmail}>{req.user.email}</span>
                        </div>
                        <div className={styles.cardBody}>
                            <p>Organization: {req.requestedOrgName}</p>
                            <p>Requested: {new Date(req.createdAt).toLocaleDateString('en-IN')}</p>
                        </div>
                        <div className={styles.cardFooter}>
                            <button className={styles.approveButton} onClick={() => handleOrganizerRequestAction(req.id, 'approve')}>Approve</button>
                            <button className={styles.rejectButton} onClick={() => handleOrganizerRequestAction(req.id, 'reject')}>Reject</button>
                        </div>
                    </div>
                )))}
            </div>
        </div>
    );
};