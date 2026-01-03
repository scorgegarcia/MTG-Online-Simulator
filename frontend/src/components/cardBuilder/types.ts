export type CardKind = 'Creature' | 'Land' | 'Non-creature';

export type ManaSymbol = 'W' | 'U' | 'B' | 'R' | 'G' | 'C' | 'X';

export type ManaCost = {
  generic: number;
  symbols: ManaSymbol[];
};

export type CardDraft = {
  name: string;
  kind: CardKind;
  typeLine: string;
  rulesText: string;
  power: string;
  toughness: string;
  manaCost: ManaCost;
  artUrl: string;
  backUrl: string;
};

