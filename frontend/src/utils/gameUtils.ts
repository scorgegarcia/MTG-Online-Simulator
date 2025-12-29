export const categorizeObjects = (objects: any[]) => {
    const lands: any[] = [];
    const creatures: any[] = [];
    const others: any[] = [];

    objects.forEach((obj: any) => {
        let type = obj.type_line || '';
        
        if (!type && obj.scryfall_id) {
            const cachedV3 = localStorage.getItem(`card_data_v3_${obj.scryfall_id}`);
            const cachedV2 = localStorage.getItem(`card_data_v2_${obj.scryfall_id}`);
            const cached = cachedV3 || cachedV2;
            if (cached) {
                try { type = JSON.parse(cached).type; } catch(_e) {}
            }
        }
        
        if (type.toLowerCase().includes('land')) lands.push(obj);
        else if (type.toLowerCase().includes('creature')) creatures.push(obj);
        else others.push(obj);
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
