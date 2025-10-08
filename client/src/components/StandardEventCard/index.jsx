
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFallbackImage } from '../../utils/imageHelpers';
import { useAuth } from '../../context/AuthContext';
import './StandardEventCard.css';

const Icons = {
    heart: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>,
};

const StandardEventCard = ({ event, isBooked, isPast = false }) => {
    const navigate = useNavigate();
    const { id, name, date, imageUrl, tags: tagsString, description } = event;
    const { user, userHypes, setUserHypes } = useAuth();

    const [currentImageUrl, setCurrentImageUrl] = useState(imageUrl);

    useEffect(() => { setCurrentImageUrl(imageUrl); }, [imageUrl]);

    const handleImageError = () => { setCurrentImageUrl(getFallbackImage(tagsString, 'landscape')); };
    
    const formattedDate = new Date(date).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
    const tags = tagsString ? tagsString.split(',').map(tag => tag.trim()) : [];

    const isHyped = userHypes.has(id);

import { getAuthHeader } from '../../utils/auth';

// ... (imports)

const StandardEventCard = ({ event }) => {
    // ... (state)
    const { user, refetchProfile } = useAuth();

    const handleHype = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) return;
        const headers = await getAuthHeader();
        const response = await fetch(`/api/events/${event.id}/hype`, {
            method: isHyped ? 'DELETE' : 'POST',
            headers
        });

        if (response.ok) {
            refetchProfile();
        }
    };

    // ... (render)
};


    const handleSelectEvent = (e) => {
        if (e.target.tagName === 'A' || e.target.closest('A')) return;
        e.stopPropagation(); 
        if (!isPast) navigate(`/event/${id}`);
    };

    return (
        <div 
            className={`event-card ${isPast ? 'past-event-card' : ''}`}
            onClick={handleSelectEvent}
        >
            <div className="event-card-image-container">
                <img src={currentImageUrl || getFallbackImage(tagsString, 'landscape')} alt={name} className="event-card-image" onError={handleImageError} />
                <button className={`hype-button ${isHyped ? 'hyped' : ''}`} onClick={handleHype}>
                    {Icons.heart}
                </button>
                <div className="price-badge">{event.price > 0 ? `₹${event.price}` : 'Free'}</div>
            </div>
            <div className="event-card-content">
                <h3 className="event-card-title">{name}</h3>
                <p className="event-card-description">{description}</p>
                <div className="event-card-tags">
                    {tags.map(tag => <span key={tag} className="event-card-tag">{tag}</span>)}
                </div>
                <p className="event-card-date">{formattedDate}</p>
                {isBooked && !isPast && <div className="booked-badge">Booked</div>}
            </div>
        </div>
    );
};

export default StandardEventCard;
