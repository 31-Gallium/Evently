import { create } from 'zustand';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const useUpcomingEventsStore = create((set) => ({
  upcomingEvents: [],
  error: null,

  fetchUpcomingEvents: async () => {
    try {
      // TODO: Create a dedicated upcoming events endpoint
      const response = await fetch(`${API_BASE_URL}/events`); 
      if (!response.ok) throw new Error('Failed to fetch upcoming events');
      const allEvents = await response.json();
      // This filtering should ideally be done on the backend
      const upcomingData = allEvents
        .filter(event => new Date(event.date) > new Date())
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 10);
      set({ upcomingEvents: upcomingData });
    } catch (error) {
      console.error(error);
      set({ error: 'Failed to fetch upcoming events' });
    }
  },
}));

export default useUpcomingEventsStore;