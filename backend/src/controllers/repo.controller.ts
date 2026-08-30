import { Response } from 'express';
import path from 'path';
import fs from 'fs';
import { prisma } from '../config/db';
import { AuthRequest } from '../middleware/auth';
import { GitService } from '../services/git.service';

const STORAGE_ROOT = process.env.REPOS_STORAGE_PATH || './repos_storage';

export class RepoController {
  static async createRepo(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { name, description, isPrivate, defaultBranch } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Repository name is required' });
      }

      const cleanName = name.trim().toLowerCase().replace(/[^a-z0-9._-]/g, '-');

      const existing = await prisma.repository.findFirst({
        where: {
          ownerId: req.user.userId,
          name: cleanName,
        },
      });

      if (existing) {
        return res.status(400).json({ error: 'Repository name already exists for your account' });
      }

      const ownerDir = req.user.username;
      const absoluteRepoPath = path.resolve(STORAGE_ROOT, ownerDir, cleanName);

      const branch = defaultBranch || 'main';

      // Initialize Git repository on disk with README.md
      await GitService.initRepository(absoluteRepoPath, cleanName, description, branch);

      // Create database record
      const repo = await prisma.repository.create({
        data: {
          name: cleanName,
          description: description || '',
          isPrivate: Boolean(isPrivate),
          defaultBranch: branch,
          storagePath: absoluteRepoPath,
          ownerId: req.user.userId,
        },
        include: {
          owner: {
            select: { id: true, username: true, avatarUrl: true },
          },
        },
      });

      return res.status(201).json({ repo });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'Failed to create repository' });
    }
  }

  static async listRepos(req: AuthRequest, res: Response) {
    try {
      const search = (req.query.search as string) || '';

      const repos = await prisma.repository.findMany({
        where: {
          isPrivate: false,
          name: {
            contains: search,
          },
        },
        include: {
          owner: {
            select: { id: true, username: true, avatarUrl: true },
          },
        },
        orderBy: { updatedAt: 'desc' },
      });

      return res.json({ repos });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async getRepo(req: AuthRequest, res: Response) {
    try {
      const { owner, repo: repoName } = req.params;

      const user = await prisma.user.findUnique({ where: { username: owner } });
      if (!user) {
        return res.status(404).json({ error: 'Owner not found' });
      }

      const repo = await prisma.repository.findFirst({
        where: {
          ownerId: user.id,
          name: repoName,
        },
        include: {
          owner: {
            select: { id: true, username: true, avatarUrl: true },
          },
        },
      });

      if (!repo) {
        return res.status(404).json({ error: 'Repository not found' });
      }

      return res.json({ repo });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async deleteRepo(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
      const { owner, repo: repoName } = req.params;

      const user = await prisma.user.findUnique({ where: { username: owner } });
      if (!user || user.id !== req.user.userId) {
        return res.status(403).json({ error: 'You do not have permission to delete this repository' });
      }

      const repo = await prisma.repository.findFirst({
        where: { ownerId: user.id, name: repoName },
      });

      if (!repo) return res.status(404).json({ error: 'Repository not found' });

      // Delete disk files
      if (fs.existsSync(repo.storagePath)) {
        fs.rmSync(repo.storagePath, { recursive: true, force: true });
      }

      // Delete DB entry
      await prisma.repository.delete({ where: { id: repo.id } });

      return res.json({ message: 'Repository deleted successfully' });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}
