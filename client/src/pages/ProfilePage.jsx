import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { signOut } from "firebase/auth";
import { auth } from '../firebase';
import styles from './AuthPage.module.css'; // Re-using some styles for consistency

const ProfilePage = () => {
    const { user, userProfile } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/'); // Navigate to home page after logout
        } catch (error) {
            console.error("Error signing out: ", error);
        }
    };

    if (!user) {
        // This should ideally be handled by the ProtectedRoute, but as a fallback:
        navigate('/login');
        return null;
    }

    return (
        <div className={styles.authPageContainer} style={{ justifyContent: 'center' }}>
            <div className={styles.authFormContainer}>
                <h2 className={styles.authTitle}>Profile</h2>
                <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                    <p>You are signed in as:</p>
                    <p><strong>{user.email}</strong></p>
                    <p>(Role: {userProfile?.role})</p>
                </div>
                <button onClick={handleLogout} className={styles.authButton} style={{ backgroundColor: 'var(--danger-color)' }}>
                    Logout
                </button>
            </div>
        </div>
    );
};

export default ProfilePage;
