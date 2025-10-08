import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './HeroSection.module.css';
import { getFallbackImage } from '../../utils/imageHelpers';

const HeroSection = ({ featuredEvent }) => {
    const navigate = useNavigate();
    
    // Set initial state from the event prop
    const [currentImageUrl, setCurrentImageUrl] = useState(featuredEvent?.imageUrl);

    // When the featured event changes, update the image URL
    useEffect(() => {
        setCurrentImageUrl(featuredEvent?.imageUrl);
    }, [featuredEvent]);

    // If the primary image fails, set it to a fallback
    const handleImageError = () => {
        setCurrentImageUrl(getFallbackImage(featuredEvent?.tags, 'landscape'));
    };

    // Don't render the component if there's no event to feature
    if (!featuredEvent) {
        return (
            <div className={styles.hero}>
                <div className={styles.heroContent}>
                    <h1 className={styles.heroTitle}>Welcome to Evently</h1>
                    <p className={styles.heroSubtitle}>Discover amazing events near you.</p>
                </div>
            </div>
        );
    }

    const { name, description, id } = featuredEvent;

    return (
        <div className={styles.hero}>
            <img 
                key={currentImageUrl} // Add key to force re-render on src change
                src={currentImageUrl || getFallbackImage(featuredEvent?.tags, 'landscape')} 
                alt={name}
                className={styles.heroImage}
                onError={handleImageError}
            />
            <div className={styles.heroContent}>
                <h1 className={styles.heroTitle}>{name}</h1>
                <p className={styles.heroSubtitle}>{description}</p>
                <button className={styles.ctaButton} onClick={() => navigate(`/event/${id}`)}>View Details</button>
            </div>
        </div>
    );
};

export default HeroSection;