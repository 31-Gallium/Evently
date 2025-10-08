
import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './HeroSection.module.css';
import SearchBar from '../SearchBar';

const HeroSection = ({ featuredEvent }) => {
    const navigate = useNavigate();

    if (!featuredEvent) return null;

    const { name, description, imageUrl, id } = featuredEvent;

    return (
        <div className={styles.hero} style={{ backgroundImage: `url(${imageUrl})` }}>
            <div className={styles.heroContent}>
                <h1 className={styles.heroTitle}>{name}</h1>
                <p className={styles.heroSubtitle}>{description}</p>

                <button className={styles.ctaButton} onClick={() => navigate(`/event/${id}`)}>View Details</button>
            </div>
        </div>
    );
};

export default HeroSection;
