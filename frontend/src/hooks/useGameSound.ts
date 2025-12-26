import { useCallback, useEffect, useRef } from 'react';
import drawCardSfx from '../assets/sfx/draw_card.mp3';
import shuffleCardsSfx from '../assets/sfx/shuffle_cards.mp3';
import untapAllSfx from '../assets/sfx/untap_all.mp3';
import commanderEnterSfx from '../assets/sfx/commander_enters_battlefield.mp3';
import moveCardSfx from '../assets/sfx/move_card.mp3';
import castLandSfx from '../assets/sfx/cast_land_card.mp3';
import castCreatureSfx from '../assets/sfx/cast_creature_card.mp3';
import castNonCreatureSfx from '../assets/sfx/cast_non_creature_card.mp3';
import toggleTapSfx from '../assets/sfx/toggle_tap_untap.mp3';

export const useGameSound = () => {
    const audioRefs = useRef<Record<string, HTMLAudioElement>>({});

    useEffect(() => {
        const loadAudio = (key: string, src: string) => {
            const audio = new Audio(src);
            audio.volume = 0.5;
            audioRefs.current[key] = audio;
        };

        loadAudio('DRAW', drawCardSfx);
        loadAudio('SHUFFLE', shuffleCardsSfx);
        loadAudio('UNTAP_ALL', untapAllSfx);
        loadAudio('COMMANDER_ENTER', commanderEnterSfx);
        loadAudio('MOVE', moveCardSfx);
        loadAudio('LAND', castLandSfx);
        loadAudio('CREATURE', castCreatureSfx);
        loadAudio('NON_CREATURE', castNonCreatureSfx);
        loadAudio('TAP', toggleTapSfx);
    }, []);

    const playSound = (key: string) => {
        const audio = audioRefs.current[key];
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(e => console.warn("Audio play failed", e));
        }
    };

    const handleGameAction = useCallback((action: any, gameState: any) => {
        if (!action) return;

        switch (action.type) {
            case 'DRAW':
                playSound('DRAW');
                break;
            case 'SHUFFLE':
                playSound('SHUFFLE');
                break;
            case 'UNTAP_ALL':
                playSound('UNTAP_ALL');
                break;
            case 'TAP':
                playSound('TAP');
                break;
            case 'MOVE': {
                const { objectId, fromZone, toZone } = action.payload;
                
                if (toZone === 'BATTLEFIELD') {
                    // Check if it's a commander entering
                    if (fromZone === 'COMMAND') {
                        playSound('COMMANDER_ENTER');
                        return;
                    }

                    // Check card type
                    const obj = gameState.objects[objectId];
                    if (obj && obj.scryfall_id) {
                        const cacheKey = `card_data_v2_${obj.scryfall_id}`;
                        const cached = localStorage.getItem(cacheKey);
                        let typeLine = '';
                        
                        if (cached) {
                            try {
                                typeLine = JSON.parse(cached).type || '';
                            } catch (e) {
                                console.error('Error parsing cached card data', e);
                            }
                        }

                        const lowerType = typeLine.toLowerCase();
                        if (lowerType.includes('land')) {
                            playSound('LAND');
                        } else if (lowerType.includes('creature')) {
                            playSound('CREATURE');
                        } else {
                            playSound('NON_CREATURE');
                        }
                    } else {
                        // Token or unknown
                        playSound('NON_CREATURE');
                    }
                } else {
                    // Moving to any other zone (Library, Graveyard, Hand, Exile, Command, Sideboard)
                    playSound('MOVE');
                }
                break;
            }
            // PEK_ZONE / PEEK_LIBRARY usually don't need sound or maybe a generic click?
            // User didn't specify.
        }
    }, []);

    return { handleGameAction };
};
