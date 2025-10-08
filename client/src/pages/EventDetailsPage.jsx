import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './EventDetailsPage.css';

import { IconFire, IconCheck, IconPlus, IconCalendar, IconMapPin, IconUsers, IconTicket, IconInfo } from '../utils/Icons';
import { getFallbackImage } from '../utils/imageHelpers';

const EventDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, userProfile, userHypes, userWatchlist, userBookings, userWaitlist, setUserBookings, setUserWaitlist, setUserHypes, setUserWatchlist } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionStatus, setActionStatus] = useState('');
  const [actionError, setActionError] = useState('');

  const [isHyped, setIsHyped] = useState(userHypes.has(parseInt(id)));
  const [isInWatchlist, setIsInWatchlist] = useState(userWatchlist.has(parseInt(id)));

  useEffect(() => {
    setIsHyped(userHypes.has(parseInt(id)));
  }, [userHypes, id]);

  useEffect(() => {
    setIsInWatchlist(userWatchlist.has(parseInt(id)));
  }, [userWatchlist, id]);

  const isBookedByCurrentUser = userBookings.has(parseInt(id));
  const isOnWaitlistByCurrentUser = userWaitlist.has(parseInt(id));

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
// ...
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
  }, [id]);
  
  const createBooking = async (apiEndpoint, body, successCallback) => {
      if (!user) { navigate('/login'); return; }
      setActionError('');
      try {
          const response = await fetch(`http://localhost:5000/api/${apiEndpoint}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'x-firebase-uid': user.uid },
              body: JSON.stringify(body),
          });
          const data = await response.json();
          if (!response.ok) { throw new Error(data.error || 'Action failed.'); }
          successCallback();
      } catch (err) {
          setActionStatus('error');
          setActionError(err.message);
      }
  };

  const handleBookNow = async () => {
    setActionStatus('booking');
    createBooking('bookings', { eventId: event.id }, () => {
        setUserBookings(prev => new Set(prev).add(event.id));
        setActionStatus('success');
    });
  };

  const handleWaitlistJoin = async () => {
    setActionStatus('joining_waitlist');
    createBooking('waitlist', { eventId: event.id }, () => {
        setUserWaitlist(prev => new Set(prev).add(event.id));
        setActionStatus('waitlist_success');
    });
  };

import { getAuthHeader } from '../utils/auth';

// ... (imports)

const EventDetailsPage = () => {
    // ... (state)
    const { user, userProfile, refetchProfile } = useAuth();

    // ... (useEffect)

    const handleHype = async () => {
        if (!user) return;
        const headers = await getAuthHeader();
        const response = await fetch(`http://localhost:5000/api/events/${id}/hype`, {
            method: isHyped ? 'DELETE' : 'POST',
            headers
        });

        if (response.ok) {
            refetchProfile();
        }
    };

    const handleWatchlist = async () => {
        if (!user) return;
        const headers = await getAuthHeader();
        const response = await fetch(`http://localhost:5000/api/watchlist`, {
            method: isOnWatchlist ? 'DELETE' : 'POST',
            headers,
            body: JSON.stringify({ eventId: id })
        });

        if (response.ok) {
            refetchProfile();
        }
    };

    const handleBooking = async () => {
        if (!user) return;
        const headers = await getAuthHeader();
        const response = await fetch(`http://localhost:5000/api/bookings`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ eventId: id })
        });

        if (response.ok) {
            refetchProfile();
        }
    };

    // ... (render)
};

  const handleWatchlist = async () => {
    if (!user) {
        navigate('/login');
        return;
    }

    const wasInWatchlist = isInWatchlist;
    setUserWatchlist(prev => {
        const newSet = new Set(prev);
        if (!wasInWatchlist) {
            newSet.add(parseInt(id));
        } else {
            newSet.delete(parseInt(id));
        }
        return newSet;
    });

    try {
        const url = `http://localhost:5000/api/watchlist${!wasInWatchlist ? '' : `/${id}`}`;
        const method = !wasInWatchlist ? 'POST' : 'DELETE';
        const headers = { 'Content-Type': 'application/json', 'x-firebase-uid': user.uid };
        const body = !wasInWatchlist ? JSON.stringify({ eventId: parseInt(id) }) : undefined;

        const response = await fetch(url, { method, headers, body });

        if (!response.ok) {
            throw new Error('Failed to update watchlist');
        }
    } catch (error) {
        console.error(error);
        setUserWatchlist(prev => {
            const newSet = new Set(prev);
            if (wasInWatchlist) {
                newSet.add(parseInt(id));
            } else {
                newSet.delete(parseInt(id));
            }
            return newSet;
        });
    }
  };

  if (loading) return <div className="details-page"><p>Loading event details...</p></div>;
  if (error) return <div className="details-page"><p>Error: {error}</p></div>;
  if (!event) return <div className="details-page"><p>Event not found.</p></div>;

  const { name, date, location, price, description, organizerName, imageUrl, capacity, ticketsSold, createdAt, hypeCount } = event;
  const formattedDate = new Date(date).toLocaleString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
  const formattedPrice = price > 0 ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(price) : 'Free Event';
  const ticketsLeft = capacity - ticketsSold;
  const isSoldOut = ticketsLeft <= 0;
  const isBooked = actionStatus === 'success' || isBookedByCurrentUser;
  const isOnWaitlist = actionStatus === 'waitlist_success' || isOnWaitlistByCurrentUser;
  const organizerLink = `/organization/${organizerName.replace(/ /g, '-')}`;

  const renderBookingButton = () => {
    if (userProfile && userProfile.role === 'ADMIN') {
      return <button className="book-button" disabled>Admins cannot book</button>;
    }
    if (isSoldOut) {
      if (isOnWaitlist) return <button className="book-button" disabled>On Waitlist</button>;
      return <button onClick={handleWaitlistJoin} className="book-button" disabled={actionStatus === 'joining_waitlist'}>{actionStatus === 'joining_waitlist' ? 'Joining...' : 'Join Waitlist'}</button>;
    }
    return (<button onClick={handleBookNow} className="book-button" disabled={isBooked || actionStatus === 'booking'}>{actionStatus === 'booking' ? 'Booking...' : 'Book Now'}</button>);
  };

  return (
    <div className="details-page">
      <button onClick={() => navigate(-1)} className="back-button">&larr; Back</button>
      <div className="details-layout">
        <div className="details-content">
          <h1 className="details-page-title">{name}</h1>
          <div className="details-banner">
            <img src={imageUrl || getFallbackImage(event.tags)} alt={name} className="details-banner-image" />
          </div>
          <div className="details-actions">
            <button className={`action-button ${isHyped ? 'hyped' : ''}`} onClick={handleHype} disabled={isHyped}>
              <IconFire />
              <span>{hypeCount + (isHyped && !userHypes.has(parseInt(id)) ? 1 : 0)}</span>
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
            <div className="button-face-back"><div className="booking-success">✔ Booked!</div></div>
          </div>
          {actionStatus === 'error' && <p className="booking-error">{actionError}</p>}
        </div>
      </div>
    </div>
  );
};

export default EventDetailsPage;