import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../utils/prisma';
import { z } from 'zod';
import * as scryfallService from '../services/scryfall';

// Schemas
const createDeckSchema = z.object({
  name: z.string().min(1),
  format: z.string().optional(),
});

const addCardSchema = z.object({
  scryfall_id: z.string(),
  qty: z.number().min(1),
  board: z.enum(['main', 'side', 'commander']).default('main'),
});

const importDeckSchema = z.object({
  name: z.string(),
  cards: z.array(z.object({
    name: z.string(),
    qty: z.number(),
    board: z.enum(['main', 'side', 'commander']).default('main')
  }))
});

// Controllers
export const getDecks = async (req: AuthRequest, res: Response) => {
  const decks = await prisma.deck.findMany({
    where: { user_id: req.userId },
    orderBy: { updated_at: 'desc' },
  });
  res.json(decks);
};

export const createDeck = async (req: AuthRequest, res: Response) => {
  try {
    const { name, format } = createDeckSchema.parse(req.body);
    const deck = await prisma.deck.create({
      data: {
        user_id: req.userId!,
        name,
        format,
      },
    });
    res.status(201).json(deck);
  } catch (error) {
    res.status(400).json({ error: 'Invalid input' });
  }
};

export const getDeck = async (req: AuthRequest, res: Response) => {
  const deck = await prisma.deck.findUnique({
    where: { id: req.params.id },
    include: { cards: true },
  });

  if (!deck || deck.user_id !== req.userId) {
    return res.status(404).json({ error: 'Deck not found' });
  }
  res.json(deck);
};

export const updateDeck = async (req: AuthRequest, res: Response) => {
  try {
     // Check ownership
    const existing = await prisma.deck.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.user_id !== req.userId) return res.status(404).json({error: 'Not found'});

    const { name, format } = createDeckSchema.parse(req.body);
    const deck = await prisma.deck.update({
      where: { id: req.params.id },
      data: { name, format },
    });
    res.json(deck);
  } catch (error) {
    res.status(400).json({ error: 'Invalid input' });
  }
};

export const deleteDeck = async (req: AuthRequest, res: Response) => {
    const existing = await prisma.deck.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.user_id !== req.userId) return res.status(404).json({error: 'Not found'});

    await prisma.deck.delete({ where: { id: req.params.id } });
    res.json({ message: 'Deck deleted' });
};

export const addCard = async (req: AuthRequest, res: Response) => {
  try {
    const { scryfall_id, qty, board } = addCardSchema.parse(req.body);
    const deckId = req.params.id;

    const deck = await prisma.deck.findUnique({ where: { id: deckId } });
    if (!deck || deck.user_id !== req.userId) return res.status(404).json({ error: 'Deck not found' });

    // Fetch card details from Scryfall to cache
    const cardData = await scryfallService.getCardById(scryfall_id);
    if (!cardData) return res.status(404).json({ error: 'Card not found in Scryfall' });

    const name = cardData.name;
    const type_line = cardData.type_line;
    const mana_cost = cardData.mana_cost;
    const image_url_small = cardData.image_uris?.small || cardData.card_faces?.[0]?.image_uris?.small;
    const image_url_normal = cardData.image_uris?.normal || cardData.card_faces?.[0]?.image_uris?.normal;

    // Check if card exists in deck
    const existingCard = await prisma.deckCard.findFirst({
        where: { deck_id: deckId, scryfall_id, board }
    });

    if (existingCard) {
        await prisma.deckCard.update({
            where: { id: existingCard.id },
            data: { qty: existingCard.qty + qty } // Add to existing
        });
    } else {
        await prisma.deckCard.create({
            data: {
                deck_id: deckId,
                scryfall_id,
                qty,
                board,
                name,
                type_line,
                mana_cost,
                image_url_small,
                image_url_normal
            }
        });
    }

    res.json({ message: 'Card added' });
  } catch (error) {
    res.status(400).json({ error: 'Invalid input' });
  }
};

export const removeCard = async (req: AuthRequest, res: Response) => {
    const { id: deckId, cardId: scryfallId } = req.params;
    
    const deck = await prisma.deck.findUnique({ where: { id: deckId } });
    if (!deck || deck.user_id !== req.userId) return res.status(404).json({ error: 'Deck not found' });

    // Find the card first to check quantity
    // We need to know which board we are removing from. 
    // The current API DELETE /decks/:id/cards/:scryfall_id is ambiguous if a card is in both main and side.
    // However, usually we handle mainboard removals via UI differently or just pick one.
    // For now, let's look for any entry (main or side) and decrement.
    // Ideally the frontend should send which board or the unique deckCard ID.
    // But based on frontend code: removeCard(c.scryfall_id)
    
    // Let's find the card entry. If there are duplicates (main & side), this logic might be tricky without board param.
    // But typically removeCard is called from a specific list context in frontend.
    // Wait, the frontend calls removeCard(c.scryfall_id) from both Main and Side lists.
    // This backend endpoint doesn't know which one.
    // Simplest fix: The frontend should probably just use the 'addCard' endpoint with negative quantity?
    // Or we update this endpoint to decrement.
    
    // Let's try to find the card. If it exists in multiple places (unlikely with unique constraint on deck_id+scryfall_id+board?), 
    // we might need more info. The schema has @@id, but no unique constraint on scryfall_id per deck.
    // Actually schema has: DeckCard id PK.
    // The frontend passes scryfall_id.
    
    // Let's implement decrement logic:
    // 1. Find the card entry. Since we don't have board info in params, we might delete from Main first?
    // Or better: Change logic to find *any* match and decrement.
    
    // Better approach: Since we can't distinguish Main/Side easily with just scryfall_id in URL (unless we add query param),
    // let's assume we want to decrement from Main if exists, else Side.
    // OR: Check query param 'board'?
    
    const board = req.query.board as string | undefined;
    
    const whereClause: any = { deck_id: deckId, scryfall_id: scryfallId };
    if (board) whereClause.board = board;

    const card = await prisma.deckCard.findFirst({
        where: whereClause
    });

    if (!card) return res.status(404).json({ error: 'Card not found in deck' });

    if (card.qty > 1) {
        await prisma.deckCard.update({
            where: { id: card.id },
            data: { qty: card.qty - 1 }
        });
        res.json({ message: 'Card quantity decreased' });
    } else {
        await prisma.deckCard.delete({
            where: { id: card.id }
        });
        res.json({ message: 'Card removed' });
    }
};

export const searchScryfall = async (req: Request, res: Response) => {
    const q = req.query.q as string;
    const result = await scryfallService.searchCards(q);
    res.json(result);
};

export const autocompleteScryfall = async (req: Request, res: Response) => {
    const q = req.query.q as string;
    const result = await scryfallService.autocompleteCards(q);
    res.json(result);
};

export const importDeck = async (req: AuthRequest, res: Response) => {
  try {
    const { name, cards } = importDeckSchema.parse(req.body);
    
    // Create Deck
    const deck = await prisma.deck.create({
      data: {
        user_id: req.userId!,
        name,
        format: 'commander', // Default to commander as per example
      },
    });

    // Prepare identifiers for Scryfall
    const uniqueNames = Array.from(new Set(cards.map(c => c.name)));
    
    // Scryfall collection API allows max 75 identifiers
    const chunks = [];
    for (let i = 0; i < uniqueNames.length; i += 75) {
        chunks.push(uniqueNames.slice(i, i + 75));
    }

    const resolvedCardsMap = new Map();

    for (const chunk of chunks) {
        const identifiers = chunk.map(name => ({ name }));
        const result = await scryfallService.getCardsCollection(identifiers);
        
        if (result.data) {
            result.data.forEach((card: any) => {
                resolvedCardsMap.set(card.name, card);
            });
        }
    }

    // Prepare DeckCards
    const deckCardsData = [];
    
    for (const cardInput of cards) {
        let cardData = resolvedCardsMap.get(cardInput.name);
        
        // Case insensitive fallback
        if (!cardData) {
            const key = Array.from(resolvedCardsMap.keys()).find(k => k.toLowerCase() === cardInput.name.toLowerCase());
            if (key) cardData = resolvedCardsMap.get(key);
        }

        if (cardData) {
            deckCardsData.push({
                deck_id: deck.id,
                scryfall_id: cardData.id,
                qty: cardInput.qty,
                board: cardInput.board,
                name: cardData.name,
                type_line: cardData.type_line,
                mana_cost: cardData.mana_cost,
                image_url_small: cardData.image_uris?.small || cardData.card_faces?.[0]?.image_uris?.small,
                image_url_normal: cardData.image_uris?.normal || cardData.card_faces?.[0]?.image_uris?.normal
            });
        }
    }

    if (deckCardsData.length > 0) {
        await prisma.deckCard.createMany({
            data: deckCardsData
        });
    }

    const fullDeck = await prisma.deck.findUnique({
        where: { id: deck.id },
        include: { cards: true }
    });

    res.status(201).json(fullDeck);

  } catch (error) {
    console.error('Import error:', error);
    res.status(400).json({ error: 'Invalid input or server error' });
  }
};
