import { Response } from 'express';
import path from 'path';
import fs from 'fs';
import { prisma } from '../config/db';
import { AuthRequest } from '../middleware/auth';
import { GitService } from '../services/git.service';
import { AiProjectGeneratorService } from '../services/ai-project-generator.service';

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

  static async generateAiRepo(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { prompt, name, isPrivate } = req.body;

      if (!prompt || !prompt.trim()) {
        return res.status(400).json({ error: 'AI prompt is required to generate a project' });
      }

      // Generate clean repo name if not provided
      let cleanName = name
        ? name.trim().toLowerCase().replace(/[^a-z0-9._-]/g, '-')
        : prompt
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .split(/\s+/)
            .slice(0, 4)
            .join('-');

      if (!cleanName || cleanName.length < 2) {
        cleanName = 'ai-app-' + Math.floor(Math.random() * 1000);
      }

      // Check if repo already exists
      const existing = await prisma.repository.findFirst({
        where: {
          ownerId: req.user.userId,
          name: cleanName,
        },
      });

      if (existing) {
        cleanName = `${cleanName}-${Math.floor(Math.random() * 1000)}`;
      }

      const ownerDir = req.user.username;
      const absoluteRepoPath = path.resolve(STORAGE_ROOT, ownerDir, cleanName);
      const branch = 'main';

      // 1. Synthesize multi-file project files from AI prompt
      const generated = AiProjectGeneratorService.generateProjectFromPrompt(prompt, cleanName, req.user.username);

      // 2. Initialize Git repo
      await GitService.initRepository(absoluteRepoPath, cleanName, generated.summary, branch);

      // 3. Commit synthesized files with structured Git commits
      await GitService.commitFileChange(
        absoluteRepoPath,
        branch,
        'index.html',
        generated['index.html'],
        'feat(ui): add index.html structure',
        req.user.username,
        `${req.user.username}@flicko.dev`
      );

      await GitService.commitFileChange(
        absoluteRepoPath,
        branch,
        'style.css',
        generated['style.css'],
        'style(theme): add responsive styling and animations',
        req.user.username,
        `${req.user.username}@flicko.dev`
      );

      await GitService.commitFileChange(
        absoluteRepoPath,
        branch,
        'app.js',
        generated['app.js'],
        'feat(logic): implement interactive logic and state',
        req.user.username,
        `${req.user.username}@flicko.dev`
      );

      await GitService.commitFileChange(
        absoluteRepoPath,
        branch,
        'README.md',
        generated['README.md'],
        'docs(readme): add project documentation and prompt info',
        req.user.username,
        `${req.user.username}@flicko.dev`
      );

      // 4. Create database record
      const repo = await prisma.repository.create({
        data: {
          name: cleanName,
          description: generated.summary,
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

      return res.status(201).json({ repo, summary: generated.summary });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'Failed to generate AI repository' });
    }
  }

  static async listRepos(req: AuthRequest, res: Response) {
    try {
      const search = (req.query.search as string) || '';

      const whereClause: any = { isPrivate: false };
      if (search.trim()) {
        whereClause.name = { contains: search.trim() };
      }

      const repos = await prisma.repository.findMany({
        where: whereClause,
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
