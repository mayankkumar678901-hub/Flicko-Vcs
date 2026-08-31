import { Router } from 'express';
import { GitController } from '../controllers/git.controller';
import { AIController } from '../controllers/ai.controller';
import { authenticateJWT, optionalJWT } from '../middleware/auth';

const router = Router();

// Branch endpoints
router.get('/:owner/:repo/branches', optionalJWT, GitController.getBranches);
router.post('/:owner/:repo/branches', authenticateJWT, GitController.createBranch);
router.delete('/:owner/:repo/branches/:branch', authenticateJWT, GitController.deleteBranch);

// File tree & blob endpoints
router.get('/:owner/:repo/tree', optionalJWT, GitController.getTree);
router.get('/:owner/:repo/blob', optionalJWT, GitController.getBlob);

// Commit changes endpoint
router.post('/:owner/:repo/contents', authenticateJWT, GitController.commitFile);

// Commit history & diff endpoints
router.get('/:owner/:repo/commits', optionalJWT, GitController.getCommits);
router.get('/:owner/:repo/commit/:sha', optionalJWT, GitController.getCommitDetail);

// AI Assistant endpoints
router.post('/ai/commit-message', optionalJWT, AIController.generateCommitMessage);
router.get('/:owner/:repo/ai/explain/:sha', optionalJWT, AIController.explainCommitDiff);

export default router;
