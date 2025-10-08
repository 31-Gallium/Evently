

import React from 'react';
import './skeletons.css';

export const SkeletonCard = () => ( <div className="skeleton-card" /> );

export const SkeletonStatCard = () => ( <div className="skeleton-stat-card" /> );

export const SkeletonRow = () => (
    <div className="carousel-container">
        <div className="skeleton-title"></div>
        <div className="carousel">
            <div className="swiper-wrapper">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div className="swiper-slide" key={i}>
                        <SkeletonCard />
                    </div>
                ))}
            </div>
        </div>
    </div>
);

export const SkeletonHero = () => (<div className="skeleton-hero"></div>);

