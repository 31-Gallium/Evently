import React, { useState, useEffect } from 'react';
import styles from './AdminStatsDashboard.module.css';
import StatCard from './StatCard';
import BarChart from './BarChart';
import ReactECharts from 'echarts-for-react';
import { IconUsers, IconCalendar, IconTicket } from '../../utils/Icons';
import { SkeletonStatCard } from '../skeletons';
import { getAuthHeader } from '../../utils/auth';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const AdminStatsDashboard = ({ user }) => {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            if (!user) return;
            try {
                const headers = await getAuthHeader();
                const res = await fetch(`${API_BASE_URL}/admin/stats`, { headers });
                if (!res.ok) throw new Error('Failed to fetch stats');
                const data = await res.json();
                setStats(data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchStats();
    }, [user]);

    if (!stats) {
        return (
            <div className={styles.statsGrid}>
                <SkeletonStatCard />
                <SkeletonStatCard />
                <SkeletonStatCard />
                <SkeletonStatCard />
            </div>
        );
    }

    const formattedRevenue = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(stats.totalRevenue);

    const userRolesData = stats?.userRoleDistribution ? [
        { name: 'Admin', value: stats.userRoleDistribution.ADMIN || 0 },
        { name: 'Organizer', value: stats.userRoleDistribution.ORGANIZER || 0 },
        { name: 'User', value: stats.userRoleDistribution.USER || 0 },
    ] : [];

    const aggregateData = (data) => {
        if (!data) return [];
        const aggregated = data.reduce((acc, item) => {
            const date = new Date(item.date).toLocaleDateString('en-IN');
            if (!acc[date]) {
                acc[date] = { name: date, value: 0 };
            }
            acc[date].value += item.count;
            return acc;
        }, {});
        return Object.values(aggregated);
    };

    const userSignups = aggregateData(stats.userSignupsLast30Days);
    const bookings = aggregateData(stats.bookingsLast30Days);

    const pieChartOption = {
        title: {
            text: 'User Roles',
            left: 'center'
        },
        tooltip: {
            trigger: 'item'
        },
        legend: {
            orient: 'vertical',
            left: 'left',
        },
        series: [
            {
                name: 'User Roles',
                type: 'pie',
                radius: '50%',
                data: userRolesData,
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }
        ]
    };

    return (
        <div className={styles.dashboardContainer}>
            <div className={styles.statsGrid}>
                <StatCard title="Total Users" value={stats.totalUsers} icon={<IconUsers />} />
                <StatCard title="Upcoming Events" value={stats.upcomingEvents} icon={<IconCalendar />} />
                <StatCard title="Total Bookings" value={stats.totalBookings} icon={<IconTicket />} />
                <StatCard title="Total Revenue" value={formattedRevenue} icon={"₹"} />
            </div>
            <div className={styles.chartsGrid}>
                <div className={styles.chartContainer}>
                    <BarChart title="New Users (Last 30 Days)" data={userSignups} />
                </div>
                <div className={styles.chartContainer}>
                    <BarChart title="Bookings (Last 30 Days)" data={bookings} />
                </div>
                <div className={styles.chartContainer}>
                    {userRolesData.length > 0 && <ReactECharts option={pieChartOption} />}
                </div>
            </div>
            <div className={styles.popularEventsContainer}>
                <h2>Most Popular Events</h2>
                <div className={styles.eventGrid}>
                    {stats.popularEvents && stats.popularEvents.length > 0 ? (
                        stats.popularEvents.map(event => (
                            <div key={event.id} className={styles.eventCard}>
                                <div className={styles.cardHeader}>
                                    <span className={styles.eventName}>{event.name}</span>
                                </div>
                                <div className={styles.cardBody}>
                                    <p>Date: {new Date(event.date).toLocaleDateString('en-IN')}</p>
                                    <p>Sold / Capacity: {event.ticketsSold} / {event.capacity}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>No popular events found.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminStatsDashboard;