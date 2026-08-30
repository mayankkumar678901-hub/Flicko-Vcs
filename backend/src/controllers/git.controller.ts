import { Response } from 'express';
import { prisma } from '../config/db';
import { AuthRequest } from '../middleware/auth';
import { GitService } from '../services/git.service';

export class GitController {
  private static async getRepoPath(ownerUsername: string, repoName: string) {
    const owner = await prisma.user.findUnique({ where: { username: ownerUsername } });
    if (!owner) throw new Error('Owner not found');

    const repo = await prisma.repository.findFirst({
      where: { ownerId: owner.id, name: repoName },
    });

    if (!repo) throw new Error('Repository not found');
    return { repo, path: repo.storagePath };
  }

  static async getBranches(req: AuthRequest, res: Response) {
    try {
      const { owner, repo } = req.params;
      const { path: repoPath } = await GitController.getRepoPath(owner, repo);

      const branches = await GitService.listBranches(repoPath);
      return res.json({ branches });
    } catch (error: any) {
      return res.status(404).json({ error: error.message });
    }
  }

  static async createBranch(req: AuthRequest, res: Response) {
    try {
      const { owner, repo } = req.params;
      const { name, startPoint } = req.body;

      if (!name) return res.status(400).json({ error: 'Branch name is required' });

      const { path: repoPath } = await GitController.getRepoPath(owner, repo);
      await GitService.createBranch(repoPath, name, startPoint || 'HEAD');

      return res.status(201).json({ message: `Branch ${name} created successfully` });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async deleteBranch(req: AuthRequest, res: Response) {
    try {
      const { owner, repo, branch } = req.params;
      const { path: repoPath } = await GitController.getRepoPath(owner, repo);

      await GitService.deleteBranch(repoPath, branch);
      return res.json({ message: `Branch ${branch} deleted` });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async getTree(req: AuthRequest, res: Response) {
    try {
      const { owner, repo } = req.params;
      const ref = (req.query.ref as string) || 'main';
      const subPath = (req.query.path as string) || '';

      const { path: repoPath } = await GitController.getRepoPath(owner, repo);
      const tree = await GitService.getTree(repoPath, ref, subPath);

      return res.json({ tree, ref, path: subPath });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async getBlob(req: AuthRequest, res: Response) {
    try {
      const { owner, repo } = req.params;
      const ref = (req.query.ref as string) || 'main';
      const filePath = (req.query.path as string) || '';

      if (!filePath) return res.status(400).json({ error: 'File path is required' });

      const { path: repoPath } = await GitController.getRepoPath(owner, repo);
      const content = await GitService.getBlob(repoPath, ref, filePath);

      return res.json({ content, ref, path: filePath });
    } catch (error: any) {
      return res.status(404).json({ error: error.message });
    }
  }

  static async commitFile(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Authentication required' });

      const { owner, repo } = req.params;
      const { path: filePath, content, commitMessage, branch } = req.body;

      if (!filePath || content === undefined || !commitMessage) {
        return res.status(400).json({ error: 'Path, content, and commit message are required' });
      }

      const { path: repoPath, repo: repoDoc } = await GitController.getRepoPath(owner, repo);
      const targetBranch = branch || repoDoc.defaultBranch;

      // Find logged in user email
      const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
      const email = user?.email || `${req.user.username}@vcs.local`;

      await GitService.commitFileChange(
        repoPath,
        targetBranch,
        filePath,
        content,
        commitMessage,
        req.user.username,
        email
      );

      return res.status(200).json({ message: 'File committed successfully', branch: targetBranch });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async getCommits(req: AuthRequest, res: Response) {
    try {
      const { owner, repo } = req.params;
      const ref = (req.query.ref as string) || 'main';
      const limit = parseInt((req.query.limit as string) || '50', 10);

      const { path: repoPath } = await GitController.getRepoPath(owner, repo);
      const commits = await GitService.getCommits(repoPath, ref, limit);

      return res.json({ commits, ref });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async getCommitDetail(req: AuthRequest, res: Response) {
    try {
      const { owner, repo, sha } = req.params;
      const { path: repoPath } = await GitController.getRepoPath(owner, repo);

      const detail = await GitService.getCommitDetail(repoPath, sha);
      return res.json(detail);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}
