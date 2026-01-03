import { Router } from 'express';
import { register, login, refresh, logout, me, updateAvatar, updatePlaymat } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', authenticateToken, me);
router.put('/avatar', authenticateToken, updateAvatar);
router.put('/playmat', authenticateToken, updatePlaymat);

export default router;
