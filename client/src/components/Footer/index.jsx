import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

const Footer = () => {
    return (
        <footer className={styles.footer}>
            <div className={styles.footerContent}>
                <div className={styles.footerSection}>
                    <h2>Evently</h2>
                    <p>&copy; {new Date().getFullYear()} Evently. A demonstration project.</p>
                </div>
                <div className={styles.footerSection}>
                    <h3>Navigate</h3>
                    <ul className={styles.footerLinks}>
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/past-events">Past Events</Link></li>
                        <li><Link to="/bookings">My Bookings</Link></li>
                    </ul>
                </div>
                <div className={styles.footerSection}>
                    <h3>Follow Us</h3>
                    <ul className={styles.footerLinks}>
                        <li><a href="#">Facebook</a></li>
                        <li><a href="#">Twitter</a></li>
                        <li><a href="#">Instagram</a></li>
                    </ul>
                </div>
            </div>
        </footer>
    );
};

export default Footer;