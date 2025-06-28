// Main entry point for drum module
import { playKickDrum, playSnare, playHiHat, playTom, playCrash, playRim, playPercussion } from './types.js';
import { createNoiseNode, createReverbBuffer } from './utilities.js';

// Re-export drum function and re-import specific drum type functions
export { createNoiseNode, createReverbBuffer };

// Import and expose the main player function
import { playDrumSound } from './player.js';
export { playDrumSound };

// Make all the drum type functions available to the player module
// Use window instead of global for browser environment
window.playKickDrum = playKickDrum;
window.playSnare = playSnare;
window.playHiHat = playHiHat;
window.playTom = playTom;
window.playCrash = playCrash;
window.playRim = playRim;
window.playPercussion = playPercussion;