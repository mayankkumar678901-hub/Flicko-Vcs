import { Router } from 'express';
import { RepoController } from '../controllers/repo.controller';
import { authenticateJWT, optionalJWT } from '../middleware/auth';

const router = Router();

router.post('/', authenticateJWT, RepoController.createRepo);
router.get('/', optionalJWT, RepoController.listRepos);
router.get('/:owner/:repo', optionalJWT, RepoController.getRepo);
router.delete('/:owner/:repo', authenticateJWT, RepoController.deleteRepo);

export default router;
