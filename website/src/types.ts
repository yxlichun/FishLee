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

export interface CheckIn {
  id: string;
  timestamp: string;
  content: string;
  duration: number;
  phaseId: number;
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

export interface UserData {
  taskProgress: Record<string, boolean>;
  checkIns: CheckIn[];
  notes: Note[];
  bookmarks: Bookmark[];
  inspirations: Inspiration[];
}
