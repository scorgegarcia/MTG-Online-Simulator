import { Router } from 'express';
import { createGame, joinGame, getGame, selectDeck, startGameEndpoint, leaveGame } from '../controllers/gameController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);
router.post('/', createGame);
router.post('/join', joinGame);
router.get('/:id', getGame);
router.post('/:id/select-deck', selectDeck);
router.post('/:id/leave', leaveGame);
router.post('/:id/start', startGameEndpoint);

export default router;
