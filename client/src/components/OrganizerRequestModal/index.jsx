import React, { useState } from 'react';
import styles from './OrganizerRequestModal.module.css';
import { useAuth } from '../../context/AuthContext';

const OrganizerRequestModal = ({ onClose }) => {
    const [orgName, setOrgName] = useState('');
    const { user, refetchProfile } = useAuth();

import { getAuthHeader } from '../../utils/auth';

// ... (imports)

const OrganizerRequestModal = ({ onClose }) => {
    // ... (state)
    const { user, refetchProfile } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) return;
        const headers = await getAuthHeader();
        const response = await fetch('/api/organizer-requests', {
            method: 'POST',
            headers,
            body: JSON.stringify({ requestedOrgName: orgName })
        });

        if (response.ok) {
            refetchProfile();
            onClose();
        }
    };

    // ... (render)
};


    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <h2>Become an Organizer</h2>
                <p>Fill out the form below to request to become an organizer.</p>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Your Organization Name"
                        value={orgName}
                        onChange={(e) => setOrgName(e.target.value)}
                        required
                    />
                    <div className={styles.modalActions}>
                        <button type="button" onClick={onClose}>Cancel</button>
                        <button type="submit">Submit Request</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default OrganizerRequestModal;