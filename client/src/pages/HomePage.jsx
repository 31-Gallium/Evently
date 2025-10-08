
import React from 'react';
import useTrendingEventsStore from '../store/trendingEventsStore';
import useUpcomingEventsStore from '../store/upcomingEventsStore';
import useAllEventsStore from '../store/allEventsStore';
import { useAuth } from '../context/AuthContext';
import HeroSection from '../components/HeroSection';
import EventCarousel from '../components/EventCarousel';
import OrganizerCTA from '../components/OrganizerCTA';

const HomePage = () => {
    const { trendingEvents } = useTrendingEventsStore();
  const { upcomingEvents } = useUpcomingEventsStore();
  const { eventsLoading } = useAllEventsStore();
    const featuredEvent = trendingEvents?.[0];

    return (
        <>
            <HeroSection featuredEvent={featuredEvent} />
            <div className="container">
                {eventsLoading ? (
                    <p>Loading...</p>
                ) : (
                    <>
                        <EventCarousel title="Upcoming Events" events={upcomingEvents} />
                        <EventCarousel title="Trending Events" events={trendingEvents} />
                    </>
                )}
            </div>
            <OrganizerCTA />
        </>
    );
};

export default HomePage;