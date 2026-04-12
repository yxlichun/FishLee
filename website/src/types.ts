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

export interface UserData {
  goals: Goal[];
  activeGoalId: string | null;
}
