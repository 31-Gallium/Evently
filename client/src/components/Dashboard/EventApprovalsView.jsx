import React, { useState, useEffect, useCallback } from 'react';
import styles from './EventApprovalsView.module.css';
import { getAuthHeader } from '../../utils/auth';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const EventApprovalsView = ({ user, onEventsUpdate }) => {
    const [approvals, setApprovals] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = useCallback(async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const headers = await getAuthHeader();
            const approvalsRes = await fetch(`${API_BASE_URL}/admin/approvals`, { headers });
            if (!approvalsRes.ok) throw new Error('Failed to fetch approvals');
            setApprovals(await approvalsRes.json());
        } catch (error) {
            console.error("Failed to fetch approvals:", error);
        }
        setIsLoading(false);
    }, [user]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleApprovalAction = async (eventId, action) => {
        try {
            const headers = await getAuthHeader();
            const response = await fetch(`${API_BASE_URL}/admin/events/${eventId}/${action}`, { method: 'POST', headers });
            if (!response.ok) throw new Error(`Failed to ${action} event.`);
            
            fetchData(); // Refetch the list of approvals
            if (action === 'approve' && onEventsUpdate) {
                onEventsUpdate(); // Trigger a refetch in the parent component
            }
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    };

    return (
        <div className={styles.approvalsViewContainer}>
            <div className={styles.header}>
                <h2>Event Approvals</h2>
            </div>
            <div className={styles.approvalGrid}>
                {isLoading ? <p>Loading...</p> : approvals.length === 0 ? (<p>No pending approvals.</p>) : (approvals.map(event => (
                    <div key={event.id} className={styles.approvalCard}>
                        <div className={styles.cardHeader}>
                            <span className={styles.eventName}>{event.name}</span>
                        </div>
                        <div className={styles.cardBody}>
                            <p>Organizer: {event.organizer?.email || 'N/A'}</p>
                            <p>Submitted: {new Date(event.createdAt).toLocaleDateString('en-IN')}</p>
                        </div>
                        <div className={styles.cardFooter}>
                            <button className={styles.approveButton} onClick={() => handleApprovalAction(event.id, 'approve')}>Approve</button>
                            <button className={styles.rejectButton} onClick={() => handleApprovalAction(event.id, 'reject')}>Reject</button>
                        </div>
                    </div>
                )))}
            </div>
        </div>
    );
};