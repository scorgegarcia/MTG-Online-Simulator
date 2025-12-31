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
import selectCardSfx from '../assets/sfx/select_card.mp3';
import popSfx from '../assets/sfx/pop.mp3';
import damageSfx from '../assets/sfx/damage.mp3';
import damageCommanderSfx from '../assets/sfx/damage_commander.mp3';
import equipOnSfx from '../assets/sfx/equip_on.mp3';
import equipOffSfx from '../assets/sfx/equip_off.mp3';
import dragCardSfx from '../assets/sfx/drag_card.mp3';
import dropCardSfx from '../assets/sfx/drop_card.mp3';
import diceRollSfx from '../assets/sfx/dice_roll.mp3';
import endOfTurnSfx from '../assets/sfx/end_of_turn.mp3';
import confirmHandSfx from '../assets/sfx/confirm_hand.mp3';
import retryMulliganSfx from '../assets/sfx/retry_mulligan.mp3';
import arrowOnSfx from '../assets/sfx/woosh_agudo.mp3';
import arrowOffSfx from '../assets/sfx/woosh_grave.mp3';

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
        loadAudio('SELECT', selectCardSfx);
        loadAudio('THINKING', popSfx);
        loadAudio('DAMAGE', damageSfx);
        loadAudio('DAMAGE_COMMANDER', damageCommanderSfx);
        loadAudio('EQUIP_ON', equipOnSfx);
        loadAudio('EQUIP_OFF', equipOffSfx);
        loadAudio('DRAG_CARD', dragCardSfx);
        loadAudio('DROP_CARD', dropCardSfx);
        loadAudio('DICE_ROLL', diceRollSfx);
        loadAudio('END_OF_TURN', endOfTurnSfx);
        loadAudio('CONFIRM_HAND', confirmHandSfx);
        loadAudio('RETRY_MULLIGAN', retryMulliganSfx);
        loadAudio('ARROW_ON', arrowOnSfx);
        loadAudio('ARROW_OFF', arrowOffSfx);
    }, []);

    const playSound = useCallback((key: string) => {
        const audio = audioRefs.current[key];
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(e => console.warn("Audio play failed", e));
        }
    }, []);

    const playUiSound = useCallback((key: 'DRAG_CARD' | 'DROP_CARD' | 'SELECT' | 'ARROW_ON' | 'ARROW_OFF') => {
        playSound(key);
    }, [playSound]);

    const handleGameAction = useCallback((action: any, gameState: any, mySeat?: any) => {
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
            case 'START_TURN':
                playSound('UNTAP_ALL');
                setTimeout(() => playSound('DRAW'), 400);
                break;
            case 'TAP':
                playSound('TAP');
                break;
            case 'REVEAL_TOGGLE_CARD':
                playSound('SELECT');
                break;
            case 'THINKING':
                playSound('THINKING');
                break;
            case 'ROLL_DICE':
                playSound('DICE_ROLL');
                break;
            case 'PASS_TURN':
                playSound('END_OF_TURN');
                break;
            case 'EQUIP_ATTACH':
                playSound('EQUIP_ON');
                break;
            case 'EQUIP_DETACH':
                playSound('EQUIP_OFF');
                break;
            case 'ENCHANT_ATTACH':
                playSound('EQUIP_ON');
                break;
            case 'ENCHANT_DETACH':
                playSound('EQUIP_OFF');
                break;
            case 'LIFE_SET':
                if (mySeat !== undefined && action.payload.seat === mySeat && action.payload.delta < 0) {
                    playSound('DAMAGE');
                }
                break;
            case 'COMMANDER_DAMAGE':
                if (mySeat !== undefined && action.payload.seat === mySeat && action.payload.delta > 0) {
                    playSound('DAMAGE_COMMANDER');
                }
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
    }, [playSound]);

    return { handleGameAction, playUiSound, playSound };
};
