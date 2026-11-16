// src/types/customDev.ts

export type ProjectCategoryType =
  | 'dapps-web3'
  | 'blog-cms'
  | 'android-apps'
  | 'web-applications'
  | 'custom-development';

export type RequestStatus = 'PENDING' | 'REVIEWING' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';

export interface CustomDevRequest {
  id?: number;
  client_name: string;
  client_email: string;
  company_name?: string;
  project_title: string;
  project_type: ProjectCategoryType;
  budget_range: string;
  timeline: string;
  description: string;
  status?: RequestStatus;
  created_at?: string;
}
