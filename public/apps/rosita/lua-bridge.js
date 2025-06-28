// Lua Bridge - Interface between frontend and Lua backend
// This module provides a clean API to interact with the Lua-powered audio engine

console.log('🚨 LUA-BRIDGE.JS IS LOADING!!!');

// Check if Tauri API is available
const invoke = window.__TAURI__?.invoke;

class LuaBridge {
    constructor() {
        this.initialized = false;
        this.currentInstrument = 'synth';
        this.activeVoices = new Map(); // Track active voices for note-off
    }

    async init() {
        try {
            if (!invoke) {
                console.error('❌ Tauri API not available - using fallback');
                // Return false so it loads the original script
                return false;
            }
            
            console.log('🎵 Tauri API found, initializing engine...');
            // Get initial engine state
            const state = await invoke('get_engine_state');
            console.log('🎵 Lua engine initialized:', state);
            this.initialized = true;
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize Lua engine:', error);
            // Return false so it loads the original script
            return false;
        }
    }

    // Piano/Keyboard interface
    async playNote(note, velocity = 1.0, instrument = null) {
        if (!this.initialized) return null;
        
        try {
            const inst = instrument || this.currentInstrument;
            console.log(`🎹 Attempting to play ${note} on ${inst} with velocity ${velocity}`);
            
            const voiceId = await invoke('play_note', {
                instrument: inst,
                note: note,
                velocity: velocity
            });
            
            // Track the voice for potential note-off
            this.activeVoices.set(note, voiceId);
            
            console.log(`🎹 Successfully playing ${note} on ${inst} (voice: ${voiceId})`);
            return voiceId;
        } catch (error) {
            console.error('❌ Error playing note:', error, error.stack);
            return null;
        }
    }

    async stopNote(note) {
        if (!this.initialized) return;
        
        const voiceId = this.activeVoices.get(note);
        if (voiceId) {
            try {
                await invoke('stop_note', { voiceId: voiceId });
                this.activeVoices.delete(note);
                console.log(`🎹 Stopped ${note} (voice: ${voiceId})`);
            } catch (error) {
                console.error('❌ Error stopping note:', error);
            }
        }
    }

    // Sequencer controls
    async sequencerPlay() {
        if (!this.initialized) return;
        
        try {
            await invoke('sequencer_play');
            console.log('▶️ Sequencer playing');
            return true;
        } catch (error) {
            console.error('❌ Error starting sequencer:', error);
            return false;
        }
    }

    async sequencerStop() {
        if (!this.initialized) return;
        
        try {
            await invoke('sequencer_stop');
            console.log('⏹️ Sequencer stopped');
            return true;
        } catch (error) {
            console.error('❌ Error stopping sequencer:', error);
            return false;
        }
    }

    async sequencerPause() {
        if (!this.initialized) return;
        
        try {
            await invoke('sequencer_pause');
            console.log('⏸️ Sequencer paused');
            return true;
        } catch (error) {
            console.error('❌ Error pausing sequencer:', error);
            return false;
        }
    }

    async setBPM(bpm) {
        if (!this.initialized) return;
        
        try {
            await invoke('set_bpm', { bpm: parseInt(bpm) });
            console.log(`🥁 BPM set to ${bpm}`);
            return true;
        } catch (error) {
            console.error('❌ Error setting BPM:', error);
            return false;
        }
    }

    // Pattern controls
    async toggleStep(pattern, track, step, velocity = 1.0) {
        if (!this.initialized) return false;
        
        try {
            const result = await invoke('toggle_step', {
                pattern: parseInt(pattern),
                track: parseInt(track),
                step: parseInt(step),
                velocity: velocity
            });
            
            console.log(`🎛️ Step [${pattern},${track},${step}] = ${result}`);
            return result;
        } catch (error) {
            console.error('❌ Error toggling step:', error);
            return false;
        }
    }

    async setPattern(pattern) {
        if (!this.initialized) return false;
        
        try {
            const result = await invoke('set_pattern', {
                pattern: parseInt(pattern)
            });
            
            console.log(`🎵 Pattern changed to ${pattern}`);
            return result;
        } catch (error) {
            console.error('❌ Error setting pattern:', error);
            return false;
        }
    }

    async clearPattern(pattern = null) {
        if (!this.initialized) return;
        
        try {
            await invoke('clear_pattern', {
                pattern: pattern ? parseInt(pattern) : null
            });
            
            console.log(`🧹 Pattern ${pattern || 'current'} cleared`);
            return true;
        } catch (error) {
            console.error('❌ Error clearing pattern:', error);
            return false;
        }
    }

    // Audio controls
    async setADSR(attack, decay, sustain, release) {
        if (!this.initialized) return;
        
        try {
            await invoke('set_adsr', {
                attack: attack,
                decay: decay,
                sustain: sustain,
                release: release
            });
            
            console.log(`🎛️ ADSR: A=${attack} D=${decay} S=${sustain} R=${release}`);
            return true;
        } catch (error) {
            console.error('❌ Error setting ADSR:', error);
            return false;
        }
    }

    async setEffect(effectName, parameter, value) {
        if (!this.initialized) return;
        
        try {
            await invoke('set_effect', {
                effectName: effectName,
                parameter: parameter,
                value: value
            });
            
            console.log(`🎭 Effect ${effectName}.${parameter} = ${value}`);
            return true;
        } catch (error) {
            console.error('❌ Error setting effect:', error);
            return false;
        }
    }

    async setInstrumentParam(instrument, parameter, value) {
        if (!this.initialized) return;
        
        try {
            await invoke('set_instrument_param', {
                instrument: instrument,
                parameter: parameter,
                value: value.toString()
            });
            
            console.log(`🎸 Instrument ${instrument}.${parameter} = ${value}`);
            return true;
        } catch (error) {
            console.error('❌ Error setting instrument parameter:', error);
            return false;
        }
    }

    // State management
    async getEngineState() {
        if (!this.initialized) return null;
        
        try {
            const state = await invoke('get_engine_state');
            return state;
        } catch (error) {
            console.error('❌ Error getting engine state:', error);
            return null;
        }
    }

    // Get pattern data for visual display
    async getPatternData(pattern) {
        if (!this.initialized) return null;
        
        try {
            const state = await invoke('get_engine_state');
            if (state && state.sequencer && state.sequencer.patterns) {
                return state.sequencer.patterns[pattern] || null;
            }
            return null;
        } catch (error) {
            console.error('❌ Error getting pattern data:', error);
            return null;
        }
    }

    // Instrument selection
    setCurrentInstrument(instrument) {
        this.currentInstrument = instrument;
        console.log(`🎸 Current instrument: ${instrument}`);
    }

    // Utility methods
    noteToFrequency(note) {
        // Note name to frequency conversion (simplified)
        const noteMap = {
            'c': 261.63, 'cs': 277.18, 'd': 293.66, 'ds': 311.13,
            'e': 329.63, 'f': 349.23, 'fs': 369.99, 'g': 392.00,
            'gs': 415.30, 'a': 440.00, 'as': 466.16, 'b': 493.88,
            'c2': 523.25, 'cs2': 554.37, 'd2': 587.33, 'ds2': 622.25,
            'e2': 659.25, 'f2': 698.46, 'fs2': 739.99, 'g2': 783.99,
            'gs2': 830.61, 'a2': 880.00, 'as2': 932.33, 'b2': 987.77
        };
        return noteMap[note] || 440.0;
    }

    // Track control  
    async setTrackInstrument(track, instrument) {
        if (!this.initialized) return false;
        
        try {
            await invoke('set_instrument_param', {
                instrument: `track_${track}`,
                parameter: 'instrument',
                value: instrument
            });
            
            console.log(`🎸 Track ${track} instrument set to ${instrument}`);
            return true;
        } catch (error) {
            console.error('❌ Error setting track instrument:', error);
            return false;
        }
    }

    async setTrackNote(track, note) {
        if (!this.initialized) return false;
        
        try {
            await invoke('set_instrument_param', {
                instrument: `track_${track}`,
                parameter: 'note',
                value: note
            });
            
            console.log(`🎵 Track ${track} note set to ${note}`);
            return true;
        } catch (error) {
            console.error('❌ Error setting track note:', error);
            return false;
        }
    }

    // Convert old script API calls to new Lua backend
    mapLegacyCall(methodName, ...args) {
        switch (methodName) {
            case 'playNote':
                return this.playNote(...args);
            case 'stopNote':
                return this.stopNote(...args);
            case 'play':
                return this.sequencerPlay();
            case 'stop':
                return this.sequencerStop();
            case 'pause':
                return this.sequencerPause();
            case 'setBPM':
                return this.setBPM(...args);
            case 'toggleStep':
                return this.toggleStep(...args);
            case 'setPattern':
                return this.setPattern(...args);
            case 'clearPattern':
                return this.clearPattern(...args);
            default:
                console.warn(`🤷 Unknown legacy method: ${methodName}`);
                return Promise.resolve(false);
        }
    }
}

// Create global instance
const luaBridge = new LuaBridge();

// Export for module use
export default luaBridge;

// Also attach to window for legacy script compatibility
window.luaBridge = luaBridge;