import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './EventDetailsPage.css';
import { getAuthHeader } from '../utils/auth';
import { IconFire, IconCheck, IconPlus, IconCalendar, IconMapPin, IconUsers, IconTicket, IconInfo } from '../utils/Icons';
import { getFallbackImage } from '../utils/imageHelpers';

const EventDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  // Consolidate all required values from useAuth
  const { user, userProfile, refetchProfile, userHypes, userBookings, userWaitlist } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState('');

  // Define API_BASE_URL once
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // Derived state should be computed directly or with useMemo for performance
  const isHyped = userHypes.has(parseInt(id));
  const isInWatchlist = userProfile?.watchlist?.some(item => item.eventId === parseInt(id));
  const isBooked = userBookings.has(parseInt(id));
  const isOnWaitlist = userWaitlist.has(parseInt(id));

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/events/${id}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        setEvent(await response.json());
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id, API_BASE_URL]);

  // Unified handler for Hype
  const handleHype = async () => {
    if (!user) { navigate('/login'); return; }
    try {
      const headers = await getAuthHeader();
      const response = await fetch(`${API_BASE_URL}/events/${id}/hype`, {
        method: isHyped ? 'DELETE' : 'POST',
        headers
      });
      if (response.ok) {
        refetchProfile(); // Refetch user profile to update hype status
        // Optimistically update event hype count for immediate feedback
        setEvent(prev => ({ ...prev, hypeCount: isHyped ? prev.hypeCount - 1 : prev.hypeCount + 1 }));
      } else {
        throw new Error('Failed to update hype status');
      }
    } catch (err) {
      console.error(err);
      setActionError('Could not update hype status.');
    }
  };

  // Unified handler for Watchlist
  const handleWatchlist = async () => {
    if (!user) { navigate('/login'); return; }
    try {
      const headers = await getAuthHeader();
      const response = await fetch(`${API_BASE_URL}/watchlist`, {
        method: isInWatchlist ? 'DELETE' : 'POST',
        headers,
        body: JSON.stringify({ eventId: parseInt(id) })
      });
      if (response.ok) {
        refetchProfile(); // Refetch user profile to update watchlist
      } else {
        throw new Error('Failed to update watchlist');
      }
    } catch (err) {
      console.error(err);
      setActionError('Could not update watchlist.');
    }
  };

  // Unified handler for Booking
  const handleBooking = async () => {
    if (!user) { navigate('/login'); return; }
    try {
      const headers = await getAuthHeader();
      const response = await fetch(`${API_BASE_URL}/bookings`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ eventId: parseInt(id) })
      });
      if (response.ok) {
        refetchProfile(); // Refetch user profile to update bookings
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Booking failed.');
      }
    } catch (err) {
      console.error(err);
      setActionError(err.message);
    }
  };
  
  // Unified handler for Waitlist
  const handleWaitlistJoin = async () => {
    if (!user) { navigate('/login'); return; }
    try {
        const headers = await getAuthHeader();
        const response = await fetch(`${API_BASE_URL}/waitlist`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ eventId: parseInt(id) })
        });
        if (response.ok) {
            refetchProfile(); // Refetch to update waitlist status
        } else {
            const data = await response.json();
            throw new Error(data.error || 'Joining waitlist failed.');
        }
    } catch (err) {
        console.error(err);
        setActionError(err.message);
    }
  };


  const { name, date, location, price, description, organizerName, imageUrl, capacity, ticketsSold, createdAt, hypeCount, tags } = event;

  const [currentImageUrl, setCurrentImageUrl] = useState('');

  useEffect(() => {
    if (imageUrl) {
      setCurrentImageUrl(imageUrl);
    } else {
      setCurrentImageUrl(getFallbackImage(tags));
    }
  }, [imageUrl, tags]);

  const handleImageError = () => {
    setCurrentImageUrl(getFallbackImage(tags));
  };

  if (loading) return <div className="details-page"><p>Loading event details...</p></div>;
  if (error) return <div className="details-page"><p>Error: {error}</p></div>;
  if (!event) return <div className="details-page"><p>Event not found.</p></div>;

  const formattedDate = new Date(date).toLocaleString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
  const formattedPrice = price > 0 ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(price) : 'Free Event';
  const ticketsLeft = capacity - ticketsSold;
  const isSoldOut = ticketsLeft <= 0;
  const organizerLink = `/organization/${organizerName.replace(/ /g, '-')}`;

  const renderBookingButton = () => {
    if (userProfile && userProfile.role === 'ADMIN') {
      return <button className="book-button" disabled>Admins cannot book</button>;
    }
    if (isBooked) {
        return <div className="booking-success">✔ Booked!</div>;
    }
    if (isSoldOut) {
      if (isOnWaitlist) return <button className="book-button" disabled>On Waitlist</button>;
      return <button onClick={handleWaitlistJoin} className="book-button">Join Waitlist</button>;
    }
    return (<button onClick={handleBooking} className="book-button">Book Now</button>);
  };

  return (
    <div className="details-page">
      <button onClick={() => navigate(-1)} className="back-button">&larr; Back</button>
      <div className="details-layout">
        <div className="details-content">
          <h1 className="details-page-title">{name}</h1>
          <div className="details-banner">
            <img src={currentImageUrl} alt={name} className="details-banner-image" onError={handleImageError} />
          </div>
          <div className="details-actions">
            <button className={`action-button ${isHyped ? 'hyped' : ''}`} onClick={handleHype}>
              <IconFire />
              <span>{hypeCount}</span>
            </button>
            <button className={`action-button ${isInWatchlist ? 'hyped' : ''}`} onClick={handleWatchlist}>
              {isInWatchlist ? <IconCheck /> : <IconPlus />}
              <span>{isInWatchlist ? 'In Watchlist' : 'Add to Watchlist'}</span>
            </button>
          </div>
          <h2>Event Details</h2>
          <p>{description}</p>
        </div>
        <div className="details-sidebar">
          <div className="sidebar-info-item"><IconCalendar /><div><h3>Date & Time</h3><p>{formattedDate}</p></div></div>
          <div className="sidebar-info-item"><IconMapPin /><div><h3>Location</h3><p>{location}</p></div></div>
          <div className="sidebar-info-item"><IconUsers /><div><h3>Organized by</h3><p><Link to={organizerLink} className="organizer-link">{organizerName}</Link></p></div></div>
          <div className="sidebar-info-item"><IconTicket /><div><h3>Tickets Left</h3><p>{ticketsLeft > 0 ? `${ticketsLeft} / ${capacity}` : 'Sold Out'}</p></div></div>
          <div className="sidebar-info-item" style={{border: 'none', paddingBottom: 0, marginBottom: 0}}><IconInfo /><div><h3>Posted On</h3><p>{new Date(createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p></div></div>
          <div className="price-tag">{formattedPrice}</div>
          <div className={`booking-button-wrapper ${isBooked ? 'booked' : ''}`}>
            <div className="button-face-front">{renderBookingButton()}</div>
            {isBooked && <div className="button-face-back"><div className="booking-success">✔ Booked!</div></div>}
          </div>
          {actionError && <p className="booking-error">{actionError}</p>}
        </div>
      </div>
    </div>
  );
};

export default EventDetailsPage;
