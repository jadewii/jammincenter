// New module for audio scheduling functionality
class AudioScheduler {
    constructor(sequencer) {
        this.sequencer = sequencer;
        this.scheduledNotes = [];
        // Adjust timing for mobile performance
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        this.mobileScheduleBuffer = this.isMobile ? 0.15 : 0.1; // Larger buffer on mobile
    }

    scheduleNote(note, instrument, startTime, duration) {
        try {
            const audioContext = this.sequencer.synthEngine.audioContext;
            const endTime = startTime + duration;
            const currentTime = audioContext.currentTime;
            
            // More lenient timing validation for mobile
            const timingTolerance = this.isMobile ? 0.2 : 0.1;
            if (startTime < currentTime - timingTolerance) {
                console.warn(`Scheduling note ${note} in the past, adjusting timing`);
                startTime = currentTime + 0.01; // Small delay to ensure proper scheduling
                endTime = startTime + duration;
            }
            
            // Calculate timing for scheduling with mobile-specific adjustments
            const timeToStart = Math.max(this.isMobile ? 10 : 0, (startTime - currentTime) * 1000);
            const timeToEnd = Math.max(timeToStart + (this.isMobile ? 150 : 100), (endTime - currentTime) * 1000);
            
            // Store timeout IDs for cleanup
            const startTimeout = setTimeout(() => {
                try {
                    // Additional mobile check before playing
                    if (this.sequencer.synthEngine.audioContext.state === 'running') {
                        this.sequencer.synthEngine.playNoteWithInstrument(note, instrument);
                    } else if (this.isMobile) {
                        // Try to resume and play on mobile
                        this.sequencer.synthEngine.resumeAudioContext();
                        setTimeout(() => {
                            if (this.sequencer.synthEngine.audioContext.state === 'running') {
                                this.sequencer.synthEngine.playNoteWithInstrument(note, instrument);
                            }
                        }, 50);
                    }
                } catch (error) {
                    console.warn(`Error playing note ${note}:`, error);
                }
            }, timeToStart);
            
            const endTimeout = setTimeout(() => {
                try {
                    if (this.sequencer.synthEngine.audioContext.state === 'running') {
                        this.sequencer.synthEngine.stopNote(note);
                    }
                } catch (error) {
                    console.warn(`Error stopping note ${note}:`, error);
                }
            }, timeToEnd);
            
            // Store timeouts for cleanup
            this.scheduledNotes.push(startTimeout, endTimeout);
        } catch (error) {
            console.warn(`Error scheduling note ${note}:`, error);
        }
    }
    
    scheduleDrumSound(drumSound, time) {
        try {
            // Skip playing if this drum is muted
            if (this.sequencer.isDrumMuted(drumSound)) {
                return;
            }
            
            const audioContext = this.sequencer.synthEngine.audioContext;
            const currentTime = audioContext.currentTime;
            
            // More lenient timing validation for mobile
            const timingTolerance = this.isMobile ? 0.2 : 0.1;
            if (time < currentTime - timingTolerance) {
                console.warn(`Scheduling drum ${drumSound} in the past, playing immediately`);
                time = currentTime + 0.01;
            }
            
            // Calculate timing for scheduling with mobile-specific adjustments
            const timeToPlay = Math.max(this.isMobile ? 5 : 0, (time - currentTime) * 1000);
            
            const timeout = setTimeout(() => {
                try {
                    if (this.sequencer.synthEngine.audioContext.state === 'running') {
                        this.sequencer.synthEngine.playDrumSound(drumSound);
                    } else if (this.isMobile) {
                        // Try to resume and play on mobile
                        this.sequencer.synthEngine.resumeAudioContext();
                        setTimeout(() => {
                            if (this.sequencer.synthEngine.audioContext.state === 'running') {
                                this.sequencer.synthEngine.playDrumSound(drumSound);
                            }
                        }, 30);
                    }
                } catch (error) {
                    console.warn(`Error playing drum sound ${drumSound}:`, error);
                }
            }, timeToPlay);
            
            // Store timeout for cleanup
            this.scheduledNotes.push(timeout);
        } catch (error) {
            console.warn(`Error scheduling drum sound ${drumSound}:`, error);
        }
    }
    
    playStepNotes(column, time) {
        // Ensure audio context is running with mobile-specific handling
        if (this.sequencer.synthEngine.audioContext.state !== 'running') {
            this.sequencer.synthEngine.resumeAudioContext();
            // On mobile, add a small delay to ensure context is ready
            if (this.isMobile) {
                time += 0.05;
            }
        }
        
        // Play notes for active cells in ALL instruments
        for (const instrument of Object.keys(this.sequencer.sequencerTracks)) {
            // Skip playing notes for muted tracks (now including drums)
            if (this.sequencer.isTrackMuted(instrument)) {
                continue;
            }
            
            // Determine max rows for each instrument separately
            const maxRows = instrument === 'drums' ? 12 : 12;
            
            for (let row = 0; row < maxRows; row++) { 
                const cellIndex = row * 8 + column;
                
                if (this.sequencer.sequencerTracks[instrument][cellIndex]) {
                    try {
                        if (instrument === 'drums') {
                            // For drums, play the corresponding drum sound
                            const drumSetOffset = this.sequencer.sequencerOctaveOffsets.drums || 0;
                            const adjustedRow = row;
                            if (adjustedRow >= 0 && adjustedRow < this.sequencer.grid.drumLabels.length) {
                                const drumSound = this.sequencer.grid.drumLabels[adjustedRow];
                                // Schedule drum sound ahead of time
                                this.scheduleDrumSound(drumSound, time);
                            }
                        } else {
                            // For melodic instruments, use scale-based note mapping like the keyboard
                            const noteIndex = 11 - row; // Invert row to get note index
                            const baseOctave = row < 6 ? 4 : 3;
                            const octaveOffset = this.sequencer.sequencerOctaveOffsets[instrument] || 0;
                            const octave = baseOctave + octaveOffset;
                            
                            // Get the current scale from keyboard
                            const currentScale = window.keyboard ? window.keyboard.currentScale : 'major';
                            
                            // Define scale patterns (same as in keyboard.js)
                            const scales = {
                                major: [0, 2, 4, 5, 7, 9, 11], // C, D, E, F, G, A, B
                                minor: [0, 2, 3, 5, 7, 8, 10]  // C, D, Eb, F, G, Ab, Bb
                            };
                            
                            const scaleSteps = scales[currentScale];
                            const scaleIndex = noteIndex % scaleSteps.length;
                            const scaleOctaveOffset = Math.floor(noteIndex / scaleSteps.length);
                            
                            const noteStep = scaleSteps[scaleIndex];
                            const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
                            const noteName = noteNames[noteStep];
                            const noteOctave = octave + scaleOctaveOffset;
                            
                            const note = `${noteName}${noteOctave}`;
                            
                            // Extended note duration helps smooth transitions between patterns
                            this.scheduleNote(note, instrument, time, 0.35); // Longer note duration for smoother transitions
                        }
                    } catch (error) {
                        console.error(`Error playing note at row ${row}, col ${column}, instrument ${instrument}:`, error);
                    }
                }
            }
        }
    }
    
    stopAllAudioSources() {
        try {
            // Clear all scheduled timeouts first
            this.scheduledNotes.forEach(timeout => {
                try {
                    clearTimeout(timeout);
                } catch (e) {
                    console.warn('Error clearing timeout:', e);
                }
            });
            this.scheduledNotes = [];
            
            // Create a copy of keys to avoid modification during iteration
            const activeNotes = [...Object.keys(this.sequencer.synthEngine.activeOscillators)];
            
            // Stop all playing notes
            activeNotes.forEach(note => {
                try {
                    this.sequencer.synthEngine.stopNote(note, true); // Force immediate stop
                } catch (error) {
                    console.warn(`Error stopping note ${note}:`, error);
                    // Force cleanup if error occurs
                    if (this.sequencer.synthEngine.activeOscillators[note]) {
                        delete this.sequencer.synthEngine.activeOscillators[note];
                    }
                    if (this.sequencer.synthEngine.activeGains[note]) {
                        delete this.sequencer.synthEngine.activeGains[note];
                    }
                }
            });
        } catch (error) {
            console.warn("Error stopping notes:", error);
        }
    }
    
    fadeOutActiveSources() {
        try {
            // Clear scheduled timeouts first
            this.scheduledNotes.forEach(timeout => {
                try {
                    clearTimeout(timeout);
                } catch (e) {
                    console.warn('Error clearing timeout:', e);
                }
            });
            this.scheduledNotes = [];
            
            const currentTime = this.sequencer.synthEngine.audioContext.currentTime;
            const fadeOutTime = 0.05; // Quick fade out (50ms)
            
            // Fade out gains instead of stopping abruptly
            Object.keys(this.sequencer.synthEngine.activeGains).forEach(note => {
                try {
                    const gainData = this.sequencer.synthEngine.activeGains[note];
                    if (gainData && gainData.gainNode && gainData.gainNode.gain) {
                        const gainNode = gainData.gainNode;
                        const currentGain = gainNode.gain.value || 0;
                        
                        // Rapid fade out to avoid clicks
                        gainNode.gain.cancelScheduledValues(currentTime);
                        gainNode.gain.setValueAtTime(currentGain, currentTime);
                        gainNode.gain.linearRampToValueAtTime(0.001, currentTime + fadeOutTime);
                        
                        // Clean up oscillator
                        const oscillator = this.sequencer.synthEngine.activeOscillators[note];
                        if (oscillator && oscillator.stop) {
                            oscillator.stop(currentTime + fadeOutTime + 0.01);
                        }
                        
                        // Immediate cleanup to prevent stuck notes
                        delete this.sequencer.synthEngine.activeOscillators[note];
                        delete this.sequencer.synthEngine.activeGains[note];
                    }
                } catch (e) {
                    console.warn(`Error fading out note ${note}:`, e);
                    // Force cleanup if fading fails
                    delete this.sequencer.synthEngine.activeOscillators[note];
                    delete this.sequencer.synthEngine.activeGains[note];
                }
            });
        } catch (error) {
            console.warn("Error in fade out:", error);
            // Fall back to immediate stop if fading fails
            this.stopAllAudioSources();
        }
    }
}

export default AudioScheduler;