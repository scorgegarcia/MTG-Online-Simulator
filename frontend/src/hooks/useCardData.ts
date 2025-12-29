import { useState, useEffect } from 'react';

export const useCardData = (scryfallId: string | null) => {
    const [data, setData] = useState<{img: string, type: string, power?: string, toughness?: string, colors?: string[]}>({ img: '', type: '' });
    
    useEffect(() => {
        if(!scryfallId) {
            setData({ img: '', type: '' });
            return;
        }
        
        const cacheKey = `card_data_v3_${scryfallId}`;
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
            setData(JSON.parse(cached));
            return;
        }

        fetch(`https://api.scryfall.com/cards/${scryfallId}`)
          .then(r => r.json())
          .then(d => {
              const img = d.image_uris?.normal || d.card_faces?.[0]?.image_uris?.normal || '';
              const type = d.type_line || '';
              const power = d.power;
              const toughness = d.toughness;
              const colors = d.colors || d.card_faces?.[0]?.colors || [];
              
              const val = { img, type, power, toughness, colors };
              localStorage.setItem(cacheKey, JSON.stringify(val));
              setData(val);
          })
          .catch(() => setData({ img: '', type: '' }));
    }, [scryfallId]);

    return data;
};
