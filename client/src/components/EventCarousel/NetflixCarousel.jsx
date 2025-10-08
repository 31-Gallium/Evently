
import React, { useRef, useState, useMemo } from 'react';
import './NetflixCarousel.css';

const ITEMS_PER_PAGE = 6;

const NetflixCarousel = ({ children, events }) => {
    const carouselRef = useRef(null);
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = useMemo(() => {
        return Math.ceil(events.length / ITEMS_PER_PAGE);
    }, [events]);

    const scroll = (direction) => {
        if (carouselRef.current) {
            const scrollAmount = carouselRef.current.offsetWidth;
            let newPage;

            if (direction === 'left') {
                if (currentPage === 1) {
                    // Loop to last page
                    carouselRef.current.scrollLeft = carouselRef.current.scrollWidth;
                    newPage = totalPages;
                } else {
                    carouselRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
                    newPage = currentPage - 1;
                }
            } else { // direction === 'right'
                if (currentPage === totalPages) {
                    // Loop to first page
                    carouselRef.current.scrollLeft = 0;
                    newPage = 1;
                } else {
                    carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
                    newPage = currentPage + 1;
                }
            }
            setCurrentPage(newPage);
        }
    };

    return (
        <div className="netflix-carousel-container">
            <div className="carousel-header-extra">
                {totalPages > 1 && (
                    <div className="pagination-indicator">
                        {currentPage} / {totalPages}
                    </div>
                )}
            </div>
            <div className="netflix-carousel">
                <button className="scroll-button left" onClick={() => scroll('left')}>
                    &#9664;
                </button>
                <div className="carousel-content" ref={carouselRef}>
                    {children}
                </div>
                <button className="scroll-button right" onClick={() => scroll('right')}>
                    &#9654;
                </button>
            </div>
        </div>
    );
};

export default NetflixCarousel;
