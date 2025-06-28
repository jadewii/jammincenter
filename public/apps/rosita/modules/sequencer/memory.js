// New module for pattern memory management
class SequencerMemory {
    constructor(sequencer) {
        this.sequencer = sequencer;
        
        // Pattern memory storage with efficient structure
        this.patternMemory = new Array(8);
        for (let i = 0; i < 8; i++) {
            this.patternMemory[i] = {
                synth: null,
                bass: null,
                keys: null,
                drums: null,
                octaveOffsets: null,
                volumeLevels: {
                    synth: null,
                    bass: null,
                    keys: null,
                    drums: null
                }
            };
        }
        
        // Pattern change debounce flag
        this.isPatternChanging = false;
        
        // Add duplicate mode flag
        this.duplicateMode = false;
    }

    setupPatternButtons() {
        // Add event listeners for pattern memory buttons with debouncing
        const patternButtons = document.querySelectorAll('.pattern-button');
        patternButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                // Prevent multiple rapid clicks with stronger debounce protection
                if (this.isPatternChanging) return;
                this.isPatternChanging = true;
                
                const patternIndex = parseInt(button.dataset.pattern) - 1;
                
                // Check if we're in duplicate mode
                if (this.duplicateMode) {
                    // Duplicate current pattern to selected slot
                    this.duplicateToPattern(patternIndex);
                    
                    // Exit duplicate mode
                    this.duplicateMode = false;
                    const duplicateButton = document.getElementById('duplicate-pattern-button');
                    if (duplicateButton) {
                        duplicateButton.classList.remove('active');
                    }
                    
                    // Reset debounce flag
                    setTimeout(() => {
                        this.isPatternChanging = false;
                    }, 300);
                    
                    return;
                }
                
                // If shift key is pressed, save the pattern
                if (e.shiftKey) {
                    this.savePattern(patternIndex);
                    button.classList.add('saved');
                    
                    // Show save feedback
                    button.classList.add('active');
                    setTimeout(() => {
                        button.classList.remove('active');
                        this.isPatternChanging = false;
                    }, 200);
                } else {
                    try {
                        // Load pattern with error handling
                        this.loadPattern(patternIndex);
                        
                        // Update current pattern index
                        this.sequencer.currentPatternIndex = patternIndex;
                        
                        // Remove active class from all buttons
                        patternButtons.forEach(btn => btn.classList.remove('active'));
                        // Add active class to the clicked button
                        button.classList.add('active');
                    } catch (error) {
                        console.error("Error loading pattern:", error);
                    }
                    
                    // Reset debounce flag after a longer delay to prevent rapid switching
                    setTimeout(() => {
                        this.isPatternChanging = false;
                    }, 300);
                }
            });
        });
        
        // Add event listener for duplicate pattern button
        const duplicateButton = document.getElementById('duplicate-pattern-button');
        if (duplicateButton) {
            duplicateButton.addEventListener('click', () => {
                this.toggleDuplicateMode();
            });
        }
    }

    // New method to toggle duplicate mode
    toggleDuplicateMode() {
        this.duplicateMode = !this.duplicateMode;
        
        // Visual feedback for duplicate mode
        const duplicateButton = document.getElementById('duplicate-pattern-button');
        const patternButtons = document.querySelectorAll('.pattern-button');
        
        if (duplicateButton) {
            if (this.duplicateMode) {
                duplicateButton.classList.add('active');
                duplicateButton.title = "Select a pattern to duplicate to";
                
                // Add duplicate-target class to all pattern buttons except the active one
                patternButtons.forEach(btn => {
                    if (!btn.classList.contains('active')) {
                        btn.classList.add('duplicate-target');
                    }
                });
            } else {
                duplicateButton.classList.remove('active');
                duplicateButton.title = "Duplicate pattern to another slot";
                
                // Remove duplicate-target class from all pattern buttons
                patternButtons.forEach(btn => {
                    btn.classList.remove('duplicate-target');
                });
            }
        }
        
        console.log(`Duplicate mode ${this.duplicateMode ? 'activated' : 'deactivated'}`);
    }

    // New method to handle duplicating to a specific pattern
    duplicateToPattern(targetIndex) {
        // Get current pattern index
        const currentIndex = this.sequencer.currentPatternIndex;
        
        // Save current pattern to target slot
        this.patternMemory[targetIndex] = {
            synth: [...this.sequencer.sequencerTracks.synth],
            bass: [...this.sequencer.sequencerTracks.bass],
            keys: [...this.sequencer.sequencerTracks.keys],
            drums: [...this.sequencer.sequencerTracks.drums],
            octaveOffsets: { ...this.sequencer.sequencerOctaveOffsets },
            volumeLevels: {
                synth: this.sequencer.volumeLevels.synth,
                bass: this.sequencer.volumeLevels.bass,
                keys: this.sequencer.volumeLevels.keys,
                drums: { ...this.sequencer.volumeLevels.drums }
            }
        };
        
        // Update UI to show pattern was saved
        const patternButtons = document.querySelectorAll('.pattern-button');
        
        // Remove active class and duplicate-target class from all buttons
        patternButtons.forEach(btn => {
            btn.classList.remove('active');
            btn.classList.remove('duplicate-target'); // Remove duplicate-target class
        });
        
        // Get the target button and mark it as saved and active
        const targetButton = document.querySelector(`.pattern-button[data-pattern="${targetIndex + 1}"]`);
        if (targetButton) {
            targetButton.classList.add('saved');
            targetButton.classList.add('active');
        }
        
        // Update the current pattern index to the new pattern
        this.sequencer.currentPatternIndex = targetIndex;
        
        console.log(`Pattern ${currentIndex + 1} duplicated to slot ${targetIndex + 1} and selected`);
    }

    // Remove or update the old duplicatePattern method
    duplicatePattern() {
        // This method is now replaced by toggleDuplicateMode and duplicateToPattern
        this.toggleDuplicateMode();
    }

    savePattern(index) {
        // Deep clone all tracks
        this.patternMemory[index] = {
            synth: [...this.sequencer.sequencerTracks.synth],
            bass: [...this.sequencer.sequencerTracks.bass],
            keys: [...this.sequencer.sequencerTracks.keys],
            drums: [...this.sequencer.sequencerTracks.drums],
            octaveOffsets: { ...this.sequencer.sequencerOctaveOffsets },
            volumeLevels: {
                synth: this.sequencer.volumeLevels.synth,
                bass: this.sequencer.volumeLevels.bass,
                keys: this.sequencer.volumeLevels.keys,
                drums: { ...this.sequencer.volumeLevels.drums }
            }
        };
        
        // Provide visual feedback for the save
        console.log(`Pattern ${index + 1} saved`);
    }

    loadPattern(index) {
        const pattern = this.patternMemory[index];
        
        // Store current step to maintain position when switching patterns
        const currentPosition = this.sequencer.currentStep;
        
        // Check if sequencer is running
        const wasRunning = this.sequencer.sequencerRunning;
        
        try {
            // Don't stop the sequencer or pause playback - just load the new pattern immediately
            // This prevents the audio gap between patterns
            
            // If the pattern exists and has been saved before, load it
            if (pattern && pattern.synth) {
                // Load all tracks with proper deep cloning
                this.sequencer.sequencerTracks.synth = [...pattern.synth];
                this.sequencer.sequencerTracks.bass = [...pattern.bass];
                this.sequencer.sequencerTracks.keys = [...pattern.keys];
                this.sequencer.sequencerTracks.drums = [...pattern.drums];
                
                // Load octave offsets
                if (pattern.octaveOffsets) {
                    this.sequencer.sequencerOctaveOffsets = { ...pattern.octaveOffsets };
                } else {
                    // Default if not saved
                    this.sequencer.sequencerOctaveOffsets = { synth: 0, bass: 0, keys: 0, drums: 0 };
                }
                
                // Load volume levels if they exist
                if (pattern.volumeLevels) {
                    this.sequencer.volumeLevels.synth = pattern.volumeLevels.synth;
                    this.sequencer.volumeLevels.bass = pattern.volumeLevels.bass;
                    this.sequencer.volumeLevels.keys = pattern.volumeLevels.keys;
                    
                    // Only copy drum volume levels that exist in the pattern
                    if (pattern.volumeLevels.drums) {
                        for (const drumType in pattern.volumeLevels.drums) {
                            this.sequencer.volumeLevels.drums[drumType] = pattern.volumeLevels.drums[drumType];
                        }
                    }
                }
            } else {
                // If the pattern doesn't exist or hasn't been saved, initialize with empty tracks
                this.sequencer.sequencerTracks.synth = Array(96).fill(false);
                this.sequencer.sequencerTracks.bass = Array(96).fill(false);
                this.sequencer.sequencerTracks.keys = Array(96).fill(false);
                this.sequencer.sequencerTracks.drums = Array(96).fill(false);
                this.sequencer.sequencerOctaveOffsets = { synth: 0, bass: 0, keys: 0, drums: 0 };
            }
            
            // Update the grid display before resuming playback
            this.sequencer.grid.createGrid();
            
            // Restore step position instead of resetting
            this.sequencer.currentStep = currentPosition;
            
            console.log(`Pattern ${index + 1} loaded successfully`);
        } catch (error) {
            console.error(`Error in pattern load for ${index + 1}:`, error);
        } finally {
            // Release pattern change lock
            setTimeout(() => {
                this.isPatternChanging = false;
            }, 200);
        }
    }

    savePatternWithUI(index) {
        this.savePattern(index);
        
        // Update UI to show pattern is saved
        const button = document.querySelector(`.pattern-button[data-pattern="${index + 1}"]`);
        if (button) {
            button.classList.add('saved');
        }
    }
}

export default SequencerMemory;