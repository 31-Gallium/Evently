import { create } from 'zustand';

import { getAuthHeader } from '../utils/auth';

const useAllEventsStore = create((set, get) => ({
  allEvents: [],
  allTags: [],
  eventsLoading: true,
  error: null,
  lastFetched: null,
  cacheDuration: 5 * 60 * 1000, // 5 minutes

  fetchAllEvents: async () => {
    const { lastFetched, cacheDuration, allEvents } = get();
    const now = new Date();

    if (lastFetched && (now - lastFetched < cacheDuration) && allEvents.length > 0) {
      set({ eventsLoading: false });
      return;
    }

    set({ eventsLoading: true });
    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
// ...
const response = await fetch(`${API_BASE_URL}/events');
      if (!response.ok) throw new Error('Failed to fetch events');
      const eventsData = await response.json();
      const tags = [...new Set(eventsData.flatMap(e => e.tags ? e.tags.split(',') : []))];
      set({ allEvents: eventsData, allTags: tags.sort(), eventsLoading: false, lastFetched: new Date() });
    } catch (error) {
      console.error(error);
      set({ eventsLoading: false, error: 'Failed to fetch events' });
    }
  },

  addEvent: async (event, user) => {
    const originalEvents = get().allEvents;
    const tempId = `temp-${Date.now()}`;
    const eventWithTempId = { ...event, id: tempId };

    set(state => ({ allEvents: [eventWithTempId, ...state.allEvents] }));

    try {
      const endpoint = user.role === 'ADMIN' ? '/api/admin/events' : '/api/organizer/events';
      const headers = await getAuthHeader();
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers,
        body: JSON.stringify(event),
      });

      if (!response.ok) throw new Error('Failed to create event');

      const newEvent = await response.json();
      set(state => ({
        allEvents: state.allEvents.map(e => (e.id === tempId ? newEvent : e)),
        lastFetched: null, // Invalidate cache
      }));
    } catch (error) {
      console.error(error);
      set({ allEvents: originalEvents, error: 'Failed to create event' });
    }
  },

  updateEvent: async (event, user) => {
    const originalEvents = get().allEvents;
    set(state => ({
      allEvents: state.allEvents.map(e => (e.id === event.id ? event : e)),
    }));

    try {
      const endpoint = user.role === 'ADMIN' ? `/api/admin/events/${event.id}` : `/api/organizer/events/${event.id}`;
      const headers = await getAuthHeader();
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(event),
      });

      if (!response.ok) throw new Error('Failed to update event');

      const updatedEvent = await response.json();
      set(state => ({
        allEvents: state.allEvents.map(e => (e.id === updatedEvent.id ? updatedEvent : e)),
        lastFetched: null, // Invalidate cache
      }));
    } catch (error) {
      console.error(error);
      set({ allEvents: originalEvents, error: 'Failed to update event' });
    }
  },

  deleteEvent: async (eventId, user) => {
    const originalEvents = get().allEvents;
    set(state => ({ allEvents: state.allEvents.filter(e => e.id !== eventId) }));

    try {
      const endpoint = user.role === 'ADMIN' ? `/api/admin/events/${eventId}` : `/api/calendar/events/${eventId}`;
      const headers = await getAuthHeader();
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) throw new Error('Failed to delete event');

      set({ lastFetched: null }); // Invalidate cache
    } catch (error) {
      console.error(error);
      set({ allEvents: originalEvents, error: 'Failed to delete event' });
    }
  },
}));

export default useAllEventsStore;
