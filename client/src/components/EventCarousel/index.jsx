
import React from 'react';
import { Link } from 'react-router-dom';
import StandardEventCard from '../StandardEventCard';
import NetflixCarousel from './NetflixCarousel';
import './EventCarousel.css';

const EventCarousel = ({ title, events, link, itemsPerPage }) => {
    if (!events || events.length === 0) return null;

    return (
        <div className="carousel-container">
            <div className="carousel-header">
                <h2 className="carousel-title">{title}</h2>
                {link && <Link to={link} className="see-all-link">See All</Link>}
            </div>
            <NetflixCarousel events={events} itemsPerPage={itemsPerPage}>
                {events.map(event => (
                    <div key={event.id} className="carousel-item">
                        <StandardEventCard event={event} />
                    </div>
                ))}
            </NetflixCarousel>
        </div>
    );
};

export default EventCarousel;
