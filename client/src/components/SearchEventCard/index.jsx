
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFallbackImage } from '../../utils/imageHelpers';
import './SearchEventCard.css';

const SearchEventCard = ({ event }) => {
    const navigate = useNavigate();
    const { id, name, date, imageUrl, location, tags: tagsString } = event;

    const [currentImageUrl, setCurrentImageUrl] = useState(imageUrl);

    useEffect(() => { setCurrentImageUrl(imageUrl); }, [imageUrl]);

    const handleImageError = () => { setCurrentImageUrl(getFallbackImage(tagsString, 'landscape')); };
    
    const formattedDate = new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

    return (
        <div className="search-event-card" onClick={() => navigate(`/event/${id}`)}>
            <div className="search-event-card-image-container">
                <img src={currentImageUrl || getFallbackImage(tagsString, 'landscape')} alt={name} className="search-event-card-image" onError={handleImageError} />
            </div>
            <div className="search-event-card-content">
                <h3 className="search-event-card-title">{name}</h3>
                <p className="search-event-card-date">{formattedDate}</p>
                <p className="search-event-card-location">{location}</p>
            </div>
        </div>
    );
};

export default SearchEventCard;
