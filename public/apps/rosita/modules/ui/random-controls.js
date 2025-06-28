/**
 * Random Controls module - Handles random button functionality
 */
class RandomControls {
    constructor(synthEngine) {
        this.synthEngine = synthEngine;
        this.buttons = {
            adsr: null,
            scale: null,
            octave: null
        };
        
        // Store separate patterns for major and minor scales for each instrument
        // Initialize as null instead of empty arrays to detect if patterns exist
        this.scalePatterns = {
            synth: {
                major: null,
                minor: null
            },
            bass: {
                major: null,
                minor: null
            },
            keys: {
                major: null,
                minor: null
            }
        };
    }

    initialize() {
        // Get random button elements
        this.buttons.adsr = document.getElementById('random-adsr-button');
        this.buttons.scale = document.getElementById('random-scale-button');
        this.buttons.octave = document.getElementById('random-octave-button');
        
        // Set initial scale button text based on current scale
        if (window.keyboard) {
            const currentScale = window.keyboard.currentScale || 'major';
            this.buttons.scale.textContent = currentScale.charAt(0).toUpperCase() + currentScale.slice(1);
        }
        
        // Add event listeners
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Random ADSR button
        this.buttons.adsr.addEventListener('click', () => {
            // Generate random values (max 0.5 as per requirement)
            const attack = Math.random() * 0.5;
            const decay = Math.random() * 0.5;
            const sustain = Math.random() * 0.5;
            const release = Math.random() * 0.5;
            
            // Update synth engine parameters
            this.synthEngine.setEnvelopeParam('attack', attack);
            this.synthEngine.setEnvelopeParam('decay', decay);
            this.synthEngine.setEnvelopeParam('sustain', sustain);
            this.synthEngine.setEnvelopeParam('release', release);
            
            // Get slider elements for updating
            const attackSlider = document.getElementById('attack');
            const decaySlider = document.getElementById('decay');
            const sustainSlider = document.getElementById('sustain');
            const releaseSlider = document.getElementById('release');
            
            // Get value display elements
            const attackValue = document.getElementById('attack-value');
            const decayValue = document.getElementById('decay-value');
            const sustainValue = document.getElementById('sustain-value');
            const releaseValue = document.getElementById('release-value');
            
            // Update sliders
            attackSlider.value = attack;
            decaySlider.value = decay;
            sustainSlider.value = sustain;
            releaseSlider.value = release;
            
            // Update display values
            attackValue.textContent = attack.toFixed(2);
            decayValue.textContent = decay.toFixed(2);
            sustainValue.textContent = sustain.toFixed(2);
            releaseValue.textContent = release.toFixed(2);
            
            // Visual feedback of change
            this.buttons.adsr.classList.add('active');
            setTimeout(() => {
                this.buttons.adsr.classList.remove('active');
            }, 200);
        });
        
        // Random scale button - updated to store and restore patterns for each scale
        this.buttons.scale.addEventListener('click', () => {
            if (!window.keyboard || !window.sequencer) return;
            
            // Get current scale and instrument
            const currentScale = window.keyboard.currentScale;
            const currentInstrument = window.sequencer.currentInstrument;
            
            // Don't do anything for drums
            if (currentInstrument === 'drums') return;
            
            // Save current pattern under current scale
            if (this.scalePatterns[currentInstrument]) {
                this.scalePatterns[currentInstrument][currentScale] = [...window.sequencer.sequencerTracks[currentInstrument]];
            }
            
            // Toggle between major and minor only
            const newScale = currentScale === 'major' ? 'minor' : 'major';
            
            // Update the keyboard's current scale
            window.keyboard.currentScale = newScale;
            
            // Update button text to show current scale
            this.buttons.scale.textContent = newScale.charAt(0).toUpperCase() + newScale.slice(1);
            
            // Check if we have a stored pattern for the new scale
            const hasStoredPattern = this.scalePatterns[currentInstrument] && 
                                   this.scalePatterns[currentInstrument][newScale] &&
                                   this.scalePatterns[currentInstrument][newScale].some(step => step === true);
            
            if (hasStoredPattern) {
                // Restore the pattern for the new scale
                window.sequencer.sequencerTracks[currentInstrument] = [...this.scalePatterns[currentInstrument][newScale]];
            } else {
                // Convert current pattern to the new scale
                if (window.sequencer.patterns) {
                    window.sequencer.patterns.convertCurrentInstrumentToScale(newScale);
                }
            }
            
            // Refresh the grid to show the restored/converted pattern
            window.sequencer.grid.createGrid();
            
            // Save pattern after scale change
            if (window.sequencer.memory) {
                window.sequencer.memory.savePatternWithUI(window.sequencer.currentPatternIndex);
            }
            
            // Visual feedback
            this.buttons.scale.classList.add('active');
            setTimeout(() => {
                this.buttons.scale.classList.remove('active');
            }, 200);
            
            console.log(`Changed scale to ${newScale} and ${hasStoredPattern ? 'restored previous' : 'converted current'} pattern`);
        });
        
        // Random octave button
        this.buttons.octave.addEventListener('click', () => {
            // Get current instrument
            const instrument = this.synthEngine.currentInstrument;
            
            // Don't randomize for drums
            if (instrument === 'drums') return;
            
            // Generate random octave offset between -2 and 2
            const randomOffset = Math.floor(Math.random() * 5) - 2; // -2 to 2
            
            // Apply to both keyboard and sequencer
            if (window.keyboard) {
                // Find which track corresponds to this instrument
                for (const [track, trackInstrument] of Object.entries(window.keyboard.trackInstruments)) {
                    if (trackInstrument === instrument) {
                        const oldOctave = window.keyboard.trackOctaves[track];
                        window.keyboard.trackOctaves[track] = Math.max(1, Math.min(7, 4 + randomOffset));
                        
                        // Update arpeggiator if active
                        if (this.synthEngine.arpeggiators[instrument] && 
                            this.synthEngine.arpeggiators[instrument].enabled) {
                            window.keyboard.updateArpeggiatorNotesOctave(
                                instrument, 
                                oldOctave, 
                                window.keyboard.trackOctaves[track]
                            );
                        }
                        break;
                    }
                }
            }
            
            // Update sequencer octave if available
            if (window.sequencer) {
                window.sequencer.sequencerOctaveOffsets[instrument] = randomOffset;
                
                // Save pattern after octave change
                if (window.sequencer.memory) {
                    window.sequencer.memory.savePatternWithUI(window.sequencer.currentPatternIndex);
                }
            }
            
            // Visual feedback
            this.buttons.octave.classList.add('active');
            setTimeout(() => {
                this.buttons.octave.classList.remove('active');
            }, 200);
            
            // Play a sample note with the new octave
            const note = `C${4 + randomOffset}`;
            this.synthEngine.playNoteWithInstrument(note, instrument);
            setTimeout(() => this.synthEngine.stopNote(note), 200);
        });
    }
}

export default RandomControls;