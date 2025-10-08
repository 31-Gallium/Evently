import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFallbackImage } from '../../utils/imageHelpers';
import { useAuth } from '../../context/AuthContext';
import './StandardEventCard.css';
import { getAuthHeader } from '../../utils/auth';

const Icons = {
    heart: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>,
};

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const StandardEventCard = ({ event, isBooked, isPast = false }) => {
    const navigate = useNavigate();
    const { id, name, date, imageUrl, tags: tagsString, description, price } = event;
    const { user, userHypes, refetchProfile } = useAuth();

    const [currentImageUrl, setCurrentImageUrl] = useState(imageUrl);

    useEffect(() => { setCurrentImageUrl(imageUrl); }, [imageUrl]);

    const handleImageError = () => { setCurrentImageUrl(getFallbackImage(tagsString, 'landscape')); };

    const formattedDate = new Date(date).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
    const tags = tagsString ? tagsString.split(',').map(tag => tag.trim()) : [];

    const isHyped = userHypes.has(id);

    const handleHype = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) {
            navigate('/login');
            return;
        }
        try {
            const headers = await getAuthHeader();
            const response = await fetch(`${API_BASE_URL}/events/${id}/hype`, {
                method: isHyped ? 'DELETE' : 'POST',
                headers
            });

            if (response.ok) {
                refetchProfile();
            } else {
                console.error("Failed to update hype status");
            }
        } catch (error) {
            console.error("Hype action failed:", error);
        }
    };

    const handleSelectEvent = (e) => {
        // Prevent navigation if a button or link inside the card was clicked
        if (e.target.closest('button, a')) {
            return;
        }
        e.stopPropagation();
        if (!isPast) {
            navigate(`/event/${id}`);
        }
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
                <div className="price-badge">{price > 0 ? `₹${price}` : 'Free'}</div>
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