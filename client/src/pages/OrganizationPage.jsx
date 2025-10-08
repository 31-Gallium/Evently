import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import StandardEventCard from '../components/StandardEventCard';

const OrganizationPage = () => {
    const { organizerName } = useParams();
    const [pageData, setPageData] = useState({ organizationName: '', upcomingEvents: [], pastEvents: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { userBookings } = useAuth();

    useEffect(() => {
        // Decode the name from URL format back to a readable string for the title
        const decodedName = decodeURIComponent(organizerName).replace(/-/g, ' ');
        setPageData(prev => ({ ...prev, organizationName: decodedName }));

        const fetchOrgEvents = async () => {
            setLoading(true);
            try {
                const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
// ...
const response = await fetch(`${API_BASE_URL}/organization/${organizerName}`);
                if (!response.ok) throw new Error(`Could not find organization.`);
                const data = await response.json();
                setPageData(data);
            } catch (e) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };
        fetchOrgEvents();
    }, [organizerName]);

    if (loading) return <div className="page-container"><p>Loading events...</p></div>;
    if (error) return <div className="page-container"><h2 className="page-title">Error</h2><p>{error}</p></div>;
    
    const { upcomingEvents, pastEvents } = pageData;

    return (
        <div className="page-container" style={{paddingTop: '70px'}}>
            <h1 className="page-title">{pageData.organizationName}</h1>

            {upcomingEvents.length > 0 && (
                <section>
                    <h2 className="section-title" style={{fontSize: '1.5rem', paddingLeft: 0, border: 'none'}}>Upcoming Events</h2>
                    <motion.div layout className="event-grid">
                        {upcomingEvents.map((event) => (
                            <StandardEventCard
                                key={event.id}
                                event={event}
                                isBooked={userBookings.has(event.id)}
                            />
                        ))}
                    </motion.div>
                </section>
            )}

            {pastEvents.length > 0 && (
                 <section style={{marginTop: '3rem'}}>
                    <h2 className="section-title" style={{fontSize: '1.5rem', paddingLeft: 0, border: 'none'}}>Past Events</h2>
                    <motion.div layout className="event-grid">
                        {pastEvents.map((event) => (
                            <StandardEventCard
                                key={event.id}
                                event={event}
                                isBooked={userBookings.has(event.id)}
                                isPast={true}
                            />
                        ))}
                    </motion.div>
                </section>
            )}
            
            {!loading && upcomingEvents.length === 0 && pastEvents.length === 0 && (
                <p>This organization has no published events.</p>
            )}
        </div>
    );
};

export default OrganizationPage;