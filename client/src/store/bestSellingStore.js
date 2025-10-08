import { create } from 'zustand';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const useBestSellingStore = create((set) => ({
  bestSellingEvents: [],
  error: null,

  fetchBestSellingEvents: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/events/bestselling`);
      if (!response.ok) throw new Error('Failed to fetch best-selling events');
      const data = await response.json();
      set({ bestSellingEvents: data });
    } catch (error) {
      console.error(error);
      set({ error: 'Failed to fetch best-selling events' });
    }
  },
}));

export default useBestSellingStore;
