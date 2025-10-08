import { create } from 'zustand';

const useTrendingEventsStore = create((set) => ({
  trendingEvents: [],
  error: null,

  fetchTrendingEvents: async () => {
    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
// ...
const response = await fetch(`${API_BASE_URL}/events/trending');
      if (!response.ok) throw new Error('Failed to fetch trending events');
      const trendingData = await response.json();
      set({ trendingEvents: trendingData });
    } catch (error) {
      console.error(error);
      set({ error: 'Failed to fetch trending events' });
    }
  },
}));

export default useTrendingEventsStore;
