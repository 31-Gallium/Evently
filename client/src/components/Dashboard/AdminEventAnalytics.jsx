import { useState, useEffect } from 'react';
import { IconTicket, IconUsers } from '../../utils/Icons';
import styles from './AdminDashboard.module.css';
import StatCard from './StatCard';
import BarChart from './BarChart';
import { getAuthHeader } from '../../utils/auth';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const AdminEventAnalytics = ({ eventId, onBack }) => {
    const [analytics, setAnalytics] = useState(null);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const headers = await getAuthHeader();
                const res = await fetch(`${API_BASE_URL}/admin/events/${eventId}/analytics`, { headers });
                if (!res.ok) throw new Error('Failed to fetch analytics');
                setAnalytics(await res.json());
            } catch (err) {
                console.error(err);
            }
        };
        if (eventId) {
            fetchAnalytics();
        }
    }, [eventId]);

    const exportToCsv = () => {
        if (!analytics || !analytics.attendeeList) return;
        let csvContent = "data:text/csv;charset=utf-8,Email,Booked At\n";
        analytics.attendeeList.forEach(attendee => {
            const row = `"${attendee.email}","${new Date(attendee.bookedAt).toLocaleString('en-IN')}"`;
            csvContent += row + "\n";
        });
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `attendees_${analytics.eventDetails.name.replace(/ /g, "_")}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (!analytics || !analytics.eventDetails) {
        return <div className={styles.pageContainer}><p>Loading event analytics...</p></div>;
    }

    const { eventDetails, totalRevenue, attendeeList, waitlistCount, salesOverTime } = analytics;
    const formattedRevenue = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(totalRevenue);

    return (
        <div className={styles.pageContainer}>
            <button onClick={onBack} className={styles.backButton}>&larr; Back to Dashboard</button>
            <div className={styles.adminHeader}>
                <h2>{eventDetails.name}</h2>
                <button onClick={exportToCsv} className={styles.createButton}>Export Attendees (CSV)</button>
            </div>
            <div className={styles.statsGrid}>
                <StatCard title="Total Revenue" value={formattedRevenue} icon={"₹"} />
                <StatCard title="Tickets Sold" value={`${eventDetails.ticketsSold} / ${eventDetails.capacity}`} icon={<IconTicket />} />
                <StatCard title="Attendees" value={attendeeList.length} icon={<IconUsers />} />
                <StatCard title="On Waitlist" value={waitlistCount} icon={<IconUsers />} />
            </div>
            <div className={styles.chartsGrid}>
                <BarChart title="Ticket Sales Over Time" data={salesOverTime} />
            </div>
            <div className={styles.adminHeader} style={{ marginTop: '3rem' }}>
                <h2>Attendees ({attendeeList.length})</h2>
            </div>
            <div className={styles.tableContainer}>
                <table className={styles.adminTable}>
                    <thead>
                        <tr>
                            <th>Email</th>
                            <th>Booking Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {attendeeList.map((attendee, i) => (
                            <tr key={i}>
                                <td>{attendee.email}</td>
                                <td>{new Date(attendee.bookedAt).toLocaleString('en-IN')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminEventAnalytics;