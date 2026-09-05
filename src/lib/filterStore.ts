import { create } from 'zustand';

interface FilterState {
  search: string;
  availability: string;
  timezone: string;
  projectType: string;
  tags: string[]; // Active chips e.g. "Hackathon", "Remote Only"
  
  setFilter: (key: keyof Omit<FilterState, 'setFilter' | 'clearAll' | 'toggleTag'>, value: string) => void;
  toggleTag: (tag: string) => void;
  clearAll: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  search: '',
  availability: 'All',
  timezone: 'All',
  projectType: 'All',
  tags: [],

  setFilter: (key, value) => set({ [key]: value }),
  
  toggleTag: (tag) => set((state) => {
    if (state.tags.includes(tag)) {
      return { tags: state.tags.filter(t => t !== tag) };
    } else {
      return { tags: [...state.tags, tag] };
    }
  }),
  
  clearAll: () => set({
    search: '',
    availability: 'All',
    timezone: 'All',
    projectType: 'All',
    tags: []
  }),
}));
