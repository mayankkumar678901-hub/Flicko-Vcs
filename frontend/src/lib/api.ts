import axios from 'axios';

// Always target the live active Render PostgreSQL backend in production/browser
function getBaseUrl(): string {
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:5000/api';
    }
    return 'https://flicko-vcs.onrender.com/api';
  }
  return process.env.NEXT_PUBLIC_API_URL || 'https://flicko-vcs.onrender.com/api';
}

export const api = axios.create({
  baseURL: getBaseUrl(),
});

// Dynamic request interceptor to guarantee the right backend URL and attach Authorization header
api.interceptors.request.use((config) => {
  config.baseURL = getBaseUrl();
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
