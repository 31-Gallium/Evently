import React, { useState } from 'react';
import styles from './OrganizerRequestModal.module.css';
import { useAuth } from '../../context/AuthContext';
import { getAuthHeader } from '../../utils/auth';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const OrganizerRequestModal = ({ onClose }) => {
    const [orgName, setOrgName] = useState('');
    const { user, refetchProfile } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user || !orgName.trim()) {
            alert("Organization name cannot be empty.");
            return;
        }
        try {
            const headers = await getAuthHeader();
            const response = await fetch(`${API_BASE_URL}/organizer-requests`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ requestedOrgName: orgName })
            });

            if (response.ok) {
                alert("Your request has been submitted!");
                refetchProfile();
                onClose();
            } else {
                const data = await response.json();
                throw new Error(data.error || "Failed to submit request.");
            }
        } catch (error) {
            console.error("Request submission error:", error);
            alert(`Error: ${error.message}`);
        }
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <button onClick={onClose} className={styles.closeButton}>&times;</button>
                <h2>Become an Organizer</h2>
                <p>Fill out the form below to request to become an organizer.</p>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Your Organization Name"
                        value={orgName}
                        onChange={(e) => setOrgName(e.target.value)}
                        required
                        className={styles.input}
                    />
                    <div className={styles.modalActions}>
                        <button type="button" onClick={onClose} className={styles.cancelButton}>Cancel</button>
                        <button type="submit" className={styles.submitButton}>Submit Request</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default OrganizerRequestModal;
