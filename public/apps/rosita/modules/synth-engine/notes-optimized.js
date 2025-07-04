/**
 * Optimized notes module using audio node pooling
 */

import { acquireGainNode, releaseNode } from '../audio/node-pool.js';

/**
 * Converts a note name to its frequency
 * @param {string} note - Note name with octave (e.g., "A4")
 * @returns {number} The frequency of the note in Hz
 */
export function noteToFrequency(note) {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const noteName = note.slice(0, -1);
    const octave = parseInt(note.slice(-1));
    
    const noteIndex = notes.indexOf(noteName);
    if (noteIndex === -1) return 440; // Default to A4 if not found
    
    // A4 is 440Hz, and each octave doubles the frequency
    // A4 is the 57th key (0-indexed) on an 88-key piano
    const keyNumber = noteIndex + (octave * 12);
    const a4Key = 9 + (4 * 12); // A4 key number
    
    return 440 * Math.pow(2, (keyNumber - a4Key) / 12);
}

/**
 * Plays a note with the current instrument (optimized version)
 * @param {string} note - Note name with octave (e.g., "A4")
 */
export function playNote(note) {
    // Make sure AudioContext is running (needed for Chrome)
    if (this.audioContext.state !== 'running') {
        this.audioContext.resume().catch(e => console.warn("Could not resume AudioContext:", e));
    }
    
    // If note is already playing, stop it first to avoid overlapping oscillators
    if (this.activeOscillators[note]) {
        try {
            this.stopNote(note, true); // Stop immediately to prevent overlapping
        } catch (e) {
            console.warn(`Error stopping existing note ${note}:`, e);
            // Force cleanup
            delete this.activeOscillators[note];
            if (this.activeGains[note]) {
                releaseNode(this.activeGains[note].gainNode);
                delete this.activeGains[note];
            }
        }
    }
    
    try {
        const frequency = this.noteToFrequency(note);
        const now = this.audioContext.currentTime;
        
        // Get current instrument settings
        const settings = this.instrumentSettings[this.currentInstrument];
        
        // Create oscillator (can't be pooled as they're one-time use)
        const oscillator = this.audioContext.createOscillator();
        oscillator.type = settings.waveform;
        oscillator.frequency.setValueAtTime(frequency, now);
        
        // Get gain node from pool
        const gainNode = acquireGainNode(this.audioContext);
        gainNode.gain.setValueAtTime(0, now);
        
        // Connect nodes - route through effects if available
        oscillator.connect(gainNode);
        
        // Route through effects processor if it exists
        if (this.effectsProcessor && this.effectsProcessor.getInputNode) {
            console.log('🎵 Routing note through effects processor');
            gainNode.connect(this.effectsProcessor.getInputNode());
        } else {
            console.log('⚠️ No effects processor, connecting directly to master');
            gainNode.connect(this.masterGain);
        }
        
        // Start oscillator
        oscillator.start(now);
        
        // ADSR Envelope Implementation with instrument volume
        // Get volume from sequencer if available or use instrument default
        let instrumentVolume = settings.volume || 0.7; // Default if not specified
        if (window.sequencer && typeof window.sequencer.getInstrumentVolume === 'function') {
            instrumentVolume = window.sequencer.getInstrumentVolume(this.currentInstrument);
        }
        
        // Attack - ramp from 0 to instrument volume
        const peakVolume = instrumentVolume;
        gainNode.gain.linearRampToValueAtTime(peakVolume, now + settings.attack);
        
        // Decay - ramp from peak to sustain level
        gainNode.gain.linearRampToValueAtTime(
            peakVolume * settings.sustain, 
            now + settings.attack + settings.decay
        );
        
        // Store active oscillator and gain node with timestamp for safety checks
        this.activeOscillators[note] = oscillator;
        this.activeGains[note] = { 
            gainNode: gainNode, 
            instrument: this.currentInstrument,
            startTime: now // Add start time for stuck note detection
        };
        
        console.log(`🎵 Playing note ${note} @ ${frequency.toFixed(2)}Hz`);
    } catch (error) {
        console.error(`Error playing note ${note}:`, error);
    }
}

/**
 * Stops a playing note (optimized version)
 * @param {string} note - Note name with octave (e.g., "A4")
 * @param {boolean} immediate - Whether to stop immediately without release
 */
export function stopNote(note, immediate = false) {
    const oscillator = this.activeOscillators[note];
    const gainData = this.activeGains[note];
    
    if (!oscillator || !gainData) {
        return; // Note not playing
    }
    
    try {
        const now = this.audioContext.currentTime;
        const gainNode = gainData.gainNode;
        const settings = this.instrumentSettings[gainData.instrument];
        
        if (immediate || !settings || settings.release === 0) {
            // Immediate stop
            gainNode.gain.cancelScheduledValues(now);
            gainNode.gain.setValueAtTime(gainNode.gain.value, now);
            gainNode.gain.linearRampToValueAtTime(0, now + 0.01);
            
            oscillator.stop(now + 0.01);
            
            // Clean up after stop
            setTimeout(() => {
                try {
                    gainNode.disconnect();
                    releaseNode(gainNode); // Return to pool
                    delete this.activeOscillators[note];
                    delete this.activeGains[note];
                } catch (e) {
                    console.warn(`Cleanup error for note ${note}:`, e);
                }
            }, 20);
        } else {
            // Apply release envelope
            gainNode.gain.cancelScheduledValues(now);
            gainNode.gain.setValueAtTime(gainNode.gain.value, now);
            gainNode.gain.linearRampToValueAtTime(0, now + settings.release);
            
            oscillator.stop(now + settings.release + 0.01);
            
            // Clean up after release
            setTimeout(() => {
                try {
                    gainNode.disconnect();
                    releaseNode(gainNode); // Return to pool
                    delete this.activeOscillators[note];
                    delete this.activeGains[note];
                } catch (e) {
                    console.warn(`Cleanup error for note ${note}:`, e);
                }
            }, (settings.release + 0.02) * 1000);
        }
        
        console.log(`🔇 Stopping note ${note}`);
    } catch (error) {
        console.error(`Error stopping note ${note}:`, error);
        // Force cleanup on error
        try {
            if (gainData && gainData.gainNode) {
                releaseNode(gainData.gainNode);
            }
            delete this.activeOscillators[note];
            delete this.activeGains[note];
        } catch (cleanupError) {
            console.error(`Cleanup error for note ${note}:`, cleanupError);
        }
    }
}

/**
 * Plays a note with a specific instrument (optimized version)
 * @param {string} note - Note name with octave (e.g., "A4")
 * @param {string} instrument - Instrument to use
 */
export function playNoteWithInstrument(note, instrument) {
    const previousInstrument = this.currentInstrument;
    this.currentInstrument = instrument;
    this.playNote(note);
    this.currentInstrument = previousInstrument;
}