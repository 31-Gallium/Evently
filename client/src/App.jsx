
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import useAllEventsStore from './store/allEventsStore';
import useTrendingEventsStore from './store/trendingEventsStore';
import useUpcomingEventsStore from './store/upcomingEventsStore';
import useBestSellingStore from './store/bestSellingStore';
import useCategoryStore from './store/categoryStore';

// Import Layout and Route Protection
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Import Page Components
import HomePage from './pages/HomePage';
import EventDetailsPage from './pages/EventDetailsPage';
import MyBookingsPage from './pages/MyBookingsPage';
import PastEventsPage from './pages/PastEventsPage';
import DashboardPage from './pages/DashboardPage';
import AuthPage from './pages/AuthPage';
import OrganizationPage from './pages/OrganizationPage';
import SearchPage from './pages/SearchPage';
import ProfilePage from './pages/ProfilePage';

import CalendarPage from './pages/CalendarPage';

function App() {
  useEffect(() => {
    document.body.classList.add('dark');
  }, []);

  useEffect(() => {
    useAllEventsStore.getState().fetchAllEvents();
    useTrendingEventsStore.getState().fetchTrendingEvents();
    useUpcomingEventsStore.getState().fetchUpcomingEvents();
    useBestSellingStore.getState().fetchBestSellingEvents();
    useCategoryStore.getState().fetchTagCounts();
  }, []);

    return (
        <BrowserRouter>
            <Routes>
                {/* Auth routes do not use the main layout */}
                <Route path="/login" element={<AuthPage />} />
                <Route path="/signup" element={<AuthPage />} />

                {/* Routes wrapped in the main layout */}
                <Route element={<Layout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="event/:id" element={<EventDetailsPage />} />
                    <Route path="past-events" element={<PastEventsPage />} />
                    <Route path="organization/:organizerName" element={<OrganizationPage />} />
                    <Route path="search" element={<SearchPage />} />
                    <Route path="profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                    
                    <Route 
                        path="bookings" 
                        element={
                            <ProtectedRoute>
                                <MyBookingsPage />
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path="dashboard" 
                        element={
                            <ProtectedRoute allowedRoles={['ADMIN', 'ORGANIZER']}>
                                <DashboardPage />
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path="calendar" 
                        element={
                            <ProtectedRoute>
                                <CalendarPage />
                            </ProtectedRoute>
                        } 
                    />
                </Route>

                {/* Fallback route to redirect to home */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;