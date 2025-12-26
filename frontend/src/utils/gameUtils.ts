export const categorizeObjects = (objects: any[]) => {
    const lands: any[] = [];
    const creatures: any[] = [];
    const others: any[] = [];

    objects.forEach((obj: any) => {
        const cacheKey = `card_data_v2_${obj.scryfall_id}`;
        const cached = localStorage.getItem(cacheKey);
        let type = '';
        if (cached) {
            try { type = JSON.parse(cached).type; } catch(e){}
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
    BATTLEFIELD: '⚔️Campo'
};
