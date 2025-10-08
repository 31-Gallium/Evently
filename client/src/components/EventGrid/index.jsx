
import React from 'react';
import StandardEventCard from '../StandardEventCard';
import styles from './EventGrid.module.css';

const EventGrid = ({ events }) => {
    return (
        <div className={styles.eventGrid}>
            {events.map(event => (
                <StandardEventCard key={event.id} event={event} />
            ))}
        </div>
    );
};

export default EventGrid;
