export enum UserRole {
  MANAGER = "manager",
  INFLUENCER = "influencer",
}

export enum ProjectStatus {
  ACTIVE = "active",
  COMPLETED = "completed",
}

export enum WorkflowStage {
  SCENARIO = "scenario",
  MATERIAL = "material",
  PUBLICATION = "publication",
}

export interface User {
  id: number;
  username: string;
  name: string;
  role: UserRole;
  profile_image?: string;
  created_at: string;
  email?: string;
}

export interface Project {
  id: number;
  title: string;
  client: string;
  description?: string;
  key_requirements?: string[];
  start_date: string;
  deadline?: string;
  scenario_deadline?: string;
  material_deadline?: string;
  publication_deadline?: string;
  status: ProjectStatus;
  workflow_stage: WorkflowStage;
  budget?: number;
  erid?: string;
  manager_id: number;
  technical_links?: { title: string; url: string }[];
  platforms?: string[];
  created_at: string;
}

export interface Comment {
  id: number;
  projectId: number;
  userId: number;
  content: string;
  createdAt: string;
}

export interface Activity {
  id: number;
  project_id: number;
  user_id: number;
  activity_type: string;
  description: string;
  created_at: string;
}

export interface Scenario {
  id: number;
  project_id: number;
  influencer_id?: number;
  content: string;
  google_doc_url?: string;
  status?: string;
  created_at?: string;
  submitted_at?: string;
  approved_at?: string;
  deadline?: string;
}

export interface Material {
  id: number;
  project_id: number;
  influencer_id: number;
  material_url: string;
  google_drive_url?: string;
  description?: string;
  status?: string;
  submitted_at?: string;
  approved_at?: string;
  deadline?: string;
}

export interface Publication {
  id: number;
  project_id: number;
  influencer_id: number;
  platform: string;
  publication_url: string;
  published_at: string;
  status?: string;
  verified_at?: string;
}

export interface Influencer {
  id: number;
  nickname: string;
  instagram_handle?: string;
  tiktok_handle?: string;
  instagram_followers?: number;
  tiktok_followers?: number;
  created_at: string;
} 