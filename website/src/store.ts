import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserData, CheckIn, Note, Bookmark, Inspiration, Plan } from './types';

const API_URL = '/api/data';
const STORAGE_KEY = 'ai-pm-learning-storage';
const STORAGE_VERSION = 2;
const isDevelopment = import.meta.env.DEV;

// ---------- helpers ----------

function isValidDate(value: unknown): boolean {
  if (!value) return false;
  const d = new Date(value as string);
  return !isNaN(d.getTime());
}

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
          ? new Date(c.date as string).toISOString()
          : new Date().toISOString(),
      } as CheckIn;
    }
    return c as CheckIn;
  });
}

// 从任意来源的 JSON 里安全地解出完整 UserData
function parseUserData(raw: any): Omit<UserData, never> & { _lastUpdated?: string } {
  return {
    taskProgress:  raw.taskProgress  || {},
    checkIns:      migrateCheckIns(raw.checkIns || []),
    notes:         raw.notes         || [],
    bookmarks:     raw.bookmarks     || [],
    inspirations:  raw.inspirations  || [],
    plans:         raw.plans         || [],
    _lastUpdated:  raw._lastUpdated,
  };
}

// ---------- store interface ----------

interface AppStore extends UserData {
  _lastUpdated: string;
  isLoading: boolean;
  error: string | null;

  loadData: () => Promise<void>;
  saveData: () => Promise<void>;

  toggleTask:       (taskId: string) => Promise<void>;

  addCheckIn:    (c: Omit<CheckIn, 'id' | 'timestamp'>) => Promise<void>;
  updateCheckIn: (id: string, updates: Partial<Omit<CheckIn, 'id' | 'timestamp'>>) => Promise<void>;
  deleteCheckIn: (id: string) => Promise<void>;

  addNote:    (n: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;

  addBookmark:    (b: Omit<Bookmark, 'id' | 'addedAt'>) => Promise<void>;
  deleteBookmark: (id: string) => Promise<void>;

  addInspiration:    (i: Omit<Inspiration, 'id' | 'createdAt'>) => Promise<void>;
  updateInspiration: (id: string, updates: Partial<Inspiration>) => Promise<void>;
  deleteInspiration: (id: string) => Promise<void>;

  addPlan:    (p: Omit<Plan, 'id' | 'createdAt' | 'completed'>) => Promise<void>;
  updatePlan: (id: string, updates: Partial<Omit<Plan, 'id' | 'createdAt'>>) => Promise<void>;
  deletePlan: (id: string) => Promise<void>;
  togglePlan: (id: string) => Promise<void>;

  exportData: () => string;
  importData: (jsonString: string) => Promise<void>;
}

// ---------- store ----------

export const useStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // --- state ---
      taskProgress: {},
      checkIns:     [],
      notes:        [],
      bookmarks:    [],
      inspirations: [],
      plans:        [],
      _lastUpdated: '',
      isLoading:    false,
      error:        null,

      // --- loadData ---
      loadData: async () => {
        if (isDevelopment) {
          set({ isLoading: false });
          return;
        }

        set({ isLoading: true, error: null });
        try {
          const res = await fetch(API_URL);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const blobRaw = await res.json();
          const blobData = parseUserData(blobRaw);

          const localUpdated = get()._lastUpdated;
          const blobUpdated  = blobData._lastUpdated ?? '';

          // Blob 更新时间更晚 → 用 Blob（跨设备同步）
          // 否则 → 保留本地，同步回 Blob
          if (!localUpdated || (blobUpdated && blobUpdated > localUpdated)) {
            set({ ...blobData, isLoading: false });
            // 如果有迁移（checkIns 格式变化），立即回写
            if (blobRaw.checkIns?.some((c: any) => !c.id || !isValidDate(c.timestamp))) {
              await get().saveData();
            }
          } else {
            set({ isLoading: false });
            await get().saveData(); // 本地更新 → 写回 Blob
          }
        } catch {
          // API 失败：静默降级，保留 localStorage 数据
          set({ isLoading: false });
        }
      },

      // --- saveData ---
      saveData: async () => {
        const now = new Date().toISOString();
        // 先把时间戳写进 localStorage（persist 会自动持久化）
        set({ _lastUpdated: now });

        if (isDevelopment) return; // 开发环境只存 localStorage

        const { taskProgress, checkIns, notes, bookmarks, inspirations, plans } = get();
        try {
          const res = await fetch(API_URL, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              taskProgress, checkIns, notes, bookmarks, inspirations, plans,
              _lastUpdated: now,
            }),
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
        } catch (err) {
          set({ error: (err as Error).message });
        }
      },

      // --- tasks ---
      toggleTask: async (taskId) => {
        set((s) => ({ taskProgress: { ...s.taskProgress, [taskId]: !s.taskProgress[taskId] } }));
        await get().saveData();
      },

      // --- checkIns ---
      addCheckIn: async (checkIn) => {
        set((s) => ({
          checkIns: [{ ...checkIn, id: `ci-${Date.now()}`, timestamp: new Date().toISOString() }, ...s.checkIns],
        }));
        await get().saveData();
      },
      updateCheckIn: async (id, updates) => {
        set((s) => ({ checkIns: s.checkIns.map((c) => c.id === id ? { ...c, ...updates } : c) }));
        await get().saveData();
      },
      deleteCheckIn: async (id) => {
        set((s) => ({ checkIns: s.checkIns.filter((c) => c.id !== id) }));
        await get().saveData();
      },

      // --- notes ---
      addNote: async (note) => {
        const now = new Date().toISOString();
        set((s) => ({
          notes: [...s.notes, { ...note, id: `n-${Date.now()}`, createdAt: now, updatedAt: now }],
        }));
        await get().saveData();
      },
      updateNote: async (id, updates) => {
        set((s) => ({
          notes: s.notes.map((n) => n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n),
        }));
        await get().saveData();
      },
      deleteNote: async (id) => {
        set((s) => ({ notes: s.notes.filter((n) => n.id !== id) }));
        await get().saveData();
      },

      // --- bookmarks ---
      addBookmark: async (bookmark) => {
        set((s) => ({
          bookmarks: [...s.bookmarks, { ...bookmark, id: `bm-${Date.now()}`, addedAt: new Date().toISOString() }],
        }));
        await get().saveData();
      },
      deleteBookmark: async (id) => {
        set((s) => ({ bookmarks: s.bookmarks.filter((b) => b.id !== id) }));
        await get().saveData();
      },

      // --- inspirations ---
      addInspiration: async (inspiration) => {
        set((s) => ({
          inspirations: [{ ...inspiration, id: `ins-${Date.now()}`, createdAt: new Date().toISOString() }, ...s.inspirations],
        }));
        await get().saveData();
      },
      updateInspiration: async (id, updates) => {
        set((s) => ({ inspirations: s.inspirations.map((i) => i.id === id ? { ...i, ...updates } : i) }));
        await get().saveData();
      },
      deleteInspiration: async (id) => {
        set((s) => ({ inspirations: s.inspirations.filter((i) => i.id !== id) }));
        await get().saveData();
      },

      // --- plans ---
      addPlan: async (plan) => {
        set((s) => ({
          plans: [
            ...s.plans,
            { ...plan, id: `pl-${Date.now()}`, completed: false, createdAt: new Date().toISOString() },
          ],
        }));
        await get().saveData();
      },
      updatePlan: async (id, updates) => {
        set((s) => ({ plans: s.plans.map((p) => p.id === id ? { ...p, ...updates } : p) }));
        await get().saveData();
      },
      deletePlan: async (id) => {
        set((s) => ({ plans: s.plans.filter((p) => p.id !== id) }));
        await get().saveData();
      },
      togglePlan: async (id) => {
        set((s) => ({ plans: s.plans.map((p) => p.id === id ? { ...p, completed: !p.completed } : p) }));
        await get().saveData();
      },

      // --- export / import ---
      exportData: () => {
        const { taskProgress, checkIns, notes, bookmarks, inspirations, plans } = get();
        return JSON.stringify({ taskProgress, checkIns, notes, bookmarks, inspirations, plans }, null, 2);
      },
      importData: async (jsonString) => {
        try {
          const raw = JSON.parse(jsonString);
          const data = parseUserData(raw);
          set(data);
          await get().saveData();
        } catch (err) {
          console.error('Failed to import data:', err);
        }
      },
    }),
    {
      name: STORAGE_KEY,
      version: STORAGE_VERSION,
      // 持久化字段：包含 plans 和 _lastUpdated
      partialize: (state) => ({
        taskProgress: state.taskProgress,
        checkIns:     state.checkIns,
        notes:        state.notes,
        bookmarks:    state.bookmarks,
        inspirations: state.inspirations,
        plans:        state.plans,
        _lastUpdated: state._lastUpdated,
      }),
      migrate: (persisted: any, version: number) => {
        // v0→v1: checkIn date→timestamp
        if (version < 1 && persisted?.checkIns) {
          persisted.checkIns = migrateCheckIns(persisted.checkIns);
        }
        // v1→v2: 补充 plans 字段
        if (version < 2) {
          persisted.plans = persisted.plans || [];
        }
        return persisted;
      },
    }
  )
);
