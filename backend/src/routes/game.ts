import { Router } from 'express';
import { createGame, joinGame, getGame, selectDeck, startGameEndpoint, leaveGame, restartGameEndpoint, listMyGames, setMyGameOutcome } from '../controllers/gameController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);
router.post('/', createGame);
router.post('/join', joinGame);
router.get('/', listMyGames);
router.put('/:id/outcome', setMyGameOutcome);
router.get('/:id', getGame);
router.post('/:id/select-deck', selectDeck);
router.post('/:id/leave', leaveGame);
router.post('/:id/start', startGameEndpoint);
router.post('/:id/restart', restartGameEndpoint);

export default router;
