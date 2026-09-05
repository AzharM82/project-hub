export const AREAS = ["Trading", "Learning", "Productivity", "Infrastructure", "Personal & Faith"] as const;
export type Area = (typeof AREAS)[number];

export const PROJECT_STATUSES = ["live", "paper", "local", "repo-only", "archived"] as const;
export const BACKLOG_STATUSES = ["idea", "planned", "in-progress", "done", "dropped"] as const;
export const PRIORITIES = ["high", "medium", "low"] as const;

export interface Project {
  id: string;
  name: string;
  url: string;
  github: string;
  purpose: string;
  stack: string;
  status: string;
  cost: string;
  category: string;
  area: string;
  details: string;
  seeded?: boolean;
  updatedAt?: string;
}

export interface BacklogItem {
  id: string;
  title: string;
  description: string;
  category: string;
  area: string;
  priority: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
}

export interface MaintenanceTask {
  id: string;
  project: string;
  task: string;
  category: string;
  dueDate: string;
  status: string;
  notes: string;
  createdAt: string;
}

export type Page = "projects" | "backlog" | "admin";
