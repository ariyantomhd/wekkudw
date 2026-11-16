// src/types/auth.ts
import type { Request } from 'express';
import { UserRole, AccountStatus } from './enums';

export interface User {
  id: string;
  email: string;
  password?: string;
  username: string;
  creator_number?: number;
  avatar_url: string | null;
  role: UserRole;
  status: AccountStatus;
  created_at: string;
  updated_at: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
}

export type RegisterDTO = RegisterPayload;

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthTokenResponse {
  token: string;
  access_token?: string;
  user: User;
}

export interface UpdateUserProfileInput {
  username: string;
  avatar_url: string | null;
}

export interface UpdateUserPasswordInput {
  new_password: string;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
  status?: AccountStatus;
  [key: string]: unknown;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
  userId?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      userId?: string;
    }
  }
}
