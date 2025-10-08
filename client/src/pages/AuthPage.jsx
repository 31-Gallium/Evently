import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup
} from "firebase/auth";
import { auth } from '../firebase';
import styles from './AuthPage.module.css';
import { getAuthHeader } from '../utils/auth';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Google Icon SVG
const GoogleIcon = () => (
    <svg viewBox="0 0 48 48" width="24px" height="24px">
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C42.021,35.596,44,30.038,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
    </svg>
);

const AuthForm = ({ isLoginPage, onSwitch }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/";

    const handleAuthSuccess = async (user) => {
        // This function is called after any successful Firebase auth action
        const headers = await getAuthHeader();
        await fetch(`${API_BASE_URL}/users`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ email: user.email })
        });
        navigate(from, { replace: true });
    };

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const authFn = isLoginPage ? signInWithEmailAndPassword : createUserWithEmailAndPassword;

        try {
            const userCredential = await authFn(auth, email, password);
            await handleAuthSuccess(userCredential.user);
        } catch (err) {
            // Convert Firebase error codes to friendly messages
            let friendlyError = 'An unexpected error occurred. Please try again.';
            switch (err.code) {
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                    friendlyError = 'Incorrect email or password. Please try again.';
                    break;
                case 'auth/email-already-in-use':
                    friendlyError = 'An account with this email address already exists.';
                    break;
                case 'auth/weak-password':
                    friendlyError = 'The password is too weak. It must be at least 6 characters long.';
                    break;
            }
            setError(friendlyError);
        }
    };

    const handleGoogleSignIn = async () => {
        setError('');
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            await handleAuthSuccess(result.user);
        } catch (error) {
            // Handle common popup errors
            if (error.code !== 'auth/popup-closed-by-user') {
                setError('Failed to sign in with Google. Please try again.');
            }
        }
    };

    return (
        <div className={styles.authFormContainer}>
            <h2 className={styles.authTitle}>{isLoginPage ? 'Sign In' : 'Create Account'}</h2>
            
            <button className={styles.googleButton} onClick={handleGoogleSignIn}>
                <GoogleIcon />
                <span>{isLoginPage ? 'Sign in with Google' : 'Sign up with Google'}</span>
            </button>

            <div className={styles.divider}>OR</div>

            <form onSubmit={handleEmailSubmit} className={styles.authForm}>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email Address"
                    required
                    className={styles.authInput}
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                    className={styles.authInput}
                />
                {error && <p className={styles.authError}>{error}</p>}
                <button type="submit" className={styles.authButton}>
                    {isLoginPage ? 'Sign In' : 'Sign Up'}
                </button>
            </form>
            <p className={styles.authSwitch}>
                {isLoginPage ? "Don't have an account?" : "Already have an account?"}
                <button onClick={onSwitch} className={styles.authSwitchButton}>
                    {isLoginPage ? 'Sign Up' : 'Sign In'}
                </button>
            </p>
        </div>
    );
};

const AuthPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const isLoginPage = location.pathname === '/login';

    return (
        <div className={styles.authPageContainer}>
            <Link to="/" style={{ position: 'absolute', top: '2rem', left: '2rem', color: 'var(--text-primary)', textDecoration: 'none', fontSize: '1.5rem', fontWeight: 'bold' }}>Evently</Link>
            <AuthForm
                isLoginPage={isLoginPage}
                onSwitch={() => navigate(isLoginPage ? '/signup' : '/login')}
            />
        </div>
    );
};

export default AuthPage;
