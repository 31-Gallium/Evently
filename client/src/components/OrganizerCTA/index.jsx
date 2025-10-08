import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../../App.module.css';

const OrganizerCTA = () => {
    const navigate = useNavigate();

    return (
        <div className={styles.organizerCtaContainer}>
            <div className={styles.organizerCtaContent}>
                <h2>Become an Organizer</h2>
                <p>Share your passion and create your own events for the community to enjoy.</p>
                <button onClick={() => navigate('/dashboard')}>Get Started</button>
            </div>
        </div>
    );
};

export default OrganizerCTA;