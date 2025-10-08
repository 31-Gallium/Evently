import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './SearchBar.module.css';
import useDebounce from '../../hooks/useDebounce';
import { IconClose, IconSearch } from '../../utils/Icons';

const SearchBar = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const debouncedQuery = useDebounce(query, 300);
    const navigate = useNavigate();
    const searchRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsExpanded(false);
                setIsDropdownVisible(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (debouncedQuery && isExpanded) {
            setIsLoading(true);
            const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
// ...
fetch(`${API_BASE_URL}/events/search?q=${debouncedQuery}`)
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        setResults(data);
                    } else {
                        setResults([]);
                    }
                    setIsLoading(false);
                    setIsDropdownVisible(true);
                })
                .catch(error => {
                    console.error('Error fetching search results:', error);
                    setIsLoading(false);
                    setResults([]);
                });
        } else {
            setResults([]);
            setIsDropdownVisible(false);
        }
    }, [debouncedQuery, isExpanded]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (query.trim()) {
            navigate(`/search?q=${encodeURIComponent(query.trim())}`);
            setQuery('');
            setIsExpanded(false);
            setIsDropdownVisible(false);
        }
    };
    
    const handleResultClick = (id) => {
        navigate(`/event/${id}`);
        setQuery('');
        setIsExpanded(false);
        setIsDropdownVisible(false);
    };

    return (
        <div className={`${styles.searchBar} ${isExpanded ? styles.expanded : ''}`} ref={searchRef}>
        <div className={styles.inputContainer}>
            <input
                type="text"
                placeholder="Search events..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => query && setIsDropdownVisible(true)}
                className={styles.searchInput}
            />
            {isDropdownVisible && isExpanded && (
                <div className={styles.searchResultsDropdown}>
                    {isLoading && <div className={styles.searchResultItem}>Loading...</div>}
                    {!isLoading && results.length === 0 && debouncedQuery && (
                        <div className={styles.searchResultItem}>No results found.</div>
                    )}
                    {!isLoading && results.map(event => (
                        <div key={event.id} className={styles.searchResultItem} onClick={() => handleResultClick(event.id)}>
                            <img src={event.imageUrl} alt={event.name} className={styles.searchResultImage} />
                            <div className={styles.searchResultInfo}>
                                <div className={styles.searchResultName}>{event.name}</div>
                                <div className={styles.searchResultLocation}>{event.location}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
        <button className={styles.searchIcon} onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? <IconClose /> : <IconSearch />}
        </button>
        </div>
    );
};

export default SearchBar;