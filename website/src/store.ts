import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, UserData, AllUserData, Goal, CheckIn, Note, Bookmark, Inspiration, Plan, LearningPath, Phase, Section, Task, Resource, OperationLog } from './types';
import { learningPath as builtinPhases } from './data/learningPath';

// 初始化默认用户
const defaultUser: User = {
  id: 'user-1',
  username: 'lichun',
  password: '1q2w3e4r', // 实际项目中应该加密存储
  role: 'admin'
};

const API_URL = import.meta.env.VITE_API_BASE
  ? `${import.meta.env.VITE_API_BASE}/api/data`
  : '/api/data';
const STORAGE_KEY = 'ai-pm-learning-storage';
const STORAGE_VERSION = 6;
const isDevelopment = import.meta.env.DEV;

const BUILTIN_PATH_ID = 'builtin-ai-pm-6months';
const DEFAULT_GOAL_ID = 'default-goal';

// 初始化所有用户数据
const initialAllUserData: AllUserData = {
  'user-1': {
    goals: [makeDefaultGoal()],
    activeGoalId: DEFAULT_GOAL_ID,
  },
};

function makeBuiltinPath(): LearningPath {
  const now = new Date().toISOString();
  return {
    id: BUILTIN_PATH_ID,
    title: 'AI产品经理6个月转型',
    description: '从零开始，6个月系统学习AI产品经理所需的全部技能',
    createdAt: now,
    updatedAt: now,
    phases: builtinPhases,
  };
}

function makeDefaultGoal(): Goal {
  const now = new Date().toISOString();
  return {
    id: DEFAULT_GOAL_ID,
    title: 'AI PM 学习路径',
    description: '6个月转型计划',
    createdAt: now,
    updatedAt: now,
    taskProgress: {},
    checkIns: [],
    notes: [],
    bookmarks: [],
    inspirations: [],
    plans: [],
    learningPaths: [makeBuiltinPath()],
    activePathId: BUILTIN_PATH_ID,
  };
}

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

// 解析单个 Goal 对象，补齐缺失字段
function parseGoal(raw: any): Goal {
  const learningPaths: LearningPath[] = raw.learningPaths || [];
  if (learningPaths.length === 0) {
    learningPaths.push(makeBuiltinPath());
  }
  return {
    id: raw.id || `goal-${Date.now()}`,
    title: raw.title || '未命名目标',
    description: raw.description || '',
    icon: raw.icon,
    color: raw.color,
    createdAt: raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updatedAt || new Date().toISOString(),
    taskProgress: raw.taskProgress || {},
    checkIns: migrateCheckIns(raw.checkIns || []),
    notes: raw.notes || [],
    bookmarks: raw.bookmarks || [],
    inspirations: raw.inspirations || [],
    plans: raw.plans || [],
    learningPaths,
    activePathId: raw.activePathId ?? learningPaths[0]?.id ?? null,
  };
}

// 将旧版扁平数据迁移为单个默认 Goal
function migrateToGoal(raw: any): Goal {
  const learningPaths: LearningPath[] = raw.learningPaths || [];
  if (learningPaths.length === 0) {
    learningPaths.push(makeBuiltinPath());
  }
  return {
    id: DEFAULT_GOAL_ID,
    title: 'AI PM 学习路径',
    description: '6个月转型计划',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    taskProgress: raw.taskProgress || {},
    checkIns: migrateCheckIns(raw.checkIns || []),
    notes: raw.notes || [],
    bookmarks: raw.bookmarks || [],
    inspirations: raw.inspirations || [],
    plans: raw.plans || [],
    learningPaths,
    activePathId: raw.activePathId ?? learningPaths[0]?.id ?? null,
  };
}

// 从任意来源的 JSON 里安全地解出完整 UserData
function parseUserData(raw: any): UserData & { _lastUpdated?: string } {
  // 新格式：有 goals 数组
  if (raw.goals && Array.isArray(raw.goals)) {
    return {
      goals: raw.goals.map(parseGoal),
      activeGoalId: raw.activeGoalId ?? raw.goals[0]?.id ?? null,
      _lastUpdated: raw._lastUpdated,
    };
  }
  // 旧格式：扁平字段 → 迁移为单个默认 Goal
  const defaultGoal = migrateToGoal(raw);
  return {
    goals: [defaultGoal],
    activeGoalId: defaultGoal.id,
    _lastUpdated: raw._lastUpdated,
  };
}

// ---------- active goal helper ----------

// 更新 active goal 的通用辅助函数
function updateActiveGoal(
  state: { goals: Goal[]; activeGoalId: string | null },
  updater: (goal: Goal) => Goal,
): { goals: Goal[] } {
  return {
    goals: state.goals.map((g) =>
      g.id === state.activeGoalId ? updater(g) : g
    ),
  };
}

// ---------- store interface ----------

interface AppStore {
  // 用户相关
  currentUser: User | null;
  users: User[];
  allUserData: AllUserData;
  
  // 当前用户数据
  goals: Goal[];
  activeGoalId: string | null;
  _lastUpdated: string;
  isLoading: boolean;
  error: string | null;
  operationLogs: OperationLog[];

  // 用户管理
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  addUser: (user: Omit<User, 'id'>) => Promise<string>;
  updateUser: (id: string, updates: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  bindAssistant: (assistantId: string, boundUserId: string, boundUserPassword: string) => Promise<boolean>;

  loadData: () => Promise<void>;
  saveData: () => Promise<void>;

  // goal management
  addGoal:    (g: Pick<Goal, 'title' | 'description'> & Partial<Pick<Goal, 'icon' | 'color'>>) => Promise<string>;
  updateGoal: (id: string, updates: Partial<Pick<Goal, 'title' | 'description' | 'icon' | 'color'>>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  setActiveGoal: (id: string) => void;

  // scoped to active goal
  toggleTask:       (taskId: string) => Promise<void>;

  addCheckIn:    (c: Omit<CheckIn, 'id' | 'timestamp' | 'checkedBy' | 'checkedByUsername' | 'checkedByRole'>) => Promise<void>;
  updateCheckIn: (id: string, updates: Partial<Omit<CheckIn, 'id' | 'timestamp' | 'checkedBy' | 'checkedByUsername' | 'checkedByRole'>>) => Promise<void>;
  deleteCheckIn: (id: string) => Promise<void>;

  addNote:    (n: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;

  addBookmark:    (b: Omit<Bookmark, 'id' | 'addedAt'>) => Promise<void>;
  deleteBookmark: (id: string) => Promise<void>;

  addInspiration:    (i: Omit<Inspiration, 'id' | 'createdAt'>) => Promise<void>;
  updateInspiration: (id: string, updates: Partial<Inspiration>) => Promise<void>;
  deleteInspiration: (id: string) => Promise<void>;

  addPlan:    (p: Omit<Plan, 'id' | 'createdAt' | 'completed' | 'createdBy' | 'createdByUsername' | 'createdByRole' | 'completedAt' | 'completedBy' | 'completedByUsername' | 'completedByRole'>) => Promise<void>;
  updatePlan: (id: string, updates: Partial<Omit<Plan, 'id' | 'createdAt' | 'createdBy' | 'createdByUsername' | 'createdByRole'>>) => Promise<void>;
  deletePlan: (id: string) => Promise<void>;
  togglePlan: (id: string) => Promise<void>;

  // learning paths (scoped to active goal)
  setActivePath:    (id: string) => void;
  addLearningPath:  (p: Omit<LearningPath, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateLearningPath: (id: string, updates: Partial<Pick<LearningPath, 'title' | 'description' | 'phases'>>) => Promise<void>;
  deleteLearningPath: (id: string) => Promise<void>;
  addPhase:    (pathId: string, phase: Omit<Phase, 'id'>) => Promise<void>;
  updatePhase: (pathId: string, phaseId: number, updates: Partial<Omit<Phase, 'id'>>) => Promise<void>;
  deletePhase: (pathId: string, phaseId: number) => Promise<void>;
  
  // sections
  addSection:    (pathId: string, phaseId: number, section: Omit<Section, 'id'>) => Promise<void>;
  updateSection: (pathId: string, phaseId: number, sectionId: string, updates: Partial<Omit<Section, 'id'>>) => Promise<void>;
  deleteSection: (pathId: string, phaseId: number, sectionId: string) => Promise<void>;
  
  // operation logging
  logOperation: (action: string, target: string, targetId: string, details?: Record<string, any>) => void;
  // tasks
  addTask:    (pathId: string, phaseId: number, sectionId: string, task: Omit<Task, 'id'>) => Promise<void>;
  updateTask: (pathId: string, phaseId: number, sectionId: string, taskId: string, updates: Partial<Omit<Task, 'id'>>) => Promise<void>;
  deleteTask: (pathId: string, phaseId: number, sectionId: string, taskId: string) => Promise<void>;
  
  // resources
  addResource:    (pathId: string, phaseId: number, sectionId: string, resource: Resource) => Promise<void>;
  updateResource: (pathId: string, phaseId: number, sectionId: string, resourceId: number, updates: Partial<Resource>) => Promise<void>;
  deleteResource: (pathId: string, phaseId: number, sectionId: string, resourceId: number) => Promise<void>;

  exportData: () => string;
  importData: (jsonString: string) => Promise<void>;
}

// ---------- store ----------

export const useStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // --- state ---
      currentUser: null,
      users: [defaultUser],
      allUserData: initialAllUserData,
      goals: [],
      activeGoalId: null,
      _lastUpdated: '',
      isLoading:    false,
      error:        null,
      operationLogs: [],

      // --- user management ---
      login: async (username: string, password: string) => {
        const { users, allUserData } = get();
        const user = users.find(u => u.username === username && u.password === password);
        
        if (user) {
          // 确保用户对象包含 role 字段
          const userWithRole = {
            ...user,
            role: user.role || 'user' // 默认角色为普通用户
          };
          
          // 确保 lichun 用户始终是管理员
          if (userWithRole.username === 'lichun') {
            userWithRole.role = 'admin';
          }
          
          // 对于助理用户，使用绑定用户的数据
          let targetUserId = userWithRole.id;
          if (userWithRole.role === 'assistant' && userWithRole.boundUserId) {
            targetUserId = userWithRole.boundUserId;
          }
          
          // 确保目标用户数据存在
          if (!allUserData[targetUserId]) {
            allUserData[targetUserId] = {
              goals: [],
              activeGoalId: null,
            };
          }
          
          const userData = allUserData[targetUserId];
          set({
            currentUser: userWithRole,
            goals: userData.goals,
            activeGoalId: userData.activeGoalId,
          });
          return true;
        }
        return false;
      },
      
      logout: () => {
        set({
          currentUser: null,
          goals: [],
          activeGoalId: null,
        });
      },

      // --- user management ---      
      addUser: async (user) => {
        const newUser: User = {
          ...user,
          id: `user-${Date.now()}`,
        };
        set((s) => ({
          users: [...s.users, newUser],
        }));
        return newUser.id;
      },

      updateUser: async (id, updates) => {
        set((s) => ({
          users: s.users.map(u => u.id === id ? { ...u, ...updates } : u),
          // 如果更新的是当前用户，同步更新 currentUser
          currentUser: s.currentUser?.id === id ? { ...s.currentUser, ...updates } : s.currentUser,
        }));
      },

      deleteUser: async (id) => {
        const { currentUser, users, allUserData } = get();
        
        // 不能删除当前登录的用户
        if (currentUser?.id === id) {
          throw new Error('不能删除当前登录的用户');
        }
        
        // 不能删除管理员用户（如果只有一个管理员）
        const adminCount = users.filter(u => u.role === 'admin').length;
        const userToDelete = users.find(u => u.id === id);
        if (userToDelete?.role === 'admin' && adminCount <= 1) {
          throw new Error('至少需要保留一个管理员用户');
        }
        
        // 删除用户和其数据
        const newUsers = users.filter(u => u.id !== id);
        const newAllUserData = { ...allUserData };
        delete newAllUserData[id];
        
        set({
          users: newUsers,
          allUserData: newAllUserData,
        });
      },

      bindAssistant: async (assistantId, boundUserId, boundUserPassword) => {
        const { users } = get();
        
        // 验证助理用户是否存在
        const assistant = users.find(u => u.id === assistantId && u.role === 'assistant');
        if (!assistant) {
          throw new Error('助理用户不存在');
        }
        
        // 验证绑定用户是否存在
        const boundUser = users.find(u => u.id === boundUserId);
        if (!boundUser) {
          throw new Error('绑定用户不存在');
        }
        
        // 验证绑定用户密码
        if (boundUser.password !== boundUserPassword) {
          throw new Error('绑定用户密码错误');
        }
        
        // 绑定助理用户
        set((s) => ({
          users: s.users.map(u => u.id === assistantId ? { ...u, boundUserId } : u),
        }));
        
        return true;
      },

      // --- loadData ---
      loadData: async () => {
        const { currentUser } = get();
        
        if (!isDevelopment) {
          set({ isLoading: true, error: null });
          try {
            const res = await fetch(API_URL);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const blobRaw = await res.json();
            const blobData = parseUserData(blobRaw);

            // 检查是否有有效的目标数据
            const hasValidGoals = blobData.goals && blobData.goals.length > 0;
            const localUpdated = get()._lastUpdated;
            const blobUpdated  = blobData._lastUpdated ?? '';

            // 对于助理用户，使用绑定用户的ID加载数据
            let targetUserId = currentUser?.id;
            if (currentUser?.role === 'assistant' && currentUser.boundUserId) {
              targetUserId = currentUser.boundUserId;
            }

            // 只有当 API 返回了有效数据且时间戳更新时，才更新本地数据
            if (hasValidGoals && (!localUpdated || (blobUpdated && blobUpdated > localUpdated))) {
              // 如果当前有用户登录，更新该用户的数据
              if (targetUserId) {
                set((s) => ({
                  allUserData: {
                    ...s.allUserData,
                    [targetUserId]: blobData,
                  },
                  goals: blobData.goals,
                  activeGoalId: blobData.activeGoalId,
                  isLoading: false,
                }));
              } else {
                set({ ...blobData, isLoading: false });
              }

              // 如果旧格式需要迁移，回写
              if (!blobRaw.goals) {
                await get().saveData();
              }
            } else {
              set({ isLoading: false });
              // 如果 API 返回空数据，使用本地默认数据并保存到服务器
              const { goals } = get();
              if (goals.length > 0) {
                await get().saveData();
              }
            }
          } catch {
            set({ isLoading: false });
          }
        }
      },

      // --- saveData ---
      saveData: async () => {
        const now = new Date().toISOString();
        set({ _lastUpdated: now });

        if (isDevelopment) return;

        const { currentUser, goals, activeGoalId } = get();
        
        // 对于助理用户，使用绑定用户的ID保存数据
        let targetUserId = currentUser?.id;
        if (currentUser?.role === 'assistant' && currentUser.boundUserId) {
          targetUserId = currentUser.boundUserId;
        }
        
        // 更新目标用户的数据
        if (targetUserId) {
          set((s) => ({
            allUserData: {
              ...s.allUserData,
              [targetUserId]: {
                goals,
                activeGoalId,
              },
            },
          }));
        }
        
        try {
          const res = await fetch(API_URL, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              goals, activeGoalId,
              _lastUpdated: now,
            }),
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
        } catch (err) {
          set({ error: (err as Error).message });
        }
      },

      // --- goal management ---
      addGoal: async (goalInput) => {
        const now = new Date().toISOString();
        const newGoal: Goal = {
          id: `goal-${Date.now()}`,
          title: goalInput.title,
          description: goalInput.description,
          icon: goalInput.icon,
          color: goalInput.color,
          createdAt: now,
          updatedAt: now,
          taskProgress: {},
          checkIns: [],
          notes: [],
          bookmarks: [],
          inspirations: [],
          plans: [],
          learningPaths: [],
          activePathId: null,
        };
        set((s) => ({ goals: [...s.goals, newGoal], activeGoalId: newGoal.id }));
        await get().saveData();
        return newGoal.id;
      },

      updateGoal: async (id, updates) => {
        set((s) => ({
          goals: s.goals.map((g) =>
            g.id === id ? { ...g, ...updates, updatedAt: new Date().toISOString() } : g
          ),
        }));
        await get().saveData();
      },

      deleteGoal: async (id) => {
        set((s) => {
          const remaining = s.goals.filter((g) => g.id !== id);
          const newActiveId = s.activeGoalId === id ? (remaining[0]?.id ?? null) : s.activeGoalId;
          return { goals: remaining, activeGoalId: newActiveId };
        });
        await get().saveData();
      },

      setActiveGoal: (id) => {
        set({ activeGoalId: id });
      },

      // --- tasks (scoped to active goal) ---
      toggleTask: async (taskId) => {
        set((s) => updateActiveGoal(s, (g) => ({
          ...g,
          taskProgress: { ...g.taskProgress, [taskId]: !g.taskProgress[taskId] },
        })));
        await get().saveData();
      },

      // --- checkIns (scoped to active goal) ---
      addCheckIn: async (checkIn) => {
        const now = new Date().toISOString();
        const checkInId = `ci-${Date.now()}`;
        const { currentUser } = get();
        set((s) => updateActiveGoal(s, (g) => ({
          ...g,
          checkIns: [{ 
            ...checkIn, 
            id: checkInId, 
            timestamp: now,
            checkedBy: currentUser?.id || '',
            checkedByUsername: currentUser?.username || '',
            checkedByRole: currentUser?.role || '',
          }, ...g.checkIns],
        })));
        
        // 记录操作日志
        get().logOperation('addCheckIn', 'checkIn', checkInId, { content: checkIn.content });
        
        await get().saveData();
      },
      updateCheckIn: async (id, updates) => {
        set((s) => updateActiveGoal(s, (g) => ({
          ...g,
          checkIns: g.checkIns.map((c) => c.id === id ? { ...c, ...updates } : c),
        })));
        await get().saveData();
      },
      deleteCheckIn: async (id) => {
        set((s) => updateActiveGoal(s, (g) => ({
          ...g,
          checkIns: g.checkIns.filter((c) => c.id !== id),
        })));
        await get().saveData();
      },

      // --- notes (scoped to active goal) ---
      addNote: async (note) => {
        const now = new Date().toISOString();
        set((s) => updateActiveGoal(s, (g) => ({
          ...g,
          notes: [...g.notes, { ...note, id: `n-${Date.now()}`, createdAt: now, updatedAt: now }],
        })));
        await get().saveData();
      },
      updateNote: async (id, updates) => {
        set((s) => updateActiveGoal(s, (g) => ({
          ...g,
          notes: g.notes.map((n) => n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n),
        })));
        await get().saveData();
      },
      deleteNote: async (id) => {
        set((s) => updateActiveGoal(s, (g) => ({
          ...g,
          notes: g.notes.filter((n) => n.id !== id),
        })));
        await get().saveData();
      },

      // --- bookmarks (scoped to active goal) ---
      addBookmark: async (bookmark) => {
        set((s) => updateActiveGoal(s, (g) => ({
          ...g,
          bookmarks: [...g.bookmarks, { ...bookmark, id: `bm-${Date.now()}`, addedAt: new Date().toISOString() }],
        })));
        await get().saveData();
      },
      deleteBookmark: async (id) => {
        set((s) => updateActiveGoal(s, (g) => ({
          ...g,
          bookmarks: g.bookmarks.filter((b) => b.id !== id),
        })));
        await get().saveData();
      },

      // --- inspirations (scoped to active goal) ---
      addInspiration: async (inspiration) => {
        set((s) => updateActiveGoal(s, (g) => ({
          ...g,
          inspirations: [{ ...inspiration, id: `ins-${Date.now()}`, createdAt: new Date().toISOString() }, ...g.inspirations],
        })));
        await get().saveData();
      },
      updateInspiration: async (id, updates) => {
        set((s) => updateActiveGoal(s, (g) => ({
          ...g,
          inspirations: g.inspirations.map((i) => i.id === id ? { ...i, ...updates } : i),
        })));
        await get().saveData();
      },
      deleteInspiration: async (id) => {
        set((s) => updateActiveGoal(s, (g) => ({
          ...g,
          inspirations: g.inspirations.filter((i) => i.id !== id),
        })));
        await get().saveData();
      },

      // --- plans (scoped to active goal) ---
      addPlan: async (plan) => {
        const now = new Date().toISOString();
        const planId = `pl-${Date.now()}`;
        const { currentUser } = get();
        set((s) => updateActiveGoal(s, (g) => ({
          ...g,
          plans: [
            ...g.plans,
            { 
              ...plan, 
              id: planId, 
              completed: false, 
              createdAt: now,
              createdBy: currentUser?.id || '',
              createdByUsername: currentUser?.username || '',
              createdByRole: currentUser?.role || '',
            },
          ],
        })));
        
        // 记录操作日志
        get().logOperation('addPlan', 'plan', planId, { date: plan.date, content: plan.content });
        
        await get().saveData();
      },
      updatePlan: async (id, updates) => {
        set((s) => updateActiveGoal(s, (g) => ({
          ...g,
          plans: g.plans.map((p) => p.id === id ? { ...p, ...updates } : p),
        })));
        await get().saveData();
      },
      deletePlan: async (id) => {
        set((s) => updateActiveGoal(s, (g) => ({
          ...g,
          plans: g.plans.filter((p) => p.id !== id),
        })));
        await get().saveData();
      },
      togglePlan: async (id) => {
        const now = new Date().toISOString();
        const { currentUser } = get();
        set((s) => updateActiveGoal(s, (g) => ({
          ...g,
          plans: g.plans.map((p) =>
            p.id === id
              ? { 
                  ...p, 
                  completed: !p.completed, 
                  completedAt: p.completed ? undefined : now,
                  completedBy: p.completed ? undefined : currentUser?.id,
                  completedByUsername: p.completed ? undefined : currentUser?.username,
                  completedByRole: p.completed ? undefined : currentUser?.role,
                }
              : p
          ),
        })));
        
        // 记录操作日志
        get().logOperation('togglePlan', 'plan', id, { completed: true });
        
        await get().saveData();
      },

      // --- learning paths (scoped to active goal) ---
      setActivePath: (id) => {
        set((s) => updateActiveGoal(s, (g) => ({ ...g, activePathId: id })));
      },

      addLearningPath: async (path) => {
        const now = new Date().toISOString();
        const newPath: LearningPath = {
          ...path,
          id: `lp-${Date.now()}`,
          createdAt: now,
          updatedAt: now,
        };
        set((s) => updateActiveGoal(s, (g) => ({
          ...g,
          learningPaths: [...g.learningPaths, newPath],
          activePathId: newPath.id,
        })));
        await get().saveData();
        return newPath.id;
      },

      updateLearningPath: async (id, updates) => {
        set((s) => updateActiveGoal(s, (g) => ({
          ...g,
          learningPaths: g.learningPaths.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
          ),
        })));
        await get().saveData();
      },

      deleteLearningPath: async (id) => {
        set((s) => updateActiveGoal(s, (g) => {
          const remaining = g.learningPaths.filter((p) => p.id !== id);
          const newActiveId = g.activePathId === id ? (remaining[0]?.id ?? null) : g.activePathId;
          return { ...g, learningPaths: remaining, activePathId: newActiveId };
        }));
        await get().saveData();
      },

      addPhase: async (pathId, phase) => {
        set((s) => updateActiveGoal(s, (g) => ({
          ...g,
          learningPaths: g.learningPaths.map((p) => {
            if (p.id !== pathId) return p;
            const maxId = p.phases.reduce((m, ph) => Math.max(m, ph.id), 0);
            const newPhase = { ...phase, id: maxId + 1 };
            return { ...p, phases: [...p.phases, newPhase], updatedAt: new Date().toISOString() };
          }),
        })));
        await get().saveData();
      },

      updatePhase: async (pathId, phaseId, updates) => {
        set((s) => updateActiveGoal(s, (g) => ({
          ...g,
          learningPaths: g.learningPaths.map((p) => {
            if (p.id !== pathId) return p;
            return {
              ...p,
              phases: p.phases.map((ph) => ph.id === phaseId ? { ...ph, ...updates } : ph),
              updatedAt: new Date().toISOString(),
            };
          }),
        })));
        await get().saveData();
      },

      deletePhase: async (pathId, phaseId) => {
        set((s) => updateActiveGoal(s, (g) => ({
          ...g,
          learningPaths: g.learningPaths.map((p) => {
            if (p.id !== pathId) return p;
            return {
              ...p,
              phases: p.phases.filter((ph) => ph.id !== phaseId),
              updatedAt: new Date().toISOString(),
            };
          }),
        })));
        await get().saveData();
      },

      // --- sections ---      
      addSection: async (pathId, phaseId, section) => {
        set((s) => updateActiveGoal(s, (g) => ({
          ...g,
          learningPaths: g.learningPaths.map((p) => {
            if (p.id !== pathId) return p;
            return {
              ...p,
              phases: p.phases.map((ph) => {
                if (ph.id !== phaseId) return ph;
                return {
                  ...ph,
                  sections: [...ph.sections, { ...section, id: `sec-${Date.now()}` } as Section],
                };
              }),
              updatedAt: new Date().toISOString(),
            };
          }),
        })));
        await get().saveData();
      },

      updateSection: async (pathId, phaseId, sectionId, updates) => {
        set((s) => updateActiveGoal(s, (g) => ({
          ...g,
          learningPaths: g.learningPaths.map((p) => {
            if (p.id !== pathId) return p;
            return {
              ...p,
              phases: p.phases.map((ph) => {
                if (ph.id !== phaseId) return ph;
                return {
                  ...ph,
                  sections: ph.sections.map((sec) => sec.id === sectionId ? { ...sec, ...updates } : sec),
                };
              }),
              updatedAt: new Date().toISOString(),
            };
          }),
        })));
        await get().saveData();
      },

      deleteSection: async (pathId, phaseId, sectionId) => {
        set((s) => updateActiveGoal(s, (g) => ({
          ...g,
          learningPaths: g.learningPaths.map((p) => {
            if (p.id !== pathId) return p;
            return {
              ...p,
              phases: p.phases.map((ph) => {
                if (ph.id !== phaseId) return ph;
                return {
                  ...ph,
                  sections: ph.sections.filter((sec) => sec.id !== sectionId),
                };
              }),
              updatedAt: new Date().toISOString(),
            };
          }),
        })));
        await get().saveData();
      },

      // --- tasks ---      
      addTask: async (pathId, phaseId, sectionId, task) => {
        set((s) => updateActiveGoal(s, (g) => ({
          ...g,
          learningPaths: g.learningPaths.map((p) => {
            if (p.id !== pathId) return p;
            return {
              ...p,
              phases: p.phases.map((ph) => {
                if (ph.id !== phaseId) return ph;
                return {
                  ...ph,
                  sections: ph.sections.map((sec) => {
                    if (sec.id !== sectionId) return sec;
                    return {
                      ...sec,
                      tasks: [...sec.tasks, { ...task, id: `task-${Date.now()}` } as Task],
                    };
                  }),
                };
              }),
              updatedAt: new Date().toISOString(),
            };
          }),
        })));
        await get().saveData();
      },

      updateTask: async (pathId, phaseId, sectionId, taskId, updates) => {
        set((s) => updateActiveGoal(s, (g) => ({
          ...g,
          learningPaths: g.learningPaths.map((p) => {
            if (p.id !== pathId) return p;
            return {
              ...p,
              phases: p.phases.map((ph) => {
                if (ph.id !== phaseId) return ph;
                return {
                  ...ph,
                  sections: ph.sections.map((sec) => {
                    if (sec.id !== sectionId) return sec;
                    return {
                      ...sec,
                      tasks: sec.tasks.map((t) => t.id === taskId ? { ...t, ...updates } : t),
                    };
                  }),
                };
              }),
              updatedAt: new Date().toISOString(),
            };
          }),
        })));
        await get().saveData();
      },

      deleteTask: async (pathId, phaseId, sectionId, taskId) => {
        set((s) => updateActiveGoal(s, (g) => ({
          ...g,
          learningPaths: g.learningPaths.map((p) => {
            if (p.id !== pathId) return p;
            return {
              ...p,
              phases: p.phases.map((ph) => {
                if (ph.id !== phaseId) return ph;
                return {
                  ...ph,
                  sections: ph.sections.map((sec) => {
                    if (sec.id !== sectionId) return sec;
                    return {
                      ...sec,
                      tasks: sec.tasks.filter((t) => t.id !== taskId),
                    };
                  }),
                };
              }),
              updatedAt: new Date().toISOString(),
            };
          }),
        })));
        await get().saveData();
      },

      // --- resources ---      
      addResource: async (pathId, phaseId, sectionId, resource) => {
        set((s) => updateActiveGoal(s, (g) => ({
          ...g,
          learningPaths: g.learningPaths.map((p) => {
            if (p.id !== pathId) return p;
            return {
              ...p,
              phases: p.phases.map((ph) => {
                if (ph.id !== phaseId) return ph;
                return {
                  ...ph,
                  sections: ph.sections.map((sec) => {
                    if (sec.id !== sectionId) return sec;
                    return {
                      ...sec,
                      resources: [...sec.resources, resource],
                    };
                  }),
                };
              }),
              updatedAt: new Date().toISOString(),
            };
          }),
        })));
        await get().saveData();
      },

      updateResource: async (pathId, phaseId, sectionId, resourceId, updates) => {
        set((s) => updateActiveGoal(s, (g) => ({
          ...g,
          learningPaths: g.learningPaths.map((p) => {
            if (p.id !== pathId) return p;
            return {
              ...p,
              phases: p.phases.map((ph) => {
                if (ph.id !== phaseId) return ph;
                return {
                  ...ph,
                  sections: ph.sections.map((sec) => {
                    if (sec.id !== sectionId) return sec;
                    return {
                      ...sec,
                      resources: sec.resources.map((r, idx) => idx === resourceId ? { ...r, ...updates } : r),
                    };
                  }),
                };
              }),
              updatedAt: new Date().toISOString(),
            };
          }),
        })));
        await get().saveData();
      },

      deleteResource: async (pathId, phaseId, sectionId, resourceId) => {
        set((s) => updateActiveGoal(s, (g) => ({
          ...g,
          learningPaths: g.learningPaths.map((p) => {
            if (p.id !== pathId) return p;
            return {
              ...p,
              phases: p.phases.map((ph) => {
                if (ph.id !== phaseId) return ph;
                return {
                  ...ph,
                  sections: ph.sections.map((sec) => {
                    if (sec.id !== sectionId) return sec;
                    return {
                      ...sec,
                      resources: sec.resources.filter((_, idx) => idx !== resourceId),
                    };
                  }),
                };
              }),
              updatedAt: new Date().toISOString(),
            };
          }),
        })));
        await get().saveData();
      },

      // --- export / import ---
      exportData: () => {
        const { goals, activeGoalId } = get();
        return JSON.stringify({ goals, activeGoalId }, null, 2);
      },
      importData: async (jsonString) => {
        try {
          const raw = JSON.parse(jsonString);
          const data = parseUserData(raw);
          const { currentUser } = get();
          
          if (currentUser) {
            // 更新当前用户的数据
            set((s) => ({
              allUserData: {
                ...s.allUserData,
                [currentUser.id]: data,
              },
              goals: data.goals,
              activeGoalId: data.activeGoalId,
            }));
          } else {
            // 如果没有用户登录，只更新本地状态
            set({
              goals: data.goals,
              activeGoalId: data.activeGoalId,
            });
          }
          
          // 记录操作日志
          get().logOperation('importData', 'data', 'all', { goalsCount: data.goals.length });
          
          await get().saveData();
        } catch (err) {
          console.error('Failed to import data:', err);
        }
      },

      // --- operation logging ---
      logOperation: (action: string, target: string, targetId: string, details?: Record<string, any>) => {
        const { currentUser } = get();
        if (currentUser) {
          set((s) => ({
            operationLogs: [
              {
                id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                userId: currentUser.id,
                username: currentUser.username,
                userRole: currentUser.role,
                action,
                target,
                targetId,
                timestamp: new Date().toISOString(),
                details,
              },
              ...s.operationLogs,
            ].slice(0, 1000), // 只保留最近1000条日志
          }));
        }
      },
    }),
    {
      name: STORAGE_KEY,
      version: STORAGE_VERSION,
      partialize: (state) => ({
        currentUser: state.currentUser,
        users: state.users,
        allUserData: state.allUserData,
        goals: state.goals,
        activeGoalId: state.activeGoalId,
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
        // v2→v3: checkIn 新增 planSnapshot 可选字段，旧数据无需补充
        // v3→v4: 新增 learningPaths / activePathId
        if (version < 4) {
          if (!persisted.learningPaths || persisted.learningPaths.length === 0) {
            const builtin = makeBuiltinPath();
            persisted.learningPaths = [builtin];
            persisted.activePathId = builtin.id;
          }
        }
        // v4→v5: 引入 Goal 实体，将扁平数据包装进 goals 数组
        if (version < 5) {
          if (!persisted.goals) {
            const goal: Goal = {
              id: DEFAULT_GOAL_ID,
              title: 'AI PM 学习路径',
              description: '6个月转型计划',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              taskProgress: persisted.taskProgress || {},
              checkIns: migrateCheckIns(persisted.checkIns || []),
              notes: persisted.notes || [],
              bookmarks: persisted.bookmarks || [],
              inspirations: persisted.inspirations || [],
              plans: persisted.plans || [],
              learningPaths: persisted.learningPaths || [makeBuiltinPath()],
              activePathId: persisted.activePathId ?? BUILTIN_PATH_ID,
            };
            persisted.goals = [goal];
            persisted.activeGoalId = goal.id;
            // 清理旧字段
            delete persisted.taskProgress;
            delete persisted.checkIns;
            delete persisted.notes;
            delete persisted.bookmarks;
            delete persisted.inspirations;
            delete persisted.plans;
            delete persisted.learningPaths;
            delete persisted.activePathId;
          }
        }
        // v5→v6: 引入用户管理
        if (version < 6) {
          // 初始化用户数据
          if (!persisted.users) {
            persisted.users = [defaultUser];
          }
          if (!persisted.allUserData) {
            persisted.allUserData = {
              'user-1': {
                goals: persisted.goals || [makeDefaultGoal()],
                activeGoalId: persisted.activeGoalId || DEFAULT_GOAL_ID,
              },
            };
          }
          if (!persisted.currentUser) {
            persisted.currentUser = null;
          }
        }
        return persisted;
      },
    }
  )
);

// ---------- selector hooks ----------

export function useActiveGoal(): Goal | undefined {
  return useStore((s) => s.goals.find((g) => g.id === s.activeGoalId));
}

export function useGoalData<T>(selector: (goal: Goal) => T): T | undefined {
  return useStore((s) => {
    const goal = s.goals.find((g) => g.id === s.activeGoalId);
    return goal ? selector(goal) : undefined;
  });
}
