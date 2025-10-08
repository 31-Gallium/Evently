import React, { useState, useEffect, useContext } from 'react';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import 'flatpickr/dist/themes/dark.css';
import styles from './CalendarView.module.css';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import EventFormModal from './EventFormModal';

const truncate = (str, n) => {
    return (str.length > n) ? str.substr(0, n-1) + "..." : str;
};

const processOverlappingEvents = (events) => {
    if (!events || events.length === 0) {
        return [];
    }

    const sortedEvents = events.sort((a, b) => new Date(a.date) - new Date(b.date));

    const eventGroups = [];
    let currentGroup = [sortedEvents[0]];

    for (let i = 1; i < sortedEvents.length; i++) {
        const currentEvent = sortedEvents[i];
        const lastEventInGroup = currentGroup[currentGroup.length - 1];

        const currentEventStart = new Date(currentEvent.date);
        const lastEventStart = new Date(lastEventInGroup.date);
        const lastEventEnd = new Date(lastEventStart.getTime() + 60 * 60 * 1000); // Assume 1 hour duration

        if (currentEventStart < lastEventEnd) {
            currentGroup.push(currentEvent);
        } else {
            eventGroups.push(currentGroup);
            currentGroup = [currentEvent];
        }
    }
    eventGroups.push(currentGroup);

    return eventGroups;
};

const pillColors = ['#2563eb', '#ca8a04', '#9333ea', '#d97706', '#059669'];

const getColorForEvent = (eventId) => {
    const hash = eventId.toString().split('').reduce((acc, char) => {
        return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    const index = Math.abs(hash % pillColors.length);
    return pillColors[index];
};

const CalendarView = ({ events: propEvents }) => {
    const { user, userProfile } = useAuth();
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [selectedDateStr, setSelectedDateStr] = useState('');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [currentView, setCurrentView] = useState('month');
    const [events, setEvents] = useState({});

    const openModal = (dateStr, event = null) => {
        setSelectedDateStr(dateStr);
        setSelectedEvent(event);
        setIsModalOpen(true);
    }

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedEvent(null);
        setSelectedDateStr('');
    }

    const headerText = () => {
        const year = currentDate.getFullYear();
        const monthName = currentDate.toLocaleString('default', { month: 'long' });
        switch (currentView) {
            case 'month':
                return `${monthName} ${year}`;
            case 'week':
                const weekStart = new Date(currentDate);
                weekStart.setDate(weekStart.getDate() - weekStart.getDay());
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekEnd.getDate() + 6);
                return `${weekStart.toLocaleDateString('default', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('default', { month: 'short', day: 'numeric' })}, ${year}`;
            case 'day':
                return currentDate.toLocaleDateString('default', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            case 'agenda':
                return 'Agenda';
            default:
                return '';
        }
    }

    const handleViewChange = (view) => {
        setCurrentView(view);
    }

    const handlePrev = () => {
        const newDate = new Date(currentDate);
        if (currentView === 'month') newDate.setMonth(newDate.getMonth() - 1);
        else if (currentView === 'week') newDate.setDate(newDate.getDate() - 7);
        else if (currentView === 'day') newDate.setDate(newDate.getDate() - 1);
        setCurrentDate(newDate);
    }

    const handleNext = () => {
        const newDate = new Date(currentDate);
        if (currentView === 'month') {
            newDate.setMonth(newDate.getMonth() + 1, 1);
        } else if (currentView === 'week') {
            newDate.setDate(newDate.getDate() + 7);
        } else if (currentView === 'day') {
            newDate.setDate(newDate.getDate() + 1);
        }
        setCurrentDate(newDate);
    }

    const handleToday = () => {
        setCurrentDate(new Date());
    }

    useEffect(() => {
        const processEvents = (eventsData) => {
            console.log("Processing events:", eventsData);
            const eventsByDate = eventsData.reduce((acc, event) => {
                const dateStr = new Date(event.date).toISOString().split('T')[0];
                if (!acc[dateStr]) {
                    acc[dateStr] = [];
                }
                acc[dateStr].push(event);
                return acc;
            }, {});
            console.log("Processed events by date:", eventsByDate);
            setEvents(eventsByDate);
        }

        console.log("CalendarView useEffect triggered");
        console.log("user:", user);
        console.log("propEvents:", propEvents);

import { getAuthHeader } from '../../utils/auth';

// ... (imports)

const CalendarView = ({ events: propEvents }) => {
    // ... (state)

    useEffect(() => {
        const processEvents = (eventsData) => {
            // ... (logic)
        }

        if (propEvents) {
            processEvents(propEvents);
        } else {
            const fetchEvents = async () => {
                try {
                    const headers = await getAuthHeader();
                    const response = await fetch(`/api/calendar/events`, { headers });
                    if (!response.ok) {
                        throw new Error('Failed to fetch events');
                    }
                    const data = await response.json();
                    processEvents(data);
                } catch (error) {
                    console.error(error);
                }
            };

            if (user) {
                fetchEvents();
            }
        }
    }, [user, propEvents]);

    // ... (rest of the component)
};

    const renderMonthView = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1);
        const startDayIndex = firstDayOfMonth.getDay();
        const prevMonthEndDate = new Date(year, month, 0);
        const prevMonthDays = prevMonthEndDate.getDate();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const grid = [];

        for (let i = startDayIndex; i > 0; i--) {
            const day = prevMonthDays - i + 1;
            grid.push(<div key={`prev-${day}`} className={`${styles.day} ${styles.prevMonth}`}>{day}</div>);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateStr = date.toISOString().split('T')[0];
            const isToday = date.toDateString() === today.toDateString();
            const isPast = date < today;
            grid.push(
                <div key={dateStr} className={`${styles.day} ${isToday ? styles.today : ''} ${isPast ? styles.disabled : ''}`} onClick={() => { if (!isPast) { setCurrentDate(date); setCurrentView('day'); } }}>
                    <span>{day}</span>
                    <div className={styles.events}>
                        {(events[dateStr] || []).slice(0, 3).map((event, index) => (
                            <div key={event.id} className={`${styles.event} ${styles.eventPill}`} style={{ backgroundColor: getColorForEvent(event.id) }}>{truncate(event.name, 31)}</div>
                        ))}
                    </div>
                </div>
            );
        }

        return (
            <div className={styles.monthGridContainer}>
                <div className={styles.monthGrid}>{grid}</div>
            </div>
        );
    }

    const renderDayWeekView = (isWeek) => {
        const days = isWeek ? Array.from({length: 7}, (_, i) => { const d = new Date(currentDate); d.setDate(d.getDate() - d.getDay() + i); return d; }) : [new Date(currentDate)];
        const timeSlots = Array.from({ length: 24 }, (_, i) => i);

        return (
            <div className={styles.dayWeekView}>
                <div className={styles.timeColumn}>
                    <div className={styles.allDayLabel}>All-day</div>
                                        {timeSlots.map(hour => {
                        const today = new Date();
                        const isPast = new Date(currentDate).setHours(hour, 0, 0, 0) < today.getTime();
                        return (
                            <div key={hour} className={`${styles.timeLabel} ${isPast ? styles.disabled : ''}`} onClick={() => {
                                if (!isPast && (userProfile?.role === 'ADMIN' || userProfile?.role === 'ORGANIZER')) {
                                    const date = new Date(currentDate);
                                    date.setHours(hour, 0);
                                    openModal(date.toISOString());
                                }
                            }}>{`${hour}:00`}</div>
                        )
                    })}
                </div>
                <div className={styles.dayWeekGridContainer}>
                    <div className={styles.dayWeekGrid} style={{gridTemplateColumns: `repeat(${days.length}, 1fr)`}}>
                        {days.map(day => {
                            const dateStr = day.toISOString().split('T')[0];
                            const dayEvents = events[dateStr] || [];
                            const allDayEvents = dayEvents.filter(e => new Date(e.date).getHours() === 0 && new Date(e.date).getMinutes() === 0);
                            const timedEvents = dayEvents.filter(e => !allDayEvents.includes(e));

                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            const isPast = day < today;

                            return (
                                <div key={dateStr} className={`${styles.dayColumn} ${isPast ? styles.disabled : ''}`}>
                                    <div className={styles.dayHeader}>{day.toLocaleDateString('default', { weekday: 'short' })}, {day.getDate()}</div>
                                    <div className={styles.allDayEvents}>
                                        {allDayEvents.map((event, index) => <div key={event.id} className={`${styles.allDayEvent} ${styles.eventPill}`} style={{ backgroundColor: getColorForEvent(event.id) }} onClick={() => !isPast && navigate(`/event/${event.id}`)}>{truncate(event.name, 31)}</div>)}
                                    </div>
                                    <div className={styles.timedEventsContainer} onClick={(e) => {
                                        if (!isPast && (userProfile?.role === 'ADMIN' || userProfile?.role === 'ORGANIZER')) {
                                            const rect = e.currentTarget.getBoundingClientRect();
                                            const offsetY = e.clientY - rect.top;
                                            const hour = Math.floor(offsetY / 60);
                                            const minutes = Math.floor((offsetY % 60) / 15) * 15;
                                            const date = new Date(dateStr);
                                            date.setHours(hour, minutes);
                                            openModal(date.toISOString());
                                        }
                                    }}>
                                        {timeSlots.map(hour => <div key={hour} className={styles.timeSlot}></div>)}
                                        {processOverlappingEvents(timedEvents).map((group, groupIndex) => (
                                            group.map((event, eventIndex) => {
                                                const start = new Date(event.date);
                                                const top = (start.getHours() * 60 + start.getMinutes());
                                                const height = 60; // Assume 1 hour duration
                                                const width = 100 / group.length;
                                                const left = width * eventIndex;

                                                return (
                                                    <div
                                                        key={event.id}
                                                        className={`${styles.timedEvent} ${styles.eventPill}`}
                                                        style={{
                                                            top: `${top}px`,
                                                            height: `${height}px`,
                                                            width: `${width}%`,
                                                            left: `${left}%`,
                                                            backgroundColor: getColorForEvent(event.id)
                                                        }}
                                                        onClick={() => !isPast && navigate(`/event/${event.id}`)}
                                                    >
                                                        {truncate(event.name, 31)}
                                                    </div>
                                                );
                                            })
                                        ))}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className={styles.app}>
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <h1 className={styles.headerText}>{headerText()}</h1>
                </div>
                <div className={styles.headerRight}>
                    <div className={styles.viewButtons}>
                        <button onClick={() => handleViewChange('day')} className={`${styles.viewBtn} ${currentView === 'day' ? styles.active : ''}`} data-view="day">Day</button>
                        <button onClick={() => handleViewChange('week')} className={`${styles.viewBtn} ${currentView === 'week' ? styles.active : ''}`} data-view="week">Week</button>
                        <button onClick={() => handleViewChange('month')} className={`${styles.viewBtn} ${currentView === 'month' ? styles.active : ''}`} data-view="month">Month</button>
                        <button onClick={() => handleViewChange('agenda')} className={`${styles.viewBtn} ${currentView === 'agenda' ? styles.active : ''}`} data-view="agenda">Agenda</button>
                    </div>
                    <span onClick={handleToday} className={styles.todayButton}>Today</span>
                    <div className={styles.navButtons}>
                        <button onClick={handlePrev} className={styles.navBtn}>
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                        </button>
                        <button onClick={handleNext} className={styles.navBtn}>
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                        </button>
                    </div>
                </div>
            </div>

            <div className={styles.calendarContainer}>
                {currentView === 'month' && renderMonthView()}
                {currentView === 'week' && renderDayWeekView(true)}
                {currentView === 'day' && renderDayWeekView(false)}
            </div>

            {isModalOpen && (
                <EventFormModal
                    event={selectedEvent}
                    dateStr={selectedDateStr}
                    onClose={closeModal}
                    userRole={userProfile?.role}
                />
            )}
        </div>
    );
}

export default CalendarView;