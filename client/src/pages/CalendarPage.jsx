import React from 'react';
import CalendarView from '../components/Calendar/CalendarView';
import styles from './CalendarPage.module.css';

const CalendarPage = () => {
  return (
    <div className={styles.pageContainer}>
      <CalendarView />
    </div>
  );
};


export default CalendarPage;
