import { create } from 'zustand';

const useScrollStore = create((set) => ({
  isScrolled: false,
  setIsScrolled: (isScrolled) => set({ isScrolled }),
}));

export default useScrollStore;
