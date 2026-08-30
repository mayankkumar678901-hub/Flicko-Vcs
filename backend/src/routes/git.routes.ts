import { Router } from 'express';
import { GitController } from '../controllers/git.controller';
import { authenticateJWT, optionalJWT } from '../middleware/auth';

const router = Router();

router.get('/:owner/:repo/branches', optionalJWT, GitController.getBranches);
router.post('/:owner/:repo/branches', authenticateJWT, GitController.createBranch);
router.delete('/:owner/:repo/branches/:branch', authenticateJWT, GitController.deleteBranch);

router.get('/:owner/:repo/tree', optionalJWT, GitController.getTree);
router.get('/:owner/:repo/blob', optionalJWT, GitController.getBlob);

router.post('/:owner/:repo/contents', authenticateJWT, GitController.commitFile);

router.get('/:owner/:repo/commits', optionalJWT, GitController.getCommits);
router.get('/:owner/:repo/commit/:sha', optionalJWT, GitController.getCommitDetail);

export default router;
