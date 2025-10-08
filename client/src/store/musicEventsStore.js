import { create } from 'zustand';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const useMusicEventsStore = create((set) => ({
  musicEvents: [],
  error: null,

  fetchMusicEvents: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/events/tag/Music`);
      if (!response.ok) throw new Error('Failed to fetch music events');
      const data = await response.json();
      set({ musicEvents: data });
    } catch (error) {
      console.error(error);
      set({ error: 'Failed to fetch music events' });
    }
  },
}));

export default useMusicEventsStore;
