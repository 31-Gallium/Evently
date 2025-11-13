import React, { useRef, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import TopBar from '../TopBar';
import Footer from '../Footer';
import styles from './Layout.module.css';
import useScrollStore from '../../store/scrollStore';
import ParticlesComponent from '../Particles';

const Layout = () => {
    const scrollableContainerRef = useRef(null);
    const isScrolled = useScrollStore((state) => state.isScrolled);
    const setIsScrolled = useScrollStore((state) => state.setIsScrolled);

    useEffect(() => {
        const scrollableContainer = scrollableContainerRef.current;
        const handleScroll = (event) => {
            setIsScrolled(event.target.scrollTop > 0);
        };

        scrollableContainer?.addEventListener('scroll', handleScroll);

        return () => {
            scrollableContainer?.removeEventListener('scroll', handleScroll);
        };
    }, [setIsScrolled]);

    return (
        <div className={`${styles.appLayout} ${isScrolled ? styles.scrolled : ''}`} ref={scrollableContainerRef}>
            <ParticlesComponent />
            <TopBar />
            <main className={styles.mainContent}>
                <Outlet />
            </main>
            <Footer />

        </div>
    );
};

export default Layout;