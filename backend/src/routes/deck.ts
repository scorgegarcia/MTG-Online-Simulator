import { Router } from 'express';
import { getDecks, createDeck, getDeck, updateDeck, deleteDeck, addCard, removeCard, searchScryfall, autocompleteScryfall, importDeck } from '../controllers/deckController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Scryfall proxy
router.get('/scryfall/search', searchScryfall);
router.get('/scryfall/autocomplete', autocompleteScryfall);

// Decks
router.use(authenticateToken);
router.post('/import', importDeck);
router.get('/', getDecks);
router.post('/', createDeck);
router.get('/:id', getDeck);
router.put('/:id', updateDeck);
router.delete('/:id', deleteDeck);
router.post('/:id/cards', addCard);
router.delete('/:id/cards/:cardId', removeCard);

export default router;
