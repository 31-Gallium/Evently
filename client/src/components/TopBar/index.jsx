import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { signOut } from "firebase/auth";
import { auth } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import styles from './TopBar.module.css';
import OrganizerRequestModal from '../OrganizerRequestModal';
import SearchBar from '../SearchBar';

const Icons = {
    moon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path></svg>,
    sun: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path></svg>,
    user: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>,
    chevronDown: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>,
    plus: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>,
};

const TopBar = () => {
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isOrganizerModalOpen, setIsOrganizerModalOpen] = useState(false);
    const { user, userRole, userProfile, refetchProfile } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const appLayout = document.querySelector('.appLayout_appLayout__p3_Y4');
        const handleScroll = (event) => {
            setIsScrolled(event.target.scrollTop > 0);
        };

        appLayout?.addEventListener('scroll', handleScroll);

        return () => {
            appLayout?.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const handleLogout = async () => {
        try { await signOut(auth); navigate('/'); } 
        catch (error) { console.error("Error signing out: ", error); }
    };

    const getDashboardLinkText = () => {
        if (userRole === 'ADMIN') return 'Admin Dashboard';
        if (userRole === 'ORGANIZER') return 'My Events';
        return null;
    }

    const handleOpenOrganizerModal = () => {
        setUserDropdownOpen(false);
        setIsOrganizerModalOpen(true);
    };

    return (
        <header className={`${styles.topBar} ${isScrolled ? styles.scrolled : ''}`}>
            <div className={styles.topBarLeft}>
                <h1 onClick={() => navigate('/')}>Evently</h1>
                <nav className={styles.topBarNav}>
                    <Link to="/" className={styles.navLink}>Home</Link>
                    <Link to="/past-events" className={styles.navLink}>Past Events</Link>
                    {user && userRole !== 'ADMIN' && <Link to="/bookings" className={styles.navLink}>My Bookings</Link>}
                    {getDashboardLinkText() && <Link to="/dashboard" className={styles.navLink}>{getDashboardLinkText()}</Link>}
                </nav>
            </div>
            <div className={styles.topBarCenter}>
                <SearchBar />
            </div>
            <div className={styles.topBarRight}>
                {(userRole === 'ADMIN' || userRole === 'ORGANIZER') && (<button title="Create Event" className={styles.iconButton} onClick={() => navigate('/dashboard')}>{Icons.plus}</button>)} 
                {user ? (
                    <div className={styles.dropdown}>
                        <button onClick={() => setUserDropdownOpen(o => !o)} className={styles.dropdownToggle}>{Icons.user}{Icons.chevronDown}</button>
                        {userDropdownOpen && 
                            <div className={styles.dropdownMenu}>
                                {userRole === 'USER' && userProfile?.organizerRequestStatus !== 'PENDING' && (
                                    <div className={styles.dropdownItem} onClick={handleOpenOrganizerModal}>
                                        Become an Organizer
                                    </div>
                                )}
                                {userRole === 'USER' && userProfile?.organizerRequestStatus === 'PENDING' && (
                                    <div className={styles.dropdownItem} style={{ opacity: 0.5, cursor: 'not-allowed' }} title="Your request is pending review.">
                                        Request Pending...
                                    </div>
                                )}
                                <div className={styles.dropdownItem} onClick={handleLogout}>Logout</div>
                            </div>
                        }
                    </div>
                ) : (
                    <button onClick={() => navigate('/login')} className={styles.loginButton}>Sign In</button>
                )}
            </div>
            {isOrganizerModalOpen && <OrganizerRequestModal onClose={() => setIsOrganizerModalOpen(false)} />}
        </header>
    );
};

export default TopBar;