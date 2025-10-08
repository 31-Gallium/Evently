import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SearchEventCard from '../components/SearchEventCard';
import { motion } from 'framer-motion';
import useAllEventsStore from '../store/allEventsStore';
import './SearchPage.css';

// --- Skeleton Loader Components ---
const SkeletonSearchCard = () => (
    <div className="skeleton-search-card" />
);

const SkeletonGrid = () => (
    <div className="search-results-grid">
        {Array.from({ length: 12 }).map((_, i) => <SkeletonSearchCard key={i} />)}
    </div>
);


const SearchPage = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q');
    const { userBookings } = useAuth();
    const { allEvents, eventsLoading } = useAllEventsStore();

    const searchResults = useMemo(() => {
        if (!query || !allEvents) return [];
        const lowercasedQuery = query.toLowerCase();
        return allEvents.filter(event => 
            event.name.toLowerCase().includes(lowercasedQuery) ||
            event.description.toLowerCase().includes(lowercasedQuery) ||
            event.location.toLowerCase().includes(lowercasedQuery) ||
            (event.tags && event.tags.toLowerCase().includes(lowercasedQuery))
        );
    }, [query, allEvents]);

    return (
        <div className="search-page-container">
            <h1 className="search-page-title">
                {eventsLoading ? 'Searching for events...' : `${searchResults.length} results for "${query}"`}
            </h1>

            {eventsLoading ? (
                <SkeletonGrid />
            ) : (
                <>
                    {searchResults.length > 0 ? (
                        <motion.div layout className="search-results-grid">
                            {searchResults.map(event => (
                                <SearchEventCard
                                    key={event.id}
                                    event={event}
                                    isBooked={userBookings.has(event.id)}
                                />
                            ))}
                        </motion.div>
                    ) : (
                        <div className="no-results-container">
                            <p className="no-results-text">No events found matching your search criteria.</p>
                            <p className="no-results-suggestion">Try searching for a different keyword or browse all events.</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default SearchPage;