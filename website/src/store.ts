import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserData, CheckIn, Note, Bookmark, Inspiration } from './types';

interface AppStore extends UserData {
  toggleTask: (taskId: string) => void;
  addCheckIn: (checkIn: Omit<CheckIn, 'date'>) => void;
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  addBookmark: (bookmark: Omit<Bookmark, 'id' | 'addedAt'>) => void;
  deleteBookmark: (id: string) => void;
  addInspiration: (inspiration: Omit<Inspiration, 'id' | 'createdAt'>) => void;
  updateInspiration: (id: string, updates: Partial<Inspiration>) => void;
  deleteInspiration: (id: string) => void;
  exportData: () => string;
  importData: (jsonString: string) => void;
}

export const useStore = create<AppStore>()(
  persist(
    (set, get) => ({
      taskProgress: {},
      checkIns: [],
      notes: [],
      bookmarks: [],
      inspirations: [],

      toggleTask: (taskId: string) =>
        set((state) => ({
          taskProgress: {
            ...state.taskProgress,
            [taskId]: !state.taskProgress[taskId],
          },
        })),

      addCheckIn: (checkIn) =>
        set((state) => ({
          checkIns: [
            ...state.checkIns,
            { ...checkIn, date: new Date().toISOString().split('T')[0] },
          ],
        })),

      addNote: (note) =>
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
        })),

      updateNote: (id, updates) =>
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id
              ? { ...note, ...updates, updatedAt: new Date().toISOString() }
              : note
          ),
        })),

      deleteNote: (id) =>
        set((state) => ({
          notes: state.notes.filter((note) => note.id !== id),
        })),

      addBookmark: (bookmark) =>
        set((state) => ({
          bookmarks: [
            ...state.bookmarks,
            {
              ...bookmark,
              id: Date.now().toString(),
              addedAt: new Date().toISOString(),
            },
          ],
        })),

      deleteBookmark: (id) =>
        set((state) => ({
          bookmarks: state.bookmarks.filter((b) => b.id !== id),
        })),

      addInspiration: (inspiration) =>
        set((state) => ({
          inspirations: [
            {
              ...inspiration,
              id: Date.now().toString(),
              createdAt: new Date().toISOString(),
            },
            ...state.inspirations,
          ],
        })),

      updateInspiration: (id, updates) =>
        set((state) => ({
          inspirations: state.inspirations.map((i) =>
            i.id === id ? { ...i, ...updates } : i
          ),
        })),

      deleteInspiration: (id) =>
        set((state) => ({
          inspirations: state.inspirations.filter((i) => i.id !== id),
        })),

      exportData: () => {
        const data = get();
        return JSON.stringify(
          {
            taskProgress: data.taskProgress,
            checkIns: data.checkIns,
            notes: data.notes,
            bookmarks: data.bookmarks,
            inspirations: data.inspirations,
          },
          null,
          2
        );
      },

      importData: (jsonString: string) => {
        try {
          const data = JSON.parse(jsonString);
          set(data);
        } catch (error) {
          console.error('Failed to import data:', error);
        }
      },
    }),
    {
      name: 'ai-pm-learning-storage',
    }
  )
);
