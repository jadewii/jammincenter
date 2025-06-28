/**
 * Toggles the arpeggiator for an instrument
 * @param {string} instrument - The instrument to toggle arpeggiator for
 * @param {boolean} enabled - Whether to enable the arpeggiator
 * @param {boolean} looping - Whether to enable looping mode
 */
export function toggleArpeggiator(instrument, enabled, looping = false) {
    const arp = this.arpeggiators[instrument];
    if (!arp) return;
    
    arp.enabled = enabled;
    arp.looping = looping;
    
    if (enabled) {
        // Start the arpeggiator
        this.startArpeggiator(instrument);
    } else {
        // Stop the arpeggiator
        this.stopArpeggiator(instrument);
    }
}

/**
 * Starts the arpeggiator for an instrument
 * @param {string} instrument - The instrument to start arpeggiator for
 */
export function startArpeggiator(instrument) {
    const arp = this.arpeggiators[instrument];
    if (!arp || arp.interval) return;
    
    // Clear any existing interval
    this.stopArpeggiator(instrument);
    
    // If there are no notes but we're in looping mode and have lastNotes, use those
    if (arp.notes.length === 0 && arp.looping && arp.lastNotes && arp.lastNotes.length > 0) {
        arp.notes = [...arp.lastNotes];
    }
    
    // Don't start if there are no notes and not in looping mode
    if (arp.notes.length === 0 && !arp.looping) return;
    
    // Set the arpeggiator speed based on tempo
    const arpSpeed = 60000 / (this.tempo || 120) / 4; // 16th notes
    
    arp.step = 0; // Reset step counter when starting
    
    // Crash-proof arpeggiator interval
    try {
        arp.interval = setInterval(() => {
            try {
                // Get notes to play - either current notes or lastNotes if in looping mode
                let notesToPlay = arp.notes && arp.notes.length > 0 ? arp.notes : [];
                
                // If no current notes but in looping mode, use lastNotes
                if (notesToPlay.length === 0 && arp.looping && arp.lastNotes && arp.lastNotes.length > 0) {
                    notesToPlay = [...arp.lastNotes]; // Make a copy to ensure we're using the full set
                }
                
                // If no notes and not looping, stop the arpeggiator
                if (notesToPlay.length === 0 && !arp.looping) {
                    this.stopArpeggiator(instrument);
                    return;
                }
                
                // Play the next note in the pattern if we have notes
                if (notesToPlay.length > 0) {
                    try {
                        // Get the pattern index safely
                        const patternLength = arp.pattern ? arp.pattern.length : 4;
                        const pattern = arp.pattern || [0, 1, 2, 3];
                        const patternIndex = pattern[arp.step % patternLength];
                        
                        // Get the note index, wrapped to stay within the available notes
                        const noteIndex = patternIndex % notesToPlay.length;
                        const note = notesToPlay[noteIndex];
                        
                        if (note && this.playNoteWithInstrument) {
                            // Safe note playing
                            try {
                                this.playNoteWithInstrument(note, instrument);
                                
                                // Safe note stopping with timeout tracking
                                const stopTimeout = setTimeout(() => {
                                    try {
                                        if (this.stopNote) {
                                            this.stopNote(note);
                                        }
                                    } catch (stopError) {
                                        console.warn(`⚠️ Arpeggiator note stop failed for ${note}:`, stopError);
                                    }
                                }, Math.max(50, arpSpeed * 0.8)); // Ensure minimum 50ms duration
                                
                                // Track timeout for cleanup
                                arp.activeTimeouts = arp.activeTimeouts || [];
                                arp.activeTimeouts.push(stopTimeout);
                                
                                // Cleanup old timeouts (keep only last 10)
                                if (arp.activeTimeouts.length > 10) {
                                    arp.activeTimeouts = arp.activeTimeouts.slice(-10);
                                }
                                
                            } catch (playError) {
                                console.warn(`⚠️ Arpeggiator note play failed for ${note}:`, playError);
                            }
                        }
                    } catch (noteSelectionError) {
                        console.warn(`⚠️ Arpeggiator note selection failed:`, noteSelectionError);
                    }
                }
                
                // Advance to the next step safely
                arp.step = ((arp.step || 0) + 1) % (arp.pattern ? arp.pattern.length : 4);
                
            } catch (intervalError) {
                console.warn(`⚠️ Arpeggiator interval error for ${instrument}:`, intervalError);
                // Stop arpeggiator on error to prevent repeated errors
                this.stopArpeggiator(instrument);
            }
        }, Math.max(50, arpSpeed)); // Ensure minimum 50ms interval
        
        console.log(`✅ Arpeggiator started for ${instrument} (${arpSpeed}ms intervals)`);
        
    } catch (intervalSetupError) {
        console.error(`❌ Failed to setup arpeggiator interval for ${instrument}:`, intervalSetupError);
    }
}

/**
 * Stops the arpeggiator for an instrument
 * @param {string} instrument - The instrument to stop arpeggiator for
 */
export function stopArpeggiator(instrument) {
    try {
        console.log(`🛑 Stopping arpeggiator for ${instrument}`);
        
        const arp = this.arpeggiators ? this.arpeggiators[instrument] : null;
        if (!arp) {
            console.warn(`⚠️ No arpeggiator found for ${instrument}`);
            return;
        }
        
        // Clear main interval
        if (arp.interval) {
            try {
                clearInterval(arp.interval);
                arp.interval = null;
                console.log(`✅ Cleared arpeggiator interval for ${instrument}`);
            } catch (intervalError) {
                console.warn(`⚠️ Failed to clear arpeggiator interval for ${instrument}:`, intervalError);
            }
        }
        
        // Clear any active note timeouts
        if (arp.activeTimeouts && arp.activeTimeouts.length > 0) {
            try {
                let clearedCount = 0;
                arp.activeTimeouts.forEach(timeout => {
                    try {
                        clearTimeout(timeout);
                        clearedCount++;
                    } catch (timeoutError) {
                        console.warn('⚠️ Failed to clear timeout:', timeoutError);
                    }
                });
                arp.activeTimeouts = [];
                console.log(`✅ Cleared ${clearedCount} arpeggiator timeouts for ${instrument}`);
            } catch (timeoutCleanupError) {
                console.warn(`⚠️ Failed to cleanup timeouts for ${instrument}:`, timeoutCleanupError);
            }
        }
        
        // Reset step
        arp.step = 0;
        
        console.log(`✅ Arpeggiator stopped for ${instrument}`);
        
    } catch (error) {
        console.error(`❌ stopArpeggiator failed for ${instrument}:`, error);
    }
}

/**
 * Adds a note to the arpeggiator
 * @param {string} note - The note to add
 * @param {string} instrument - The instrument to add the note to
 */
export function addNoteToArpeggiator(note, instrument) {
    const arp = this.arpeggiators[instrument];
    if (!arp || !arp.enabled) return;
    
    // Add the note if it doesn't already exist
    if (!arp.notes.includes(note)) {
        arp.notes.push(note);
        
        // Update lastNotes when adding a new note
        arp.lastNotes = [...arp.notes];
        
        // If this is the first note, start the arpeggiator
        if (arp.notes.length === 1 && arp.enabled) {
            this.startArpeggiator(instrument);
        }
    }
}

/**
 * Removes a note from the arpeggiator
 * @param {string} note - The note to remove
 * @param {string} instrument - The instrument to remove the note from
 */
export function removeNoteFromArpeggiator(note, instrument) {
    const arp = this.arpeggiators[instrument];
    if (!arp) return;
    
    const noteName = note.slice(0, -1); // Get note without octave
    
    // Do NOT update lastNotes here, so we preserve the full set of notes for looping
    
    // Remove the note - consider both current and previous octaves
    arp.notes = arp.notes.filter(n => {
        const currentNoteName = n.slice(0, -1);
        
        // If the note names match, it's the same note regardless of octave
        // This handles cases where octave changed while the key was pressed
        if (currentNoteName === noteName) {
            return false; // Remove this note
        }
        return true;
    });
    
    // If no notes left but in looping mode, keep the arpeggiator running with lastNotes
    if (arp.notes.length === 0) {
        if (arp.looping && arp.lastNotes && arp.lastNotes.length > 0) {
            // Keep the arpeggiator running
            if (!arp.interval) {
                this.startArpeggiator(instrument);
            }
        } else {
            // Stop if not in looping mode OR if looping but no lastNotes
            this.stopArpeggiator(instrument);
            
            // Ensure all active notes for this instrument are stopped
            Object.keys(this.activeOscillators).forEach(activeNote => {
                if (this.activeGains[activeNote] && this.activeGains[activeNote].instrument === instrument) {
                    this.stopNote(activeNote);
                }
            });
        }
    }
}
