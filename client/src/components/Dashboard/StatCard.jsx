import React from 'react';
import styles from '../../App.module.css';

const StatCard = ({ title, value, icon }) => ( 
    <div className={styles.statCard}>
        <div className={styles.statIcon}>{icon}</div>
        <div className={styles.statInfo}>
            <span className={styles.statValue}>{value}</span>
            <span className={styles.statTitle}>{title}</span>
        </div>
    </div> 
);

export default StatCard;