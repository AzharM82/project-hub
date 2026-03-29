export interface Project {
  id: string;
  name: string;
  url: string;
  github: string;
  purpose: string;
  stack: string;
  status: string;
  cost: string;
}

export interface BacklogItem {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  createdAt: string;
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
