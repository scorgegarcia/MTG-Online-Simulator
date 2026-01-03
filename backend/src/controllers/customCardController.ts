import { Response } from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';

const manaSymbolSchema = z.enum(['W', 'U', 'B', 'R', 'G', 'C', 'X']);

const createCustomCardSchema = z
  .object({
    source: z.enum(['EDITOR', 'URLS']).default('EDITOR'),
    name: z.string().trim().min(1).max(120),
    kind: z.enum(['Creature', 'Land', 'Non-creature']),
    front_image_url: z.string().trim().max(512).optional().nullable(),
    back_image_url: z.string().trim().max(512).optional().nullable(),
    art_url: z.string().trim().max(512).optional().nullable(),
    mana_cost_generic: z.number().int().min(0).max(99).optional().default(0),
    mana_cost_symbols: z.array(manaSymbolSchema).max(40).optional().default([]),
    type_line: z.string().trim().max(191).optional().nullable(),
    rules_text: z.string().trim().max(8000).optional().nullable(),
    power: z.string().trim().max(10).optional().nullable(),
    toughness: z.string().trim().max(10).optional().nullable(),
  })
  .superRefine((val, ctx) => {
    if (val.source === 'URLS') {
      const front = (val.front_image_url || '').trim();
      if (front.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['front_image_url'],
          message: 'front_image_url is required when source=URLS',
        });
      }
    }
  });

export const listCustomCards = async (req: AuthRequest, res: Response) => {
  const cards = await prisma.customCard.findMany({
    where: { user_id: req.userId },
    orderBy: { created_at: 'desc' },
  });
  res.json(cards);
};

export const getCustomCard = async (req: AuthRequest, res: Response) => {
  const card = await prisma.customCard.findUnique({ where: { id: req.params.id } });
  if (!card || card.user_id !== req.userId) return res.status(404).json({ error: 'Not found' });
  res.json(card);
};

export const createCustomCard = async (req: AuthRequest, res: Response) => {
  try {
    const payload = createCustomCardSchema.parse(req.body);

    const card = await prisma.customCard.create({
      data: {
        user_id: req.userId!,
        source: payload.source,
        name: payload.name,
        kind: payload.kind,
        front_image_url: payload.front_image_url?.trim() || null,
        back_image_url: payload.back_image_url?.trim() || null,
        art_url: payload.art_url?.trim() || null,
        mana_cost_generic: payload.mana_cost_generic,
        mana_cost_symbols: payload.mana_cost_symbols,
        type_line: payload.type_line?.trim() || null,
        rules_text: payload.rules_text?.trim() || null,
        power: payload.power?.trim() || null,
        toughness: payload.toughness?.trim() || null,
      },
    });

    res.status(201).json(card);
  } catch (error) {
    res.status(400).json({ error: 'Invalid input' });
  }
};

export const updateCustomCard = async (req: AuthRequest, res: Response) => {
  const existing = await prisma.customCard.findUnique({ where: { id: req.params.id } });
  if (!existing || existing.user_id !== req.userId) return res.status(404).json({ error: 'Not found' });

  try {
    const payload = createCustomCardSchema.parse(req.body);

    const updated = await prisma.customCard.update({
      where: { id: existing.id },
      data: {
        source: payload.source,
        name: payload.name,
        kind: payload.kind,
        front_image_url: payload.front_image_url?.trim() || null,
        back_image_url: payload.back_image_url?.trim() || null,
        art_url: payload.art_url?.trim() || null,
        mana_cost_generic: payload.mana_cost_generic,
        mana_cost_symbols: payload.mana_cost_symbols,
        type_line: payload.type_line?.trim() || null,
        rules_text: payload.rules_text?.trim() || null,
        power: payload.power?.trim() || null,
        toughness: payload.toughness?.trim() || null,
      },
    });

    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: 'Invalid input' });
  }
};

export const deleteCustomCard = async (req: AuthRequest, res: Response) => {
  const card = await prisma.customCard.findUnique({ where: { id: req.params.id } });
  if (!card || card.user_id !== req.userId) return res.status(404).json({ error: 'Not found' });
  
  // Also remove this card from any decks it's in
  await prisma.deckCard.deleteMany({
    where: { custom_card_id: card.id }
  });

  await prisma.customCard.delete({ where: { id: card.id } });
  res.json({ message: 'Deleted' });
};

export const getCustomCardUsage = async (req: AuthRequest, res: Response) => {
  const card = await prisma.customCard.findUnique({ where: { id: req.params.id } });
  if (!card || card.user_id !== req.userId) return res.status(404).json({ error: 'Not found' });

  const usages = await prisma.deckCard.findMany({
    where: { custom_card_id: card.id },
    include: {
      deck: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });

  // Unique decks only
  const uniqueDecks = Array.from(new Map(usages.map(u => [u.deck.id, u.deck])).values());

  res.json({
    cardName: card.name,
    decks: uniqueDecks
  });
};
