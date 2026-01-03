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
  scryfall_id: z.string().optional(),
  custom_card_id: z.string().optional(),
  qty: z.number().min(1),
  board: z.enum(['main', 'side', 'commander']).default('main'),
}).refine(data => data.scryfall_id || data.custom_card_id, {
  message: "Either scryfall_id or custom_card_id must be provided"
});

const importDeckSchema = z.object({
  name: z.string(),
  cards: z.array(z.object({
    name: z.string(),
    qty: z.number(),
    board: z.enum(['main', 'side', 'commander']).default('main')
  }))
});

const updateDeckCardSchema = z.object({
  back_image_url: z.string().trim().max(500).nullable(),
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
    const { scryfall_id, custom_card_id, qty, board } = addCardSchema.parse(req.body);
    const deckId = req.params.id;

    const deck = await prisma.deck.findUnique({ where: { id: deckId } });
    if (!deck || deck.user_id !== req.userId) return res.status(404).json({ error: 'Deck not found' });

    let name, type_line, mana_cost, image_url_small, image_url_normal, back_image_url;
    let is_custom = false;

    if (scryfall_id) {
      // Fetch card details from Scryfall to cache
      const cardData = await scryfallService.getCardById(scryfall_id);
      if (!cardData) return res.status(404).json({ error: 'Card not found in Scryfall' });

      name = cardData.name;
      type_line = cardData.type_line;
      mana_cost = cardData.mana_cost;
      image_url_small = cardData.image_uris?.small || cardData.card_faces?.[0]?.image_uris?.small;
      image_url_normal = cardData.image_uris?.normal || cardData.card_faces?.[0]?.image_uris?.normal;
      back_image_url = cardData.card_faces?.[1]?.image_uris?.normal || cardData.card_faces?.[1]?.image_uris?.large;
    } else if (custom_card_id) {
      const customCard = await prisma.customCard.findUnique({
        where: { id: custom_card_id }
      });
      if (!customCard || customCard.user_id !== req.userId) {
        return res.status(404).json({ error: 'Custom card not found' });
      }

      is_custom = true;
      name = customCard.name;
      type_line = customCard.type_line;
      // Convert JSON symbols back to Mana Cost string format if needed, or just use a placeholder
      // For custom cards, we might store mana_cost as string too, but let's derive it or keep it simple.
      mana_cost = customCard.mana_cost_generic > 0 ? `{${customCard.mana_cost_generic}}` : '';
      if (customCard.mana_cost_symbols) {
        const symbols = customCard.mana_cost_symbols as string[];
        mana_cost += symbols.map(s => `{${s}}`).join('');
      }
      
      image_url_small = customCard.front_image_url || customCard.art_url;
      image_url_normal = customCard.front_image_url || customCard.art_url;
      back_image_url = customCard.back_image_url;
    }

    // Check if card exists in deck
    const whereClause: any = { deck_id: deckId, board };
    if (scryfall_id) whereClause.scryfall_id = scryfall_id;
    else whereClause.custom_card_id = custom_card_id;

    const existingCard = await prisma.deckCard.findFirst({
        where: whereClause
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
                scryfall_id: scryfall_id || null,
                custom_card_id: custom_card_id || null,
                is_custom,
                qty,
                board,
                name,
                type_line,
                mana_cost,
                image_url_small,
                image_url_normal,
                back_image_url
            }
        });
    }

    res.json({ message: 'Card added' });
  } catch (error) {
    console.error('Error adding card:', error);
    res.status(400).json({ error: 'Invalid input' });
  }
};

export const removeCard = async (req: AuthRequest, res: Response) => {
    const { id: deckId, cardId: cardKey } = req.params;
    
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
    
    const whereClause: any = { deck_id: deckId, OR: [{ scryfall_id: cardKey }, { custom_card_id: cardKey }] };
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

export const updateDeckCard = async (req: AuthRequest, res: Response) => {
    const deckId = req.params.id;
    const deckCardId = req.params.deckCardId;

    const { back_image_url } = updateDeckCardSchema.parse(req.body);

    const existing = await prisma.deckCard.findUnique({
        where: { id: deckCardId },
        include: { deck: true }
    });

    if (!existing || existing.deck_id !== deckId || existing.deck.user_id !== req.userId) {
        return res.status(404).json({ error: 'Card not found in deck' });
    }

    const updated = await prisma.deckCard.update({
        where: { id: deckCardId },
        data: { back_image_url }
    });

    res.json(updated);
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

        // Fallback: Fuzzy Search for partial names (e.g. DFCs like "Delver of Secrets")
        if (!cardData) {
             try {
                 const fuzzyResult = await scryfallService.getCardByName(cardInput.name);
                 if (fuzzyResult) {
                     cardData = fuzzyResult;
                     resolvedCardsMap.set(cardInput.name, cardData); 
                 }
             } catch (e) { 
                console.log('Fuzzy search failed for', cardInput.name); 
             }
        }

        if (cardData) {
            const back_image_url = cardData.card_faces?.[1]?.image_uris?.normal || cardData.card_faces?.[1]?.image_uris?.large;

            deckCardsData.push({
                deck_id: deck.id,
                scryfall_id: cardData.id,
                qty: cardInput.qty,
                board: cardInput.board,
                name: cardData.name,
                type_line: cardData.type_line,
                mana_cost: cardData.mana_cost,
                image_url_small: cardData.image_uris?.small || cardData.card_faces?.[0]?.image_uris?.small,
                image_url_normal: cardData.image_uris?.normal || cardData.card_faces?.[0]?.image_uris?.normal,
                back_image_url
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
