import { Router } from 'express';
import authRoutes from './auth.routes';
import repoRoutes from './repo.routes';
import gitRoutes from './git.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/repos', repoRoutes);
router.use('/git', gitRoutes);

export default router;
