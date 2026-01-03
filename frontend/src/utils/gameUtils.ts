export const categorizeObjects = (objects: any[]) => {
    const lands: any[] = [];
    const creatures: any[] = [];
    const others: any[] = [];

    objects.forEach((obj: any) => {
        let type = obj.type_line || '';
        const customKind = obj.custom_card?.kind;
        
        if (!type && obj.scryfall_id) {
            const cachedV3 = localStorage.getItem(`card_data_v3_${obj.scryfall_id}`);
            const cachedV2 = localStorage.getItem(`card_data_v2_${obj.scryfall_id}`);
            const cached = cachedV3 || cachedV2;
            if (cached) {
                try { type = JSON.parse(cached).type; } catch(_e) {}
            }
        }
        
        const lowerType = type.toLowerCase();
        
        // Prioridad 1: Si es una carta personalizada, usamos su 'kind' explícito
        if (customKind === 'Land') {
            lands.push(obj);
        } else if (customKind === 'Creature') {
            creatures.push(obj);
        } else if (customKind === 'Non-creature') {
            others.push(obj);
        }
        // Prioridad 2: Si no es personalizada (o no tiene kind), usamos el type_line
        else if (lowerType.includes('land')) {
            lands.push(obj);
        } else if (lowerType.includes('creature') && !lowerType.includes('non-creature') && !lowerType.includes('noncreature')) {
            creatures.push(obj);
        } else {
            others.push(obj);
        }
    });
    return { lands, creatures, others };
};

export const ZONE_LABELS: Record<string, string> = {
    HAND: '✋🏻Mano',
    LIBRARY: '📚Biblioteca',
    GRAVEYARD: '⚰️Cementerio',
    EXILE: '🌀Exilio',
    BATTLEFIELD: '⚔️Campo',
    COMMAND: '👑Command Zone',
    SIDEBOARD: '🛡️SideBoard'
};
