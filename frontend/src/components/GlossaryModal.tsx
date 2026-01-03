import React, { useState, useMemo } from 'react';
import { X, Book, Sparkles, Languages, Flame, Search } from 'lucide-react';
import clsx from 'clsx';
import MagicParticles from './cardBuilder/MagicParticles';

interface GlossaryModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface GlossaryEntry {
    term: string;
    altTerm?: string;
    definition: string;
}

const glossaryData: Record<'en' | 'es', GlossaryEntry[]> = {
    en: [
        { term: 'Absorb N / Absorber N', definition: 'If a source would deal damage to this creature, prevent N of that damage.' },
        { term: 'Affinity / Afinidad', definition: 'This spell costs {1} less to cast for each permanent you control of a certain type.' },
        { term: 'Afflict N / Aflicción N', definition: 'Whenever this creature becomes blocked, defending player loses N life.' },
        { term: 'Afterlife N / Afterlife N', definition: 'When this creature dies, create N 1/1 white and black Spirit tokens with flying.' },
        { term: 'Aftermath / Aftermath', definition: 'Cast this spell from your graveyard, then exile it.' },
        { term: 'Amplify N / Amplificar N', definition: 'Enters with N +1/+1 counters for each card in hand that shares a type.' },
        { term: 'Annihilator N / Aniquilador N', definition: 'Whenever this creature attacks, defending player sacrifices N permanents.' },
        { term: 'Ascend / Ascender', definition: 'Control ten permanents to get the city\'s blessing for the rest of the game.' },
        { term: 'Assist / Asistir', definition: 'Another player can help pay for this spell.' },
        { term: 'Aura / Aura', definition: 'An enchantment that attaches to a permanent or player.' },
        { term: 'Aura Swap / Aura Swap', definition: 'Exchange this Aura with an Aura card in your hand.' },
        { term: 'Awaken N / Awaken N', definition: 'Cast for a cost to turn a land into a 0/0 Elemental with N +1/+1 counters.' },
        { term: 'Backup N / Ayuda N', definition: 'When this enters, put N +1/+1 counters on a creature. It gains this creature\'s abilities.' },
        { term: 'Banding / Banda', definition: 'Creatures can attack or block in a group. You choose how damage is dealt to them.' },
        { term: 'Bargain / Bargain', definition: 'You may sacrifice an artifact, enchantment, or token as you cast this spell for a bonus.' },
        { term: 'Battle Cry / Batalla campal', definition: 'When this attacks, other attacking creatures get +1/+0 until end of turn.' },
        { term: 'Bestow / Concesión', definition: 'Cast as an Aura or a creature. If the creature it enchants leaves, it becomes a creature.' },
        { term: 'Blitz / Blitz', definition: 'Cast for haste and "draw a card when it dies", then sacrifice it at end of turn.' },
        { term: 'Bloodthirst N / Bloodthirst N', definition: 'Enters with N +1/+1 counters if an opponent was dealt damage this turn.' },
        { term: 'Boast / Boast', definition: 'Activate an ability once per turn only if this creature attacked.' },
        { term: 'Bushido N / Bushido N', definition: 'When this blocks or becomes blocked, it gets +N/+N until end of turn.' },
        { term: 'Buyback / Buyback', definition: 'Pay an extra cost to return this spell to your hand after it resolves.' },
        { term: 'Cascade / Cascada', definition: 'When cast, exile cards until you find one that costs less and cast it for free.' },
        { term: 'Casualty N / Casualty N', definition: 'Sacrifice a creature with power N or more to copy this spell.' },
        { term: 'Champion / Campeón', definition: 'Exile another permanent of a type when this enters; return it when this leaves.' },
        { term: 'Changeling / Camaleón', definition: 'This card is every creature type at all times.' },
        { term: 'Cipher / Cifrar', definition: 'Encode this spell onto a creature. Cast a copy when that creature deals combat damage.' },
        { term: 'Cleave / Cleave', definition: 'Cast for a cost to ignore words in square brackets in the rules text.' },
        { term: 'Companion / Compañero', definition: 'If your deck meets a condition, you can pay {3} to put this into your hand from outside.' },
        { term: 'Compleated / Completo', definition: 'Can pay mana or life. If life is paid, enters with fewer counters.' },
        { term: 'Conspire / Conspirar', definition: 'Tap two creatures that share a color with this spell to copy it.' },
        { term: 'Convoke / Convocar', definition: 'Your creatures can help cast this spell by tapping to pay for {1} or a color.' },
        { term: 'Craft / Craft', definition: 'Exile this and specified materials to return it transformed.' },
        { term: 'Crew N / Crew N', definition: 'Tap creatures with total power N or more to turn this into a creature.' },
        { term: 'Cumulative Upkeep / Cuota de mantenimiento', definition: 'Pay an increasing cost each turn or sacrifice this permanent.' },
        { term: 'Cycling / Cycling', definition: 'Discard this card and pay its cost to draw a new card.' },
        { term: 'Dash / Dash', definition: 'Cast for haste and return to hand at end of turn.' },
        { term: 'Daybound / Nightbound / Daybound / Nightbound', definition: 'Transforms based on how many spells were cast last turn.' },
        { term: 'Deathtouch / Toque mortal', definition: 'Any amount of damage this deals to a creature is enough to destroy it.' },
        { term: 'Decayed / Decayed', definition: 'Can\'t block. When it attacks, sacrifice it at end of combat.' },
        { term: 'Defender / Defensor', definition: 'This creature can\'t attack.' },
        { term: 'Delve / Delve', definition: 'Exile cards from your graveyard to help pay for this spell.' },
        { term: 'Demonstrate / Demostrar', definition: 'Copy this spell and let an opponent copy it too.' },
        { term: 'Dethrone / Dethrone', definition: 'Get a +1/+1 counter when attacking the player with the most life.' },
        { term: 'Devoid / Devoid', definition: 'This card has no color.' },
        { term: 'Devour N / Devorar N', definition: 'Sacrifice creatures as this enters to get N +1/+1 counters for each.' },
        { term: 'Disguise / Discreción', definition: 'Cast facedown as a 2/2 with Ward {2}. Turn face up later.' },
        { term: 'Disturb / Disturbio', definition: 'Cast this card transformed from your graveyard.' },
        { term: 'Double Strike / Dañar dos veces', definition: 'Deals both first-strike and regular combat damage.' },
        { term: 'Dredge N / Dragado N', definition: 'Replace a draw by putting N cards into your graveyard to return this to your hand.' },
        { term: 'Echo / Eco', definition: 'Pay its mana cost again on your next upkeep or sacrifice it.' },
        { term: 'Embalm / Embalsamar', definition: 'Exile from graveyard to create a Zombie token copy.' },
        { term: 'Emerge / Emerger', definition: 'Cast by sacrificing a creature to reduce the cost.' },
        { term: 'Enchant / Encantar', definition: 'Attaches this card to a specific type of permanent or player.' },
        { term: 'Encore / Encore', definition: 'Exile from graveyard to attack each opponent with token copies this turn.' },
        { term: 'Enlist / Enlistar', definition: 'Tap a non-attacking creature to add its power to this attacker.' },
        { term: 'Entwine / Entrelazar', definition: 'Pay an extra cost to choose all modes instead of just one.' },
        { term: 'Epic / Épico', definition: 'You can\'t cast spells for the rest of the game, but you copy this spell every turn.' },
        { term: 'Equip / Equipar', definition: 'Attach this equipment to a creature you control.' },
        { term: 'Escalate / Escalar', definition: 'Pay an extra cost for each additional mode chosen.' },
        { term: 'Escape / Escape', definition: 'Cast this from your graveyard by paying mana and exiling cards.' },
        { term: 'Eternalize / Eternalizar', definition: 'Exile from graveyard to create a 4/4 black Zombie token copy.' },
        { term: 'Evoke / Evocar', definition: 'Cast for a lower cost, but it\'s sacrificed when it enters.' },
        { term: 'Evolve / Evolucionar', definition: 'Get a +1/+1 counter when a larger creature enters under your control.' },
        { term: 'Exalted / Exaltado', definition: 'Attacking alone gives the creature +1/+1 until end of turn.' },
        { term: 'Exhaust / Exhausto', definition: 'A custom keyword usually meaning a resource is spent or limited.' },
        { term: 'Exploit / Explotar', definition: 'When this enters, you may sacrifice a creature for a bonus effect.' },
        { term: 'Extort / Extorsión', definition: 'Whenever you cast a spell, pay {W/B} to drain 1 life from each opponent.' },
        { term: 'Fabricate N / Fabricar N', definition: 'When this enters, get N +1/+1 counters or N 1/1 Servo tokens.' },
        { term: 'Fading N / Desvanecer N', definition: 'Remove a counter each turn. Sacrifice when you can\'t.' },
        { term: 'Fear / Miedo', definition: 'Can\'t be blocked except by artifact or black creatures.' },
        { term: 'Firebending / Firebending', definition: 'A custom ability related to fire damage or manipulation.' },
        { term: 'First Strike / Dañar primero', definition: 'Deals damage before creatures without this ability.' },
        { term: 'Flanking / Flanqueo', definition: 'Blockers without flanking get -1/-1 until end of turn.' },
        { term: 'Flash / Destello', definition: 'Can be cast any time you could cast an instant.' },
        { term: 'Flashback / Flashback', definition: 'Cast this card from your graveyard, then exile it.' },
        { term: 'Flying / Volar', definition: 'Can only be blocked by creatures with flying or reach.' },
        { term: 'For Mirrodin! / ¡Por Mirrodin!', definition: 'Enters with a 2/2 Rebel token and attaches to it.' },
        { term: 'Forecast / Forecast', definition: 'Reveal from hand during upkeep for a special effect.' },
        { term: 'Foretell / Foretell', definition: 'Exile facedown for {2} and cast later for a reduced cost.' },
        { term: 'Fortify / Fortificar', definition: 'Attach this equipment-like card to a land.' },
        { term: 'Freerunning / Freerunning', definition: 'Cast for a lower cost if you dealt combat damage with an Assassin or Commander.' },
        { term: 'Frenzy N / Frenesí N', definition: 'Gets +N/+0 if it attacks and isn\'t blocked.' },
        { term: 'Fuse / Fuse', definition: 'Cast one or both halves of this split card.' },
        { term: 'Gift / Gift', definition: 'Promise a gift to an opponent for an improved effect.' },
        { term: 'Goad / Espolear', definition: 'Target creature must attack someone other than you if able.' },
        { term: 'Graft N / Graft N', definition: 'Enters with N counters. Move counters to other creatures as they enter.' },
        { term: 'Gravestorm / Gravestorm', definition: 'Copy this for each permanent put into a graveyard this turn.' },
        { term: 'Harmonize / Harmonizar', definition: 'A custom trigger when sharing types or colors.' },
        { term: 'Haste / Prisa', definition: 'Can attack or {T} as soon as it enters.' },
        { term: 'Hexproof / Antimaleficio', definition: 'Can\'t be targeted by spells or abilities your opponents control.' },
        { term: 'Hideaway / Hideaway', definition: 'Exile a card from the top of your library to play it later for free.' },
        { term: 'Hidden Agenda / Hidden Agenda', definition: 'Secretly name a card at the start of the game for a bonus.' },
        { term: 'Horsemanship / Horsemanship', definition: 'Can only be blocked by creatures with horsemanship.' },
        { term: 'Impending N / Impending N', definition: 'Cast for a lower cost; enters with N counters and becomes a creature when empty.' },
        { term: 'Improvise / Improvisar', definition: 'Your artifacts can help pay for this spell.' },
        { term: 'Indestructible / Indestructible', definition: 'Can\'t be destroyed by damage or "destroy" effects.' },
        { term: 'Infect / Infectar', definition: 'Deals damage in -1/-1 counters to creatures and poison counters to players.' },
        { term: 'Ingest / Ingerir', definition: 'When it deals combat damage, the player exiles the top card of their library.' },
        { term: 'Intimidate / Intimidar', definition: 'Can only be blocked by artifact creatures or creatures that share a color.' },
        { term: 'Job Select / Job Select', definition: 'Choose a specific role or class for this card.' },
        { term: 'Jump-Start / Jump-Start', definition: 'Cast from graveyard by discarding a card.' },
        { term: 'Kicker / Kicker', definition: 'Pay an optional extra cost for an additional effect.' },
        { term: 'Landwalk / Landwalk', definition: 'Unblockable if the opponent controls a specific land type.' },
        { term: 'Level Up / Level Up', definition: 'Pay to put level counters on this to gain new abilities.' },
        { term: 'Lifelink / Vínculo vital', definition: 'Damage dealt by this creature also heals you.' },
        { term: 'Living Metal / Living Metal', definition: 'This vehicle is a creature during your turn.' },
        { term: 'Living Weapon / Living Weapon', definition: 'Enters with a 0/0 Germ token and attaches to it.' },
        { term: 'Madness / Madness', definition: 'When discarded, you may cast it for its madness cost.' },
        { term: 'Max Speed / Max Speed', definition: 'Custom ability increasing movement or haste effects.' },
        { term: 'Mayhem / Mayhem', definition: 'Custom trigger related to chaos or widespread damage.' },
        { term: 'Melee / Melee', definition: 'Gets +1/+1 for each opponent you attacked this turn.' },
        { term: 'Menace / Amenaza', definition: 'Can\'t be blocked except by two or more creatures.' },
        { term: 'Mentor / Mentor', definition: 'When it attacks, put a counter on a smaller attacking creature.' },
        { term: 'Miracle / Milagro', definition: 'Cast for a very low cost if it\'s the first card you draw this turn.' },
        { term: 'Mobilize / Mobilizar', definition: 'Custom ability to untap or prepare for combat.' },
        { term: 'Modular N / Modular N', definition: 'Enters with N counters. When it dies, move them to another artifact creature.' },
        { term: 'More Than Meets the Eye / More Than Meets the Eye', definition: 'Cast this card transformed for a specific cost.' },
        { term: 'Morph / Morph', definition: 'Cast facedown as a 2/2 for {3}. Turn face up later.' },
        { term: 'Mutate / Mutar', definition: 'Merge this with a non-human creature to combine their abilities.' },
        { term: 'Myriad / Myriad', definition: 'When it attacks, create token copies for each other opponent.' },
        { term: 'Ninjutsu / Ninjutsu', definition: 'Return an unblocked attacker to hand to put this into play attacking.' },
        { term: 'Offering / Offering', definition: 'Sacrifice a specific type to cast this at instant speed and lower cost.' },
        { term: 'Offspring / Offspring', definition: 'Pay extra to create a 1/1 token copy when this enters.' },
        { term: 'Outlast / Outlast', definition: 'Tap and pay mana to put a +1/+1 counter on this.' },
        { term: 'Overload / Overload', definition: 'Change "target" to "each" in the spell\'s text.' },
        { term: 'Partner / Partner', definition: 'You can have two commanders if both have Partner.' },
        { term: 'Persist / Persistir', definition: 'When it dies, return it with a -1/-1 counter if it had none.' },
        { term: 'Phasing / Phasing', definition: 'Exists every other turn.' },
        { term: 'Plot / Plot', definition: 'Exile from hand to cast for free on a later turn.' },
        { term: 'Poisonous N / Poisonous N', definition: 'When it deals combat damage, the player gets N poison counters.' },
        { term: 'Protection / Protección', definition: 'Can\'t be targeted, damaged, or blocked by a specific quality.' },
        { term: 'Prototype / Prototipo', definition: 'Cast with different stats and cost, but same abilities.' },
        { term: 'Provoke / Provocar', definition: 'When it attacks, force an opponent\'s creature to block it.' },
        { term: 'Prowess / Destreza', definition: 'Gets +1/+1 when you cast a noncreature spell.' },
        { term: 'Prowl / Prowl', definition: 'Cast for a reduced cost if you dealt damage with the same creature type.' },
        { term: 'Rampage N / Rampage N', definition: 'Gets +N/+N for each blocker beyond the first.' },
        { term: 'Ravenous / Ravenous', definition: 'Enters with X counters. If X is 5+, draw a card.' },
        { term: 'Reach / Alcance', definition: 'Can block creatures with flying.' },
        { term: 'Read Ahead / Read Ahead', definition: 'Choose any chapter for this Saga to start on.' },
        { term: 'Rebound / Rebound', definition: 'Cast it again for free from exile on your next upkeep.' },
        { term: 'Reconfigure / Reconfigurar', definition: 'Attach to a creature as an equipment or unattach to be a creature.' },
        { term: 'Recover / Recover', definition: 'Pay when a creature dies to return this from graveyard to hand.' },
        { term: 'Reinforce N / Reinforce N', definition: 'Discard this to put N +1/+1 counters on a creature.' },
        { term: 'Replicate / Replicar', definition: 'Pay an extra cost any number of times to copy this spell.' },
        { term: 'Retrace / Retrace', definition: 'Cast from graveyard by discarding a land.' },
        { term: 'Riot / Riot', definition: 'Enters with a +1/+1 counter or haste.' },
        { term: 'Ripple N / Ripple N', definition: 'Reveal top N cards to cast copies of the same spell for free.' },
        { term: 'Saddle N / Saddle N', definition: 'Tap creatures with power N to "mount" this for a bonus.' },
        { term: 'Scavenge / Scavenge', definition: 'Exile from graveyard to put +1/+1 counters on a creature.' },
        { term: 'Scry N / Adivinar N', definition: 'Look at the top N cards of your library and put them on the top or bottom.' },
        { term: 'Shadow / Shadow', definition: 'Can only block or be blocked by creatures with Shadow.' },
        { term: 'Shroud / Shroud', definition: 'Can\'t be targeted by anyone.' },
        { term: 'Skulk / Skulk', definition: 'Can\'t be blocked by creatures with greater power.' },
        { term: 'Solved / Solved', definition: 'Condition met for a "Case" card to unlock its final ability.' },
        { term: 'Soulbond / Soulbond', definition: 'Pair this with another creature for mutual bonuses.' },
        { term: 'Soulshift N / Soulshift N', definition: 'Return a Spirit with cost N or less from graveyard when this dies.' },
        { term: 'Space Sculptor / Space Sculptor', definition: 'Custom ability to modify battlefield zones or positions.' },
        { term: 'Spectacle / Spectacle', definition: 'Cast for a lower cost if an opponent lost life this turn.' },
        { term: 'Splice / Splice', definition: 'Add this card\'s effect to another spell as you cast it.' },
        { term: 'Split Second / Split Second', definition: 'No one can respond to this spell while it\'s on the stack.' },
        { term: 'Spree / Spree', definition: 'Pay extra for each mode you want to use.' },
        { term: 'Squad / Squad', definition: 'Pay extra to create multiple token copies when this enters.' },
        { term: 'Start Your Engines! / Start Your Engines!', definition: 'Custom trigger related to vehicle activation.' },
        { term: 'Station / Estación', definition: 'Custom ability to hold a defensive position.' },
        { term: 'Storm / Storm', definition: 'Copy this for each spell cast before it this turn.' },
        { term: 'Sunburst / Sunburst', definition: 'Enters with counters for each color of mana used.' },
        { term: 'Surge / Surge', definition: 'Cast for a lower cost if you or a teammate cast a spell already.' },
        { term: 'Suspend N / Suspend N', definition: 'Exile with N counters and cast for free when they run out.' },
        { term: 'Tiered / Tiered', definition: 'Custom ability that scales in levels or tiers.' },
        { term: 'Toxic N / Toxic N', definition: 'Player gets N poison counters when this deals combat damage.' },
        { term: 'Training / Training', definition: 'Gets a counter when attacking with a stronger creature.' },
        { term: 'Trample / Arrollar', definition: 'Excess damage goes to the defending player or planeswalker.' },
        { term: 'Transfigure / Transfigurar', definition: 'Sacrifice this to search for a creature with the same cost.' },
        { term: 'Transmute / Transmuta', definition: 'Discard to search for a card with the same cost.' },
        { term: 'Tribute N / Tributo N', definition: 'Opponent chooses to give it counters or trigger an effect.' },
        { term: 'Umbra Armor / Umbra Armor', definition: 'Protects enchanted creature from destruction by sacrificing itself.' },
        { term: 'Undaunted / Undaunted', definition: 'Costs {1} less for each opponent.' },
        { term: 'Undying / Undying', definition: 'When it dies, return it with a +1/+1 counter if it had none.' },
        { term: 'Unearth / Desenterrar', definition: 'Return from graveyard with haste for one turn.' },
        { term: 'Unleash / Unleash', definition: 'Enters with a +1/+1 counter, but can\'t block if it has one.' },
        { term: 'Vanishing N / Desvanecer N', definition: 'Enters with N counters. Sacrifice when they are gone.' },
        { term: 'Vigilance / Vigilancia', definition: 'Attacking doesn\'t cause this creature to tap.' },
        { term: 'Visit / Visit', definition: 'Custom trigger when entering or affecting a specific zone.' },
        { term: 'Ward / Amparo [coste]', definition: 'Opponents must pay extra to target this permanent.' },
        { term: 'Warp / Warp', definition: 'Custom ability to teleport or transform cards.' },
        { term: 'Web-slinging / Web-slinging', definition: 'Custom ability to trap or block flying creatures.' },
        { term: 'Wither / Wither', definition: 'Deals damage to creatures in -1/-1 counters.' },
        { term: '∞ (Infinity) / ∞ (Infinity)', definition: 'Represents an infinite value or limitless effect.' }
    ],
    es: [
        { term: 'Absorber N / Absorb N', definition: 'Si una fuente fuera a infligir daño a esta criatura, prevén N de ese daño.' },
        { term: 'Adivinar N / Scry N', definition: 'Mira las N cartas superiores de tu biblioteca y ordénalas en el tope o fondo.' },
        { term: 'Aflicción N / Afflict N', definition: 'Si esta criatura es bloqueada, el jugador defensor pierde N vidas.' },
        { term: 'Afinidad / Affinity', definition: 'Cuesta {1} menos por cada permanente de cierto tipo que controles.' },
        { term: 'Alcance / Reach', definition: 'Esta criatura puede bloquear a las criaturas con la habilidad de volar.' },
        { term: 'Amenaza / Menace', definition: 'No puede ser bloqueada excepto por dos o más criaturas.' },
        { term: 'Amparo [coste] / Ward', definition: 'Los oponentes deben pagar un coste extra para hacer a esto objetivo.' },
        { term: 'Amplificar N / Amplify N', definition: 'Entra con N contadores +1/+1 por cada carta igual en tu mano.' },
        { term: 'Aniquilador N / Annihilator N', definition: 'Al atacar, el defensor sacrifica N permanentes.' },
        { term: 'Antimaleficio / Hexproof', definition: 'No puede ser objetivo de hechizos o habilidades de tus oponentes.' },
        { term: 'Arrollar / Trample', definition: 'El daño sobrante se asigna al jugador o planeswalker defendido.' },
        { term: 'Ascender / Ascend', definition: 'Controla diez permanentes para obtener la bendición de la ciudad.' },
        { term: 'Asistir / Assist', definition: 'Otro jugador puede ayudar a pagar el maná genérico de este hechizo.' },
        { term: 'Aura / Aura', definition: 'Un encantamiento que se anexa a un permanente o jugador.' },
        { term: 'Ayuda N / Backup N', definition: 'Al entrar, pon N contadores en una criatura; esta gana sus habilidades.' },
        { term: 'Banda / Banding', definition: 'Las criaturas atacan o bloquean en grupo. Tú eliges cómo se reparte el daño.' },
        { term: 'Batalla campal / Battle Cry', definition: 'Al atacar, las demás criaturas atacantes obtienen +1/+0.' },
        { term: 'Bushido N / Bushido N', definition: 'Gana +N/+N cuando bloquea o es bloqueada.' },
        { term: 'Camaleón / Changeling', definition: 'Esta carta tiene todos los tipos de criatura en todo momento.' },
        { term: 'Campeón / Champion', definition: 'Exilia un tipo de permanente al entrar y devuélvelo al salir.' },
        { term: 'Cascada / Cascade', definition: 'Al lanzar, busca y lanza gratis un hechizo que cueste menos.' },
        { term: 'Cifrar / Cipher', definition: 'Codifica el hechizo en una criatura para lanzarlo gratis al dañar.' },
        { term: 'Cleave / Cleave', definition: 'Paga un coste para ignorar las palabras entre corchetes del texto.' },
        { term: 'Compañero / Companion', definition: 'Si tu mazo cumple una condición, puedes traerlo a tu mano desde fuera.' },
        { term: 'Completo / Compleated', definition: 'Puedes pagar con maná o vida; si pagas vida, entra con menos contadores.' },
        { term: 'Concesión / Bestow', definition: 'Lánzalo como Aura o criatura. Si el encantado muere, se vuelve criatura.' },
        { term: 'Conspirar / Conspire', definition: 'Gira dos criaturas que compartan color para copiar el hechizo.' },
        { term: 'Convocar / Convoke', definition: 'Tus criaturas ayudan a pagar el hechizo al girarse.' },
        { term: 'Crew N / Crew N', definition: 'Gira criaturas con fuerza N para convertir este vehículo en criatura.' },
        { term: 'Cuota de mantenimiento / Cumulative Upkeep', definition: 'Paga un coste creciente cada turno o sacrifica el permanente.' },
        { term: 'Cycling / Cycling', definition: 'Descarta la carta y paga su coste para robar otra.' },
        { term: 'Dañar dos veces / Double Strike', definition: 'Hace tanto el daño de dañar primero como el daño normal.' },
        { term: 'Dañar primero / First Strike', definition: 'Hace daño antes que las criaturas sin esta habilidad.' },
        { term: 'Dash / Dash', definition: 'Lánzalo con prisa y devuélvelo a la mano al final del turno.' },
        { term: 'Daybound / Nightbound / Daybound / Nightbound', definition: 'Se transforma según cuántos hechizos se lanzaron el turno anterior.' },
        { term: 'Defensor / Defender', definition: 'Esta criatura no puede atacar.' },
        { term: 'Demostrar / Demonstrate', definition: 'Copia este hechizo y permite que un oponente también lo haga.' },
        { term: 'Desaparecer N / Vanishing N', definition: 'Entra con contadores. Quita uno por turno y sacrifica al final.' },
        { term: 'Desenterrar / Unearth', definition: 'Regresa del cementerio con prisa por un turno.' },
        { term: 'Destello / Flash', definition: 'Puede lanzarse en cualquier momento que puedas lanzar un instantáneo.' },
        { term: 'Destreza / Prowess', definition: 'Gana +1/+1 cuando lanzas un hechizo que no sea de criatura.' },
        { term: 'Desvanecer N / Fading N', definition: 'Entra con contadores. Sacrifícalo cuando no queden.' },
        { term: 'Devorar N / Devour N', definition: 'Sacrifica criaturas al entrar para ganar N contadores por cada una.' },
        { term: 'Discreción / Disguise', definition: 'Lánzalo boca abajo como 2/2 con Amparo {2}.' },
        { term: 'Disturbio / Disturb', definition: 'Lanza esta carta transformada desde tu cementerio.' },
        { term: 'Dragado N / Dredge N', definition: 'Cambia un robo por poner N cartas al cementerio para recuperar esta carta.' },
        { term: 'Eco / Echo', definition: 'Paga su coste de nuevo en tu siguiente turno o sacrifica.' },
        { term: 'Embalsamar / Embalm', definition: 'Exilia del cementerio para crear una ficha copia Zombi.' },
        { term: 'Emerger / Emerge', definition: 'Lanza sacrificando una criatura para reducir el coste.' },
        { term: 'Encantar / Enchant', definition: 'Se anexa a un tipo específico de permanente o jugador.' },
        { term: 'Encore / Encore', definition: 'Exilia para atacar a cada oponente con copias este turno.' },
        { term: 'Enlistar / Enlist', definition: 'Gira una criatura para sumar su fuerza a este atacante.' },
        { term: 'Entrelazar / Entwine', definition: 'Paga un extra para elegir todos los modos del hechizo.' },
        { term: 'Épico / Epic', definition: 'No lanzas más hechizos, pero copias este cada turno.' },
        { term: 'Equipar / Equip', definition: 'Anexa este equipo a una criatura que controles.' },
        { term: 'Escalar / Escalate', definition: 'Paga un coste extra por cada modo adicional elegido.' },
        { term: 'Escape / Escape', definition: 'Lanza del cementerio pagando maná y exiliando cartas.' },
        { term: 'Espolear / Goad', definition: 'Fuerza a una criatura a atacar a alguien que no seas tú.' },
        { term: 'Estación / Station', definition: 'Habilidad personalizada para defender una posición.' },
        { term: 'Eternalizar / Eternalize', definition: 'Exilia del cementerio para crear una ficha copia Zombi 4/4.' },
        { term: 'Evocar / Evoke', definition: 'Lánzalo por menos maná, pero se sacrifica al entrar.' },
        { term: 'Evolucionar / Evolve', definition: 'Gana un contador cuando entra una criatura más grande.' },
        { term: 'Exaltado / Exalted', definition: 'Si una criatura ataca sola, gana +1/+1.' },
        { term: 'Exhausto / Exhaust', definition: 'Habilidad personalizada que limita el uso de recursos.' },
        { term: 'Explotar / Exploit', definition: 'Al entrar, puedes sacrificar una criatura para un efecto extra.' },
        { term: 'Extorsión / Extort', definition: 'Al lanzar hechizos, paga {W/B} para drenar 1 vida a cada oponente.' },
        { term: 'Fabricar N / Fabricate N', definition: 'Al entrar, elige N contadores o N fichas de Servo 1/1.' },
        { term: 'Flashback / Flashback', definition: 'Lanza la carta desde tu cementerio y luego exíliala.' },
        { term: 'Frenesí N / Frenzy N', definition: 'Gana +N/+0 si ataca y no es bloqueada.' },
        { term: 'Fuse / Fuse', definition: 'Lanza una o ambas mitades de esta carta partida.' },
        { term: 'Gift / Gift', definition: 'Promete un regalo a un oponente para mejorar el efecto.' },
        { term: 'Graft N / Graft N', definition: 'Entra con contadores. Pásalos a otros al entrar.' },
        { term: 'Gravestorm / Gravestorm', definition: 'Se copia por cada permanente que fue al cementerio este turno.' },
        { term: 'Harmonizar / Harmonize', definition: 'Disparador personalizado al compartir tipos o colores.' },
        { term: 'Hexproof / Hexproof', definition: 'No puede ser objetivo de hechizos o habilidades de oponentes.' },
        { term: 'Hideaway / Hideaway', definition: 'Exilia una carta del tope para jugarla gratis luego.' },
        { term: 'Hidden Agenda / Hidden Agenda', definition: 'Nombra una carta en secreto para obtener un bono.' },
        { term: 'Horsemanship / Horsemanship', definition: 'Solo puede ser bloqueada por criaturas con Horsemanship.' },
        { term: 'Impending N / Impending N', definition: 'Entra con contadores; se vuelve criatura cuando se acaban.' },
        { term: 'Improvisar / Improvise', definition: 'Tus artefactos ayudan a pagar este hechizo.' },
        { term: 'Indestructible / Indestructible', definition: 'No puede ser destruido por daño o efectos de "destruir".' },
        { term: 'Infectar / Infect', definition: 'Daña con contadores -1/-1 a criaturas y veneno a jugadores.' },
        { term: 'Ingerir / Ingest', definition: 'Al dañar al jugador, este exilia el tope de su biblioteca.' },
        { term: 'Intimidar / Intimidate', definition: 'Solo bloqueable por artefactos o criaturas de su mismo color.' },
        { term: 'Job Select / Job Select', definition: 'Elige un rol o clase específica para esta carta.' },
        { term: 'Jump-Start / Jump-Start', definition: 'Lanza del cementerio descartando una carta.' },
        { term: 'Kicker / Kicker', definition: 'Coste opcional para un efecto adicional.' },
        { term: 'Landwalk / Landwalk', definition: 'Imbloqueable si el oponente tiene un tipo de tierra.' },
        { term: 'Level Up / Level Up', definition: 'Paga para subir de nivel y ganar nuevas habilidades.' },
        { term: 'Lifelink / Lifelink', definition: 'El daño infligido por esta criatura también te cura.' },
        { term: 'Living Metal / Living Metal', definition: 'Este vehículo es criatura durante tu turno.' },
        { term: 'Living Weapon / Living Weapon', definition: 'Entra con un Germen 0/0 y se anexa a él.' },
        { term: 'Madness / Madness', definition: 'Al descartarla, puedes lanzarla por su coste de locura.' },
        { term: 'Max Speed / Max Speed', definition: 'Aumenta el movimiento o efectos de prisa.' },
        { term: 'Mayhem / Mayhem', definition: 'Disparador relacionado con el caos o daño masivo.' },
        { term: 'Melee / Melee', definition: 'Gana +1/+1 por cada oponente atacado este turno.' },
        { term: 'Mentor / Mentor', definition: 'Al atacar, pon un contador en un atacante más débil.' },
        { term: 'Milagro / Miracle', definition: 'Cuesta muy poco si es la primera carta que robas.' },
        { term: 'Mobilizar / Mobilize', definition: 'Habilidad para enderezar o preparar para el combate.' },
        { term: 'Modular N / Modular N', definition: 'Entra con contadores. Al morir, pásalos a otro artefacto.' },
        { term: 'More Than Meets the Eye / More Than Meets the Eye', definition: 'Lanza la carta transformada por un coste específico.' },
        { term: 'Morph / Morph', definition: 'Lánzalo boca abajo como 2/2 por {3}. Voltéalo luego.' },
        { term: 'Mutar / Mutate', definition: 'Fusiona esta carta con una criatura no humana.' },
        { term: 'Myriad / Myriad', definition: 'Al atacar, crea copias para cada oponente adicional.' },
        { term: 'Ninjutsu / Ninjutsu', definition: 'Cambia un atacante no bloqueado por esta carta de tu mano.' },
        { term: 'Offering / Offering', definition: 'Sacrifica un tipo para lanzar esto más barato y rápido.' },
        { term: 'Offspring / Offspring', definition: 'Paga extra para crear una copia 1/1 al entrar.' },
        { term: 'Outlast / Outlast', definition: 'Gira y paga maná para ponerte un contador +1/+1.' },
        { term: 'Overload / Overload', definition: 'Cambia "objetivo" por "cada" en el texto del hechizo.' },
        { term: 'Partner / Partner', definition: 'Puedes tener dos comandantes si ambos tienen Partner.' },
        { term: 'Persistir / Persist', definition: 'Si muere sin contadores -1/-1, vuelve con uno.' },
        { term: 'Phasing / Phasing', definition: 'Existe y deja de existir cada dos turnos.' },
        { term: 'Plot / Plot', definition: 'Exilia de la mano para lanzar gratis en un turno posterior.' },
        { term: 'Poisonous N / Poisonous N', definition: 'Al dañar a un jugador, le da N contadores de veneno.' },
        { term: 'Prisa / Haste', definition: 'Puede atacar o girarse en cuanto entra en juego.' },
        { term: 'Protección / Protection', definition: 'No puede ser objetivo, dañado o bloqueado por algo específico.' },
        { term: 'Prototipo / Prototype', definition: 'Lánzalo con estadísticas y coste diferentes.' },
        { term: 'Provocar / Provoke', definition: 'Al atacar, obliga a una criatura oponente a bloquear.' },
        { term: 'Prowl / Prowl', definition: 'Cuesta menos si ya dañaste con ese tipo de criatura.' },
        { term: 'Rampage N / Rampage N', definition: 'Gana +N/+N por cada bloqueador extra.' },
        { term: 'Ravenous / Ravenous', definition: 'Entra con contadores X. Si X es 5+, robas carta.' },
        { term: 'Read Ahead / Read Ahead', definition: 'Elige en qué capítulo comienza esta Saga.' },
        { term: 'Rebound / Rebound', definition: 'Lánzalo gratis desde el exilio en tu próximo turno.' },
        { term: 'Reconfigurar / Reconfigure', definition: 'Anexa a una criatura o sepáralo para ser criatura.' },
        { term: 'Recover / Recover', definition: 'Paga cuando muere una criatura para recuperarlo del cementerio.' },
        { term: 'Reinforce N / Reinforce N', definition: 'Descarta para poner N contadores en una criatura.' },
        { term: 'Replicar / Replicate', definition: 'Paga un extra para copiar el hechizo varias veces.' },
        { term: 'Retrace / Retrace', definition: 'Lanza del cementerio descartando una tierra.' },
        { term: 'Riot / Riot', definition: 'Entra con un contador +1/+1 o con prisa.' },
        { term: 'Ripple N / Ripple N', definition: 'Revela el tope para lanzar copias gratis.' },
        { term: 'Saddle N / Saddle N', definition: 'Gira criaturas para "montar" esta y ganar bonos.' },
        { term: 'Scavenge / Scavenge', definition: 'Exilia del cementerio para dar contadores a una criatura.' },
        { term: 'Shadow / Shadow', definition: 'Solo interactúa con otras criaturas con Shadow.' },
        { term: 'Shroud / Shroud', definition: 'Nadie puede hacerlo objetivo.' },
        { term: 'Skulk / Skulk', definition: 'No puede ser bloqueado por criaturas con más fuerza.' },
        { term: 'Solved / Solved', definition: 'Condición cumplida para desbloquear el poder de un "Caso".' },
        { term: 'Soulbond / Soulbond', definition: 'Empareja esta criatura con otra para bonos mutuos.' },
        { term: 'Soulshift N / Soulshift N', definition: 'Recupera un Espíritu de coste N al morir.' },
        { term: 'Space Sculptor / Space Sculptor', definition: 'Modifica las zonas o posiciones del campo de batalla.' },
        { term: 'Spectacle / Spectacle', definition: 'Cuesta menos si un oponente perdió vida este turno.' },
        { term: 'Splice / Splice', definition: 'Añade el efecto de esta carta a otro hechizo.' },
        { term: 'Split Second / Split Second', definition: 'Nadie puede responder mientras este hechizo esté en la pila.' },
        { term: 'Spree / Spree', definition: 'Paga extra por cada modo que quieras usar.' },
        { term: 'Squad / Squad', definition: 'Paga extra para crear múltiples copias al entrar.' },
        { term: 'Start Your Engines! / Start Your Engines!', definition: 'Disparador para la activación de vehículos.' },
        { term: 'Storm / Storm', definition: 'Se copia por cada hechizo lanzado antes este turno.' },
        { term: 'Sunburst / Sunburst', definition: 'Entra con contadores según los colores de maná usados.' },
        { term: 'Surge / Surge', definition: 'Cuesta menos si tú o un aliado ya lanzaron un hechizo.' },
        { term: 'Suspend N / Suspend N', definition: 'Exilia con contadores y lánzalo gratis al terminarse.' },
        { term: 'Tiered / Tiered', definition: 'Habilidad que escala por niveles o rangos.' },
        { term: 'Toque mortal / Deathtouch', definition: 'Cualquier cantidad de daño que esto inflija mata a la criatura.' },
        { term: 'Toxic N / Toxic N', definition: 'Da N contadores de veneno al dañar jugadores.' },
        { term: 'Training / Training', definition: 'Gana un contador al atacar con alguien más fuerte.' },
        { term: 'Transfigurar / Transfigure', definition: 'Sacrifica para buscar una criatura del mismo coste.' },
        { term: 'Transmuta / Transmute', definition: 'Descarta para buscar una carta del mismo coste.' },
        { term: 'Tributo N / Tribute N', definition: 'El oponente elige darle contadores o activar un efecto.' },
        { term: 'Umbra Armor / Umbra Armor', definition: 'Se sacrifica para salvar a la criatura encantada.' },
        { term: 'Undaunted / Undaunted', definition: 'Cuesta {1} menos por cada oponente.' },
        { term: 'Undying / Undying', definition: 'Si muere sin contadores +1/+1, vuelve con uno.' },
        { term: 'Unleash / Unleash', definition: 'Entra con un contador, pero no puede bloquear si lo tiene.' },
        { term: 'Vanishing N / Vanishing N', definition: 'Entra con contadores. Sacrifica al agotarse.' },
        { term: 'Vigilancia / Vigilance', definition: 'Atacar no hace que esta criatura se gire.' },
        { term: 'Visit / Visit', definition: 'Disparador al entrar o afectar una zona específica.' },
        { term: 'Volar / Flying', definition: 'Solo bloqueable por criaturas con Volar o Alcance.' },
        { term: 'Vínculo vital / Lifelink', definition: 'El daño que hace esta criatura te cura esa cantidad.' },
        { term: 'Ward / Ward', definition: 'El oponente debe pagar extra para hacerlo objetivo.' },
        { term: 'Warp / Warp', definition: 'Habilidad para teletransportar o transformar cartas.' },
        { term: 'Web-slinging / Web-slinging', definition: 'Habilidad para atrapar o bloquear voladoras.' },
        { term: 'Wither / Wither', definition: 'Daña a las criaturas con contadores -1/-1.' },
        { term: '∞ (Infinity) / ∞ (Infinity)', definition: 'Representa un valor infinito o efecto sin límites.' }
    ]

};

export const GlossaryModal: React.FC<GlossaryModalProps> = ({ isOpen, onClose }) => {
    const [lang, setLang] = useState<'en' | 'es'>('en');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredEntries = useMemo(() => {
        const term = searchTerm.toLowerCase().trim();
        if (!term) return glossaryData[lang].map(item => ({ ...item, isOriginalLang: true }));

        const otherLang = lang === 'en' ? 'es' : 'en';
        
        // Results from current language
        const currentResults = glossaryData[lang].filter(item => 
            item.term.toLowerCase().includes(term) || 
            (item.altTerm && item.altTerm.toLowerCase().includes(term)) ||
            item.definition.toLowerCase().includes(term)
        ).map(item => ({ ...item, isOriginalLang: true }));

        // Results from other language to provide bilingual search
        const otherResults = glossaryData[otherLang].filter(item => 
            item.term.toLowerCase().includes(term) || 
            (item.altTerm && item.altTerm.toLowerCase().includes(term)) ||
            item.definition.toLowerCase().includes(term)
        ).map(item => ({ ...item, isOriginalLang: false }));

        // Combine and remove near-duplicates (by term similarity)
        const combined = [...currentResults];
        
        otherResults.forEach(otherItem => {
            // Only add if not already present in current results with a similar term
            const isDuplicate = currentResults.some(curr => 
                curr.term.toLowerCase() === otherItem.term.toLowerCase()
            );
            if (!isDuplicate) {
                combined.push(otherItem);
            }
        });

        return combined;
    }, [searchTerm, lang]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 overflow-hidden">
            {/* Backdrop with magic blur */}
            <div 
                className="absolute inset-0 bg-slate-950/60 backdrop-blur-xl animate-in fade-in duration-500" 
                onClick={onClose} 
            />
            
            {/* Modal Container */}
            <div className="relative w-full max-w-2xl h-[80vh] overflow-hidden rounded-[2rem] border-2 border-indigo-500/30 shadow-[0_0_80px_rgba(99,102,241,0.2)] animate-in zoom-in-95 fade-in duration-300 flex flex-col bg-slate-950">
                
                {/* Magical Background Elements */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/40 via-purple-950/20 to-slate-950" />
                    
                    {/* Fire/Flame effects at the bottom */}
                    <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-orange-600/10 rounded-full blur-[100px] animate-pulse" />
                    <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-red-600/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
                    
                    {/* Floating Particles */}
                    <MagicParticles count={40} className="opacity-30" />
                    
                    {/* Animated gradient orbs */}
                    <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-indigo-500/10 rounded-full blur-[60px] animate-bounce-subtle" />
                    <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-purple-500/10 rounded-full blur-[60px] animate-bounce-subtle" style={{ animationDelay: '1.5s' }} />
                </div>

                {/* Header */}
                <div className="relative z-10 p-6 border-b border-white/10 bg-white/5 backdrop-blur-md flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-500/20 rounded-xl border border-indigo-500/30">
                                <Book className="text-indigo-400" size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                                    Glossary / Glosario
                                    <Sparkles size={16} className="text-amber-400 animate-pulse" />
                                </h2>
                                <p className="text-xs text-indigo-300/60 font-medium uppercase tracking-widest">Magic Abilities Guide</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            {/* Language Toggle */}
                            <div className="flex bg-black/40 p-1 rounded-lg border border-white/10">
                                <button 
                                    onClick={() => setLang('en')}
                                    className={clsx(
                                        "px-3 py-1 rounded-md text-xs font-bold transition-all duration-300 flex items-center gap-1",
                                        lang === 'en' ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20" : "text-white/40 hover:text-white/70"
                                    )}
                                >
                                    <Languages size={12} />
                                    EN
                                </button>
                                <button 
                                    onClick={() => setLang('es')}
                                    className={clsx(
                                        "px-3 py-1 rounded-md text-xs font-bold transition-all duration-300 flex items-center gap-1",
                                        lang === 'es' ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20" : "text-white/40 hover:text-white/70"
                                    )}
                                >
                                    <Languages size={12} />
                                    ES
                                </button>
                            </div>

                            <button 
                                onClick={onClose}
                                className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-full transition-all duration-300"
                            >
                                <X size={24} />
                            </button>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search size={18} className="text-indigo-400 group-focus-within:text-amber-400 transition-colors duration-300" />
                        </div>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder={lang === 'en' ? "Search abilities (Haste, Scry...)" : "Buscar habilidades (Prisa, Adivinar...)"}
                            className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all duration-300 backdrop-blur-md"
                        />
                        {/* Magic glow behind search */}
                        <div className="absolute inset-0 -z-10 bg-indigo-500/5 blur-xl rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
                    </div>
                </div>

                {/* Content */}
                <div className="relative z-10 flex-1 overflow-y-auto p-6 custom-scrollbar">
                    {filteredEntries.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredEntries.map((item, idx) => (
                                <div 
                                    key={idx} 
                                    className="group relative bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-4 transition-all duration-500 hover:scale-[1.02] hover:shadow-xl hover:shadow-indigo-500/5 animate-fade-in-up"
                                    style={{ animationDelay: `${idx * 0.05}s` }}
                                >
                                    {/* Magic glow on hover */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 via-purple-500/0 to-amber-500/0 group-hover:from-indigo-500/5 group-hover:via-purple-500/5 group-hover:to-amber-500/5 rounded-2xl transition-all duration-500" />
                                    
                                    <div className="relative">
                                        <div className="flex items-center justify-between mb-1">
                                            <h3 className="text-lg font-bold text-indigo-300 flex items-center gap-2">
                                                {item.term}
                                                <Flame size={14} className="text-orange-500/0 group-hover:text-orange-500/50 transition-all duration-500" />
                                            </h3>
                                            {!item.isOriginalLang && (
                                                <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-md text-[10px] font-bold text-white/40 uppercase tracking-widest">
                                                    {lang === 'en' ? 'ES' : 'EN'}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-white/70 leading-relaxed">
                                            {item.definition}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="p-4 bg-white/5 rounded-full mb-4 animate-pulse">
                                <Search size={48} className="text-white/20" />
                            </div>
                            <p className="text-white/40 text-lg font-medium">
                                {lang === 'en' ? "No magical abilities found..." : "No se encontraron habilidades mágicas..."}
                            </p>
                            <button 
                                onClick={() => setSearchTerm('')}
                                className="mt-4 text-indigo-400 hover:text-indigo-300 text-sm font-bold transition-colors underline decoration-dotted underline-offset-4"
                            >
                                {lang === 'en' ? "Clear search" : "Limpiar búsqueda"}
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer Decoration */}
                <div className="relative z-10 h-2 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
            </div>
        </div>
    );
};
