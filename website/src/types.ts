export interface Task {
  id: string;
  text: string;
}

export interface Resource {
  title: string;
  url?: string;
  type: 'book' | 'course' | 'article' | 'tool' | 'newsletter' | 'blog' | 'podcast';
  description?: string;
}

export interface Section {
  id: string;
  title: string;
  duration: string;
  tasks: Task[];
  resources: Resource[];
}

export interface Phase {
  id: number;
  month: number;
  title: string;
  subtitle: string;
  color: string;
  sections: Section[];
}

export interface PlanSnapshot {
  id: string;
  content: string;
  completed: boolean;
}

export interface CheckIn {
  id: string;
  timestamp: string;
  content: string;
  duration: number;
  phaseId: number;
  checkedBy: string; // 打卡用户ID
  checkedByUsername: string; // 打卡用户名
  checkedByRole: string; // 打卡用户角色
  planSnapshot?: PlanSnapshot[]; // 打卡时当日计划的快照
}

export interface Note {
  id: string;
  title: string;
  content: string;
  phaseId?: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Bookmark {
  id: string;
  title: string;
  url: string;
  category: string;
  note?: string;
  addedAt: string;
}

export type InspirationColor = 'yellow' | 'blue' | 'green' | 'pink' | 'purple' | 'orange';

export interface Inspiration {
  id: string;
  content: string;
  color: InspirationColor;
  tags: string[];
  createdAt: string;
}

export interface Plan {
  id: string;
  date: string;       // YYYY-MM-DD
  content: string;
  completed: boolean;
  createdAt: string;
  createdBy: string; // 创建用户ID
  createdByUsername: string; // 创建用户名
  createdByRole: string; // 创建用户角色
  completedAt?: string; // 完成时间
  completedBy?: string; // 完成用户ID
  completedByUsername?: string; // 完成用户名
  completedByRole?: string; // 完成用户角色
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  phases: Phase[];
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  icon?: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
  taskProgress: Record<string, boolean>;
  checkIns: CheckIn[];
  notes: Note[];
  bookmarks: Bookmark[];
  inspirations: Inspiration[];
  plans: Plan[];
  learningPaths: LearningPath[];
  activePathId: string | null;
}

export type UserRole = 'admin' | 'user' | 'assistant';

export interface User {
  id: string;
  username: string;
  password: string;
  role: UserRole;
  boundUserId?: string; // 助理用户绑定的用户ID
}

export interface UserData {
  goals: Goal[];
  activeGoalId: string | null;
}

export interface AllUserData {
  [userId: string]: UserData;
}

export interface OperationLog {
  id: string;
  userId: string;
  username: string;
  userRole: string;
  action: string;
  target: string;
  targetId: string;
  timestamp: string;
  details?: Record<string, any>;
}
