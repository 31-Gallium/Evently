import React, { useMemo } from 'react';
import useTrendingEventsStore from '../store/trendingEventsStore';
import useUpcomingEventsStore from '../store/upcomingEventsStore';
import useAllEventsStore from '../store/allEventsStore';
import useBestSellingStore from '../store/bestSellingStore';
import useCategoryStore from '../store/categoryStore';

import HeroSection from '../components/HeroSection';
import EventCarousel from '../components/EventCarousel';
import OrganizerCTA from '../components/OrganizerCTA';

const HomePage = () => {
    const { trendingEvents } = useTrendingEventsStore();
    const { upcomingEvents } = useUpcomingEventsStore();
    const { bestSellingEvents } = useBestSellingStore();
    const { allEvents, eventsLoading } = useAllEventsStore();
    const { tagCounts } = useCategoryStore();

    const featuredEvent = [...upcomingEvents, ...trendingEvents].find(e => e.imageUrl) || upcomingEvents?.[0];

    // Logic to determine dynamic categories
    const { mainCategoryEvents, otherEvents } = useMemo(() => {
        const mainCategories = Object.entries(tagCounts)
            .filter(([, count]) => count >= 12)
            .map(([tag]) => tag);

        const mainCategorySet = new Set(mainCategories);
        const eventsInMainCategories = new Set();

        const mainCategoryEvents = mainCategories.map(category => ({
            title: category,
            events: allEvents.filter(event => {
                const eventTags = event.tags ? event.tags.split(',').map(t => t.trim()) : [];
                const isInThisCategory = eventTags.includes(category);
                if (isInThisCategory) {
                    eventsInMainCategories.add(event.id);
                }
                return isInThisCategory;
            })
        }));

        const otherEvents = allEvents.filter(event => !eventsInMainCategories.has(event.id));

        return { mainCategoryEvents };
    }, [tagCounts, allEvents]);


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
                        <EventCarousel title="Best Selling" events={bestSellingEvents} />
                        
                        {mainCategoryEvents.map(category => (
                            <EventCarousel key={category.title} title={category.title} events={category.events} />
                        ))}
                    </>
                )}
            </div>
            <OrganizerCTA />
        </>
    );
};

export default HomePage;
