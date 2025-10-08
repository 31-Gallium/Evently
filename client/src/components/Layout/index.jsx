import React from 'react';
import { Outlet } from 'react-router-dom';
import TopBar from '../TopBar';
import Footer from '../Footer';
import styles from './Layout.module.css';

const Layout = () => {
    return (
        <div className={styles.appLayout}>
            <TopBar />
            <main className={styles.mainContent}>
                <Outlet />
            </main>

        </div>
    );
};

export default Layout;