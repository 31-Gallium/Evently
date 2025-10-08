import { create } from 'zustand';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const useCategoryStore = create((set) => ({
  tagCounts: {},
  error: null,

  fetchTagCounts: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/tags/counts`);
      if (!response.ok) throw new Error('Failed to fetch tag counts');
      const data = await response.json();
      set({ tagCounts: data });
    } catch (error) {
      console.error(error);
      set({ error: 'Failed to fetch tag counts' });
    }
  },
}));

export default useCategoryStore;
