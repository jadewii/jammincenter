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
 * Plays a note with the current instrument
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
            delete this.activeGains[note];
        }
    }
    
    try {
        const frequency = this.noteToFrequency(note);
        const now = this.audioContext.currentTime;
        
        // Get current instrument settings
        const settings = this.instrumentSettings[this.currentInstrument];
        
        // Create oscillator
        const oscillator = this.audioContext.createOscillator();
        oscillator.type = settings.waveform;
        oscillator.frequency.setValueAtTime(frequency, now);
        
        // Create gain node for envelope
        const gainNode = this.audioContext.createGain();
        gainNode.gain.setValueAtTime(0, now);
        
        // Connect nodes
        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain);
        
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
    } catch (error) {
        console.error(`Error playing note ${note}:`, error);
    }
}

/**
 * Stops a playing note
 * @param {string} note - Note name with octave (e.g., "A4")
 * @param {boolean} immediate - Whether to stop immediately without release
 */
export function stopNote(note, immediate = false) {
    // Gracefully handle missing notes
    if (!this.activeOscillators[note] || !this.activeGains[note]) {
        // Just remove the entry from our tracking objects if it exists
        if (this.activeOscillators[note]) delete this.activeOscillators[note];
        if (this.activeGains[note]) delete this.activeGains[note];
        return;
    }
    
    try {
        const now = this.audioContext.currentTime;
        const gainData = this.activeGains[note];
        const gainNode = gainData.gainNode;
        const oscillator = this.activeOscillators[note];
        
        // Protect against invalid nodes
        if (!gainNode || !oscillator || !gainNode.gain) {
            throw new Error(`Invalid audio nodes for note ${note}`);
        }
        
        // Safely get instrument settings, defaulting to current instrument if none stored
        const instrumentName = gainData.instrument || this.currentInstrument;
        const settings = this.instrumentSettings[instrumentName] || this.instrumentSettings.synth;
        
        // Get current gain value, with fallback
        let currentGain = 0;
        try {
            currentGain = gainNode.gain.value || 0;
        } catch (e) {
            console.warn(`Could not access gain value for ${note}:`, e);
            currentGain = 0;
        }
        
        // Release stage - start from current value and ramp to 0
        try {
            gainNode.gain.cancelScheduledValues(now);
            gainNode.gain.setValueAtTime(currentGain, now);
            
            if (immediate) {
                // Immediate release for pattern changes
                gainNode.gain.linearRampToValueAtTime(0.001, now + 0.01);
                oscillator.stop(now + 0.02);
            } else {
                // Normal release
                const releaseTime = Math.max(0.01, settings.release || 0.1);
                gainNode.gain.linearRampToValueAtTime(0.001, now + releaseTime);
                oscillator.stop(now + releaseTime + 0.01);
            }
        } catch (e) {
            console.warn(`Error during note release for ${note}:`, e);
            // Force stop if ramping failed
            try {
                if (oscillator.stop) {
                    oscillator.stop(now + 0.01);
                }
            } catch (e2) {
                console.warn("Failed emergency stop:", e2);
            }
        }
        
        // Immediate cleanup for better performance
        const noteRef = note;
        const oscRef = oscillator;
        
        if (immediate) {
            delete this.activeOscillators[noteRef];
            delete this.activeGains[noteRef];
        } else {
            // Use shorter timeout for normal release
            const cleanupTime = Math.min((settings.release || 0.1) * 1000 + 50, 500);
            setTimeout(() => {
                try {
                    if (this.activeOscillators[noteRef] === oscRef) {
                        delete this.activeOscillators[noteRef];
                        delete this.activeGains[noteRef];
                    }
                } catch (e) {
                    console.warn(`Cleanup error for ${noteRef}:`, e);
                    // Force cleanup even if error occurs
                    if (this.activeOscillators[noteRef]) delete this.activeOscillators[noteRef];
                    if (this.activeGains[noteRef]) delete this.activeGains[noteRef];
                }
            }, cleanupTime);
        }
    } catch (error) {
        // In case of errors, ensure we clean up our state
        console.warn(`Error stopping note ${note}:`, error);
        if (this.activeOscillators[note]) delete this.activeOscillators[note];
        if (this.activeGains[note]) delete this.activeGains[note];
    }
}

/**
 * Plays a note with a specific instrument
 * @param {string} note - Note name with octave (e.g., "A4")
 * @param {string} instrument - The instrument to use
 */
export function playNoteWithInstrument(note, instrument) {
    // Save current instrument
    const originalInstrument = this.currentInstrument;
    
    // Validate instrument exists in settings
    if (!this.instrumentSettings[instrument]) {
        console.warn(`Invalid instrument: ${instrument}, using default`);
        instrument = 'synth';
    }
    
    // Temporarily change to specified instrument
    this.currentInstrument = instrument;
    
    try {
        // Special handling for drums
        if (instrument === 'drums') {
            // For drums, use the playDrumSound function
            this.playDrumSound(note);
        } else {
            // Play the note with the instrument's settings
            this.playNote(note);
        }
    } catch (error) {
        console.error(`Error playing note ${note} with instrument ${instrument}:`, error);
    } finally {
        // Always restore original instrument
        this.currentInstrument = originalInstrument;
    }
}