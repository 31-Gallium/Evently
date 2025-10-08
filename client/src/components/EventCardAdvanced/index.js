import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../../App.module.css';
import { Icons } from '../../utils/Icons';
import { getFallbackImage } from '../../utils/imageHelpers';

const EventCardAdvanced = ({ event, isBooked }) => {
    const navigate = useNavigate();
    const { id, name, date, imageUrl, description, tags: tagsString } = event;

    const handleImageError = (e) => {
        e.target.src = getFallbackImage(tagsString);
    };

    const formattedDate = new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });

    const handleBookNow = (e) => {
        e.stopPropagation();
        navigate(`/event/${id}`);
    };

    return (
        <div className={styles.eventCardAdvanced}>
            <div className={styles.eventCardAdvancedImageContainer}>
                <img
                    src={imageUrl || getFallbackImage(tagsString)}
                    alt={name}
                    className={styles.eventCardAdvancedImage}
                    onError={handleImageError}
                />
                {isBooked && <div className={styles.bookedBadge}>Booked</div>}
            </div>
            <div className={styles.eventCardAdvancedContent}>
                <h3 className={styles.eventCardAdvancedTitle}>{name}</h3>
                <p className={styles.eventCardAdvancedDate}>{formattedDate}</p>
                <p className={styles.eventCardAdvancedDescription}>
                    {description ? description.substring(0, 100) + '...' : ''}
                </p>
                <div className={styles.eventCardAdvancedFooter}>
                    <button className={styles.bookNowButton} onClick={handleBookNow}>
                        {Icons.ticket} Book Now
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EventCardAdvanced;
