import { create } from 'zustand';
import { UserData, CheckIn, Note, Bookmark, Inspiration } from './types';

const API_URL = '/api/data';

interface AppStore extends UserData {
  isLoading: boolean;
  error: string | null;
  loadData: () => Promise<void>;
  saveData: () => Promise<void>;
  toggleTask: (taskId: string) => Promise<void>;
  addCheckIn: (checkIn: Omit<CheckIn, 'date'>) => Promise<void>;
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  addBookmark: (bookmark: Omit<Bookmark, 'id' | 'addedAt'>) => Promise<void>;
  deleteBookmark: (id: string) => Promise<void>;
  addInspiration: (inspiration: Omit<Inspiration, 'id' | 'createdAt'>) => Promise<void>;
  updateInspiration: (id: string, updates: Partial<Inspiration>) => Promise<void>;
  deleteInspiration: (id: string) => Promise<void>;
  exportData: () => string;
  importData: (jsonString: string) => Promise<void>;
}

export const useStore = create<AppStore>((set, get) => ({
  taskProgress: {},
  checkIns: [],
  notes: [],
  bookmarks: [],
  inspirations: [],
  isLoading: false,
  error: null,

  loadData: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Failed to load data');
      const data = await response.json();
      set({ ...data, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  saveData: async () => {
    const { taskProgress, checkIns, notes, bookmarks, inspirations } = get();
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskProgress, checkIns, notes, bookmarks, inspirations }),
      });
      if (!response.ok) throw new Error('Failed to save data');
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  toggleTask: async (taskId: string) => {
    set((state) => ({
      taskProgress: {
        ...state.taskProgress,
        [taskId]: !state.taskProgress[taskId],
      },
    }));
    await get().saveData();
  },

  addCheckIn: async (checkIn) => {
    set((state) => ({
      checkIns: [
        ...state.checkIns,
        { ...checkIn, date: new Date().toISOString().split('T')[0] },
      ],
    }));
    await get().saveData();
  },

  addNote: async (note) => {
    set((state) => ({
      notes: [
        ...state.notes,
        {
          ...note,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    }));
    await get().saveData();
  },

  updateNote: async (id, updates) => {
    set((state) => ({
      notes: state.notes.map((note) =>
        note.id === id
          ? { ...note, ...updates, updatedAt: new Date().toISOString() }
          : note
      ),
    }));
    await get().saveData();
  },

  deleteNote: async (id) => {
    set((state) => ({
      notes: state.notes.filter((note) => note.id !== id),
    }));
    await get().saveData();
  },

  addBookmark: async (bookmark) => {
    set((state) => ({
      bookmarks: [
        ...state.bookmarks,
        {
          ...bookmark,
          id: Date.now().toString(),
          addedAt: new Date().toISOString(),
        },
      ],
    }));
    await get().saveData();
  },

  deleteBookmark: async (id) => {
    set((state) => ({
      bookmarks: state.bookmarks.filter((b) => b.id !== id),
    }));
    await get().saveData();
  },

  addInspiration: async (inspiration) => {
    set((state) => ({
      inspirations: [
        {
          ...inspiration,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
        },
        ...state.inspirations,
      ],
    }));
    await get().saveData();
  },

  updateInspiration: async (id, updates) => {
    set((state) => ({
      inspirations: state.inspirations.map((i) =>
        i.id === id ? { ...i, ...updates } : i
      ),
    }));
    await get().saveData();
  },

  deleteInspiration: async (id) => {
    set((state) => ({
      inspirations: state.inspirations.filter((i) => i.id !== id),
    }));
    await get().saveData();
  },

  exportData: () => {
    const { taskProgress, checkIns, notes, bookmarks, inspirations } = get();
    return JSON.stringify(
      { taskProgress, checkIns, notes, bookmarks, inspirations },
      null,
      2
    );
  },

  importData: async (jsonString: string) => {
    try {
      const data = JSON.parse(jsonString);
      set(data);
      await get().saveData();
    } catch (error) {
      console.error('Failed to import data:', error);
    }
  },
}));
