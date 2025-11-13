import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './Footer.module.css';
import { useAuth } from '../../context/AuthContext';

// Icons for the mobile navigation
const HomeIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>;
const PastIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
const BookingsIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>;
const DashboardIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>;
const ProfileIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;

const Footer = () => {
    const { user, userRole } = useAuth();

    const getDashboardLink = () => {
        if (userRole === 'ADMIN' || userRole === 'ORGANIZER') {
            return (
                <NavLink to="/dashboard" className={({ isActive }) => isActive ? `${styles.mobileNavLink} ${styles.active}` : styles.mobileNavLink}>
                    <DashboardIcon />
                    <span>Dashboard</span>
                </NavLink>
            );
        }
        return null;
    };

    return (
        <>
            {/* --- Desktop Footer --- */}
            <footer className={styles.desktopFooter}>
                <div className={styles.footerContent}>
                    <div className={styles.footerSection}>
                        <h2>Evently</h2>
                        <p>&copy; {new Date().getFullYear()} Evently. A demonstration project.</p>
                    </div>
                    <div className={styles.footerSection}>
                        <h3>Navigate</h3>
                        <ul className={styles.footerLinks}>
                            <li><NavLink to="/">Home</NavLink></li>
                            <li><NavLink to="/past-events">Past Events</NavLink></li>
                            {user && <li><NavLink to="/bookings">My Bookings</NavLink></li>}
                        </ul>
                    </div>
                    <div className={styles.footerSection}>
                        <h3>Follow Us</h3>
                        <ul className={styles.footerLinks}>
                            <li><button>Facebook</button></li>
                            <li><button>Twitter</button></li>
                            <li><button>Instagram</button></li>
                        </ul>
                    </div>
                </div>
            </footer>

            {/* --- Mobile Navigation Bar --- */}
            <footer className={styles.mobileFooter}>
                <NavLink to="/" end className={({ isActive }) => isActive ? `${styles.mobileNavLink} ${styles.active}` : styles.mobileNavLink}>
                    <HomeIcon />
                    <span>Home</span>
                </NavLink>
                <NavLink to="/past-events" className={({ isActive }) => isActive ? `${styles.mobileNavLink} ${styles.active}` : styles.mobileNavLink}>
                    <PastIcon />
                    <span>Past Events</span>
                </NavLink>
                {user && (
                    <NavLink to="/bookings" className={({ isActive }) => isActive ? `${styles.mobileNavLink} ${styles.active}` : styles.mobileNavLink}>
                        <BookingsIcon />
                        <span>My Bookings</span>
                    </NavLink>
                )}
                {getDashboardLink()}
                <NavLink to="/profile" className={({ isActive }) => isActive ? `${styles.mobileNavLink} ${styles.active}` : styles.mobileNavLink}>
                    <ProfileIcon />
                    <span>{user ? 'Profile' : 'Sign In'}</span>
                </NavLink>
            </footer>
        </>
    );
};

export default Footer;
