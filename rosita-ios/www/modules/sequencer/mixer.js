// New module for mixer functionality
class SequencerMixer {
    constructor(sequencer) {
        this.sequencer = sequencer;
        this.mixerButton = null;
        this.instrumentLabels = ['Synth', 'Bass', 'Keys', 'Kick', 'Snare', 'Clap', 'Hi-hat'];
        this.drumLabels = ['Kick', 'Snare', 'Hat 1', 'Hat 2'];
        this._isChangingVolume = false;
        
        // Timeout tracking for cleanup
        this.activeTimeouts = [];
        this.maxTimeouts = 20; // Limit timeout accumulation
    }
    
    // Safe timeout management
    safeSetTimeout(callback, delay) {
        try {
            const timeoutId = setTimeout(() => {
                try {
                    callback();
                } catch (callbackError) {
                    console.warn('⚠️ Mixer timeout callback failed:', callbackError);
                } finally {
                    // Remove from tracking
                    this.activeTimeouts = this.activeTimeouts.filter(id => id !== timeoutId);
                }
            }, delay);
            
            // Track timeout
            this.activeTimeouts.push(timeoutId);
            
            // Cleanup old timeouts if we have too many
            if (this.activeTimeouts.length > this.maxTimeouts) {
                const oldTimeouts = this.activeTimeouts.splice(0, this.activeTimeouts.length - this.maxTimeouts);
                oldTimeouts.forEach(id => {
                    try {
                        clearTimeout(id);
                    } catch (clearError) {
                        console.warn('⚠️ Failed to clear old timeout:', clearError);
                    }
                });
            }
            
            return timeoutId;
        } catch (timeoutError) {
            console.warn('⚠️ Failed to create timeout:', timeoutError);
            return null;
        }
    }
    
    // Cleanup all timeouts
    clearAllTimeouts() {
        try {
            this.activeTimeouts.forEach(id => {
                try {
                    clearTimeout(id);
                } catch (clearError) {
                    console.warn('⚠️ Failed to clear timeout:', clearError);
                }
            });
            this.activeTimeouts = [];
            console.log('✅ Cleared all mixer timeouts');
        } catch (error) {
            console.warn('⚠️ Failed to clear all timeouts:', error);
        }
    }

    setupMixer() {
        // Get the mixer button
        this.mixerButton = document.getElementById('mixer-button');
        
        // Add event listener
        this.mixerButton.addEventListener('click', () => {
            this.sequencer.toggleMixerMode();
        });
    }
    
    createMixerGrid() {
        const sequencerGrid = document.getElementById('sequencer-grid');
        sequencerGrid.innerHTML = ''; // Clear any existing grid
        sequencerGrid.classList.add('mixer-grid');
        sequencerGrid.classList.add('mixer-grid-vertical');
        
        // Remove any existing event listeners to prevent duplicates
        sequencerGrid.removeEventListener('click', this.boundHandleMixerClick);
        
        // Create a document fragment to batch DOM operations
        const fragment = document.createDocumentFragment();
        
        // Add instrument labels
        const instruments = ['synth', 'bass', 'keys'];
        
        // First add all labels in a row at the top
        const labelRow = document.createElement('div');
        labelRow.className = 'mixer-label-row';
        
        // Add empty first cell for corner
        const cornerCell = document.createElement('div');
        cornerCell.className = 'mixer-corner-cell';
        labelRow.appendChild(cornerCell);
        
        // Add instrument and drum labels across the top
        [...instruments, ...this.drumLabels.slice(0, 4)].forEach((item, index) => {
            const labelCell = document.createElement('div');
            labelCell.className = 'mixer-label mixer-column-label';
            labelCell.textContent = index < 3 ? this.instrumentLabels[index] : item;
            labelCell.dataset.instrument = index < 3 ? instruments[index] : null;
            labelCell.dataset.drumType = index >= 3 ? item : null;
            labelRow.appendChild(labelCell);
        });
        
        fragment.appendChild(labelRow);
        
        // Create 8 volume level rows
        for (let step = 7; step >= 0; step--) {
            const row = document.createElement('div');
            row.className = 'mixer-step-row';
            
            // Add level label
            const levelLabel = document.createElement('div');
            levelLabel.className = 'mixer-level-label';
            levelLabel.textContent = `${Math.round((step + 1) / 8 * 100)}%`;
            row.appendChild(levelLabel);
            
            // Add volume cells for each instrument and drum
            [...instruments, ...this.drumLabels.slice(0, 4)].forEach((item, index) => {
                const cell = document.createElement('div');
                cell.className = 'grid-cell mixer-cell';
                cell.dataset.step = step;
                
                if (index < 3) {
                    // Instrument volume cells
                    cell.dataset.instrument = item;
                    cell.dataset.index = index * 8 + step;
                    
                    // Get current volume
                    const volume = this.sequencer.getInstrumentVolume(item);
                    
                    // Volume level is 0-7 (8 steps), with 7 being the loudest
                    const stepVolume = (step + 1) / 8;
                    
                    // Mark active if this step is less than or equal to the current volume level
                    if (stepVolume <= volume + 0.05) {
                        cell.classList.add('active');
                        cell.classList.add(item);
                    }
                } else {
                    // Drum volume cells
                    const drumType = this.drumLabels[index - 3];
                    cell.dataset.drumType = drumType;
                    cell.dataset.index = (index) * 8 + step;
                    
                    // Get current volume safely
                    let volume = 0;
                    try {
                        volume = this.sequencer.getDrumVolume(drumType) || 0.8;
                    } catch (e) {
                        console.warn(`Error getting volume for ${drumType}:`, e);
                        volume = 0.8; // Default fallback
                    }
                    
                    // Volume level is 0-7 (8 steps), with 7 being the loudest
                    const stepVolume = (step + 1) / 8;
                    
                    // Mark active if this step is less than or equal to the current volume level
                    if (stepVolume <= volume + 0.05) {
                        cell.classList.add('active');
                        cell.classList.add('drums');
                    }
                }
                
                row.appendChild(cell);
            });
            
            fragment.appendChild(row);
        }
        
        // Add click event listener for mixer cells using event delegation
        this.boundHandleMixerClick = this.handleMixerClick.bind(this);
        sequencerGrid.addEventListener('click', this.boundHandleMixerClick);
        
        // Append all cells at once
        sequencerGrid.appendChild(fragment);
    }
    
    handleMixerClick(e) {
        const cell = e.target.closest('.mixer-cell');
        if (!cell) return;
        
        const index = parseInt(cell.dataset.index);
        this.handleMixerStepClick(index);
    }

    handleMixerStepClick(index) {
        // Prevent multiple rapid clicks with debouncing
        if (this._isChangingVolume) return;
        this._isChangingVolume = true;
        
        // Calculate row and column from index
        const row = Math.floor(index / 8);
        const step = index % 8;
        
        // Calculate volume level from step (0-7)
        const volume = (step + 1) / 8;
        
        try {
            if (row < 3) {
                // First three rows are instruments
                const instruments = ['synth', 'bass', 'keys'];
                const instrument = instruments[row];
                
                // Set instrument volume
                this.sequencer.setInstrumentVolume(instrument, volume);
            } else if (row < 7) {
                // Next four rows are drums
                const drumIndex = row - 3;
                const drumType = this.drumLabels[drumIndex];
                
                // Set drum volume
                this.sequencer.setDrumVolume(drumType, volume);
            } else if (row < 7) {
                const drumIndex = row - 3;
                const drumType = this.drumLabels[drumIndex];
                
                try {
                    this.sequencer.synthEngine.playDrumSound(drumType);
                } catch (e) {
                    console.warn("Error playing sample drum:", e);
                }
            }
            
            // Refresh the mixer grid
            this.createMixerGrid();
            
            // Play a sample sound with the new volume - only if user has already interacted with the app
            if (this.sequencer.synthEngine.audioContext.state === 'running') {
                if (row < 3) {
                    const instruments = ['synth', 'bass', 'keys'];
                    const instrument = instruments[row];
                    const note = 'C4';
                    
                    try {
                        this.sequencer.synthEngine.playNoteWithInstrument(note, instrument);
                        this.safeSetTimeout(() => {
                            this.sequencer.synthEngine.stopNote(note);
                        }, 200);
                    } catch (e) {
                        console.warn("Error playing sample note:", e);
                    }
                } else if (row < 7) {
                    const drumIndex = row - 3;
                    const drumType = this.drumLabels[drumIndex];
                    
                    try {
                        this.sequencer.synthEngine.playDrumSound(drumType);
                    } catch (e) {
                        console.warn("Error playing sample drum:", e);
                    }
                }
            }
        } catch (error) {
            console.error("Error changing volume:", error);
        } finally {
            // Reset the volume change lock after a short delay
            setTimeout(() => {
                this._isChangingVolume = false;
            }, 300);
        }
    }
}

export default SequencerMixer;