import React from 'react';
import useTrendingEventsStore from '../store/trendingEventsStore';
import useUpcomingEventsStore from '../store/upcomingEventsStore';
import useAllEventsStore from '../store/allEventsStore';
import useTechEventsStore from '../store/techEventsStore';
import useMusicEventsStore from '../store/musicEventsStore';

import HeroSection from '../components/HeroSection';
import EventCarousel from '../components/EventCarousel';
import OrganizerCTA from '../components/OrganizerCTA';

const HomePage = () => {
    const { trendingEvents } = useTrendingEventsStore();
    const { upcomingEvents } = useUpcomingEventsStore();
    const { techEvents } = useTechEventsStore();
    const { musicEvents } = useMusicEventsStore();
    const { eventsLoading } = useAllEventsStore();
    
    // Use a more reliable featured event, e.g., the first upcoming event with an image
    const featuredEvent = [...upcomingEvents, ...trendingEvents].find(e => e.imageUrl) || trendingEvents?.[0] || upcomingEvents?.[0];

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
                        <EventCarousel title="Top in Tech" events={techEvents} />
                        <EventCarousel title="Music & Concerts" events={musicEvents} />
                    </>
                )}
            </div>
            <OrganizerCTA />
        </>
    );
};

export default HomePage;