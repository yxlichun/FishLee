import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserData, CheckIn, Note, Bookmark, Inspiration } from './types';

const API_URL = '/api/data';
const STORAGE_KEY = 'ai-pm-learning-storage';
const isDevelopment = import.meta.env.DEV;

// 判断字符串是否是合法日期
function isValidDate(value: any): boolean {
  if (!value) return false;
  const d = new Date(value);
  return !isNaN(d.getTime());
}

// 迁移旧格式的 CheckIn 数据（date → id + timestamp）
function migrateCheckIns(checkIns: any[]): CheckIn[] {
  return checkIns.map((c: any, index: number) => {
    const needsTimestamp = !isValidDate(c.timestamp);
    const needsId = !c.id;
    if (needsTimestamp || needsId) {
      return {
        ...c,
        id: c.id || `migrated-${Date.now()}-${index}`,
        timestamp: isValidDate(c.timestamp)
          ? c.timestamp
          : isValidDate(c.date)
            ? new Date(c.date).toISOString()
            : new Date().toISOString(),
      };
    }
    return c as CheckIn;
  });
}

interface AppStore extends UserData {
  isLoading: boolean;
  error: string | null;
  loadData: () => Promise<void>;
  saveData: () => Promise<void>;
  toggleTask: (taskId: string) => Promise<void>;
  addCheckIn: (checkIn: Omit<CheckIn, 'id' | 'timestamp'>) => Promise<void>;
  updateCheckIn: (id: string, updates: Partial<Omit<CheckIn, 'id' | 'timestamp'>>) => Promise<void>;
  deleteCheckIn: (id: string) => Promise<void>;
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

export const useStore = create<AppStore>()(
  persist(
    (set, get) => ({
      taskProgress: {},
      checkIns: [],
      notes: [],
      bookmarks: [],
      inspirations: [],
      isLoading: false,
      error: null,

      loadData: async () => {
        // 开发环境直接使用 localStorage，生产环境从 API 加载
        if (isDevelopment) {
          set({ isLoading: false });
          return;
        }

        set({ isLoading: true, error: null });
        try {
          const response = await fetch(API_URL);
          if (!response.ok) throw new Error('Failed to load data');
          const blobData = await response.json();

          // 对比 Blob 和 localStorage 的时间戳，取更新的一方
          const localState = get();
          const localUpdated = (localState as any)._lastUpdated as string | undefined;
          const blobUpdated = blobData._lastUpdated as string | undefined;

          const blobIsNewer =
            !localUpdated ||
            (blobUpdated && new Date(blobUpdated) > new Date(localUpdated));

          if (blobIsNewer) {
            const migratedCheckIns = migrateCheckIns(blobData.checkIns || []);
            const needsMigration = migratedCheckIns.some(
              (c, i) => c.id !== (blobData.checkIns || [])[i]?.id ||
                        c.timestamp !== (blobData.checkIns || [])[i]?.timestamp
            );
            set({
              taskProgress: blobData.taskProgress || {},
              checkIns: migratedCheckIns,
              notes: blobData.notes || [],
              bookmarks: blobData.bookmarks || [],
              inspirations: blobData.inspirations || [],
              isLoading: false,
            });
            if (needsMigration) {
              await get().saveData();
            }
          } else {
            // localStorage 更新，把本地数据同步到 Blob
            set({ isLoading: false });
            await get().saveData();
          }
        } catch (error) {
          // API 失败时保留 localStorage 中的数据
          set({ isLoading: false });
        }
      },

      saveData: async () => {
        // 开发环境数据已通过 persist 自动保存到 localStorage
        if (isDevelopment) {
          return;
        }

        const { taskProgress, checkIns, notes, bookmarks, inspirations } = get();
        try {
          const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              taskProgress,
              checkIns,
              notes,
              bookmarks,
              inspirations,
              _lastUpdated: new Date().toISOString(),
            }),
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
        {
          ...checkIn,
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
        },
        ...state.checkIns,
      ],
    }));
    await get().saveData();
  },

  updateCheckIn: async (id, updates) => {
    set((state) => ({
      checkIns: state.checkIns.map((checkIn) =>
        checkIn.id === id ? { ...checkIn, ...updates } : checkIn
      ),
    }));
    await get().saveData();
  },

  deleteCheckIn: async (id) => {
    set((state) => ({
      checkIns: state.checkIns.filter((checkIn) => checkIn.id !== id),
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
}),
{
  name: STORAGE_KEY,
  version: 1,
  partialize: (state) => ({
    taskProgress: state.taskProgress,
    checkIns: state.checkIns,
    notes: state.notes,
    bookmarks: state.bookmarks,
    inspirations: state.inspirations,
  }),
  migrate: (persistedState: any, version: number) => {
    // 迁移旧的 CheckIn 数据格式
    if (version === 0 && persistedState?.checkIns) {
      persistedState.checkIns = persistedState.checkIns.map((checkIn: any) => {
        // 如果是旧格式（有 date 字段但没有 id 和 timestamp）
        if (checkIn.date && !checkIn.id && !checkIn.timestamp) {
          return {
            ...checkIn,
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            timestamp: new Date(checkIn.date).toISOString(),
          };
        }
        return checkIn;
      });
    }
    return persistedState;
  },
}
)
);
