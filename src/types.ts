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

export type Page = "projects" | "backlog";
