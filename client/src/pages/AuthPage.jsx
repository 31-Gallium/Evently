import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from '../firebase';
import styles from './AuthPage.module.css';
import { getAuthHeader } from '../utils/auth';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const AuthForm = ({ isLoginPage, onSwitch }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/";

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const authFn = isLoginPage ? signInWithEmailAndPassword : createUserWithEmailAndPassword;

        try {
            const userCredential = await authFn(auth, email, password);
            
            // If it's a new user, create a profile on the backend
            if (!isLoginPage) {
                const headers = await getAuthHeader();
                await fetch(`${API_BASE_URL}/users`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({ email: userCredential.user.email })
                });
            }
            
            navigate(from, { replace: true });

        } catch (err) {
            // Firebase provides descriptive error messages
            setError(err.message);
        }
    };

    return (
        <div className={styles.authFormContainer}>
            <h2 className={styles.authTitle}>{isLoginPage ? 'Sign In' : 'Create Account'}</h2>
            <form onSubmit={handleSubmit} className={styles.authForm}>
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