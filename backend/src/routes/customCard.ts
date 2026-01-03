import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { createCustomCard, deleteCustomCard, getCustomCard, listCustomCards, updateCustomCard } from '../controllers/customCardController';

const router = Router();

router.use(authenticateToken);
router.get('/', listCustomCards);
router.post('/', createCustomCard);
router.get('/:id', getCustomCard);
router.put('/:id', updateCustomCard);
router.delete('/:id', deleteCustomCard);

export default router;
