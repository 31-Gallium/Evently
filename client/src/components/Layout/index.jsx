import React, { useRef } from 'react';
import { Outlet } from 'react-router-dom';
import TopBar from '../TopBar';
import Footer from '../Footer';
import styles from './Layout.module.css';

const Layout = () => {
    const scrollableContainerRef = useRef(null);

    return (
        <div className={styles.appLayout} ref={scrollableContainerRef}>
            <TopBar scrollableContainerRef={scrollableContainerRef} />
            <main className={styles.mainContent}>
                <Outlet />
            </main>
            <Footer />

        </div>
    );
};

export default Layout;