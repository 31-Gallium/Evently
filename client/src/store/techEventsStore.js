import { create } from 'zustand';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const useTechEventsStore = create((set) => ({
  techEvents: [],
  error: null,

  fetchTechEvents: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/events/tag/Tech`);
      if (!response.ok) throw new Error('Failed to fetch tech events');
      const data = await response.json();
      set({ techEvents: data });
    } catch (error) {
      console.error(error);
      set({ error: 'Failed to fetch tech events' });
    }
  },
}));

export default useTechEventsStore;
