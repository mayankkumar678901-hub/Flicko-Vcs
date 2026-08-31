import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { AIService } from '../services/ai.service';
import { GitService } from '../services/git.service';
import { prisma } from '../config/db';

export class AIController {
  private static async getRepoPath(ownerUsername: string, repoName: string) {
    const owner = await prisma.user.findUnique({ where: { username: ownerUsername } });
    if (!owner) throw new Error('Owner not found');

    const repo = await prisma.repository.findFirst({
      where: { ownerId: owner.id, name: repoName },
    });

    if (!repo) throw new Error('Repository not found');
    return { repo, path: repo.storagePath };
  }

  static async generateCommitMessage(req: AuthRequest, res: Response) {
    try {
      const { path: filePath, content, oldContent } = req.body;

      if (!filePath || content === undefined) {
        return res.status(400).json({ error: 'filePath and content are required' });
      }

      const suggestion = AIService.generateCommitMessage(filePath, content, oldContent);
      return res.json({ suggestion });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'AI generation failed' });
    }
  }

  static async explainCommitDiff(req: AuthRequest, res: Response) {
    try {
      const { owner, repo, sha } = req.params;
      const { path: repoPath } = await AIController.getRepoPath(owner, repo);

      const commitDetail = await GitService.getCommitDetail(repoPath, sha);
      const explanation = AIService.explainDiff(commitDetail.commit.message, commitDetail.diffs);

      return res.json({ explanation, commit: commitDetail.commit });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'Failed to explain commit diff' });
    }
  }
}
