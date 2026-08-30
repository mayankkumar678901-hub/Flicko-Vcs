import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor to attach Authorization header
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('vcs_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
}

export interface Repository {
  id: string;
  name: string;
  description?: string;
  isPrivate: boolean;
  defaultBranch: string;
  owner: User;
  createdAt: string;
  updatedAt: string;
}

export interface TreeItem {
  name: string;
  path: string;
  type: 'tree' | 'blob';
  sha?: string;
  size?: number;
}

export interface CommitItem {
  sha: string;
  shortSha: string;
  message: string;
  authorName: string;
  authorEmail: string;
  date: string;
}

export interface FileDiff {
  oldPath: string;
  newPath: string;
  status: 'added' | 'deleted' | 'modified';
  additions: number;
  deletions: number;
  diffText: string;
}
