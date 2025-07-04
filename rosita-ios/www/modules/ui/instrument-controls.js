/**
 * Instrument Controls module - Handles instrument button controls
 */
class InstrumentControls {
    constructor(synthEngine) {
        this.synthEngine = synthEngine;
        this.buttons = {
            synth: null,
            bass: null,
            keys: null,
            drums: null
        };
    }

    initialize() {
        // Get instrument button elements
        this.buttons.synth = document.getElementById('instrument-synth');
        this.buttons.bass = document.getElementById('instrument-bass');
        this.buttons.keys = document.getElementById('instrument-keys');
        this.buttons.drums = document.getElementById('instrument-drums');
        
        // Add event listeners
        this.setupEventListeners();
        
        // Update initial button states
        this.updateButtonStates();
    }
    
    setupEventListeners() {
        // Set up instrument button event listeners
        Object.keys(this.buttons).forEach(instrument => {
            // Set initial button text to include waveform
            if (instrument === 'drums' && this.synthEngine.drumSampler) {
                this.updateButtonText(instrument, 'kit1');
            } else {
                const initialWaveform = this.synthEngine.instrumentSettings[instrument].waveform;
                this.updateButtonText(instrument, initialWaveform);
            }
            
            this.buttons[instrument].addEventListener('click', () => {
                // Check if this instrument is already selected
                const isAlreadySelected = this.synthEngine.currentInstrument === instrument;
                
                // Remove active class from all buttons first to ensure clean state
                Object.values(this.buttons).forEach(button => {
                    button.classList.remove('active');
                });
                
                // Add active class to clicked button
                this.buttons[instrument].classList.add('active');
                
                // If already selected, cycle through waveforms
                if (isAlreadySelected) {
                    this.cycleWaveform(instrument);
                } else {
                    // Just change instrument without cycling waveform
                    this.changeInstrument(instrument);
                }
            });
        });
    }
    
    cycleWaveform(instrument) {
        // Special handling for drums - cycle kits instead of waveforms
        if (instrument === 'drums' && this.synthEngine.drumSampler) {
            this.synthEngine.drumSampler.cycleKit().then(newKit => {
                // Update button text to show current kit
                this.updateButtonText(instrument, `kit${newKit}`);
                
                // Provide visual feedback
                this.buttons[instrument].classList.add('waveform-change');
                setTimeout(() => {
                    this.buttons[instrument].classList.remove('waveform-change');
                }, 300);
                
                // No sound playback for drum kit cycling
            });
            return;
        }
        
        const waveforms = ['square', 'sine', 'sawtooth', 'triangle'];
        const currentWaveform = this.synthEngine.instrumentSettings[instrument].waveform;
        const currentIndex = waveforms.indexOf(currentWaveform);
        const nextIndex = (currentIndex + 1) % waveforms.length;
        const nextWaveform = waveforms[nextIndex];
        
        // Update the instrument waveform
        this.synthEngine.instrumentSettings[instrument].waveform = nextWaveform;
        
        // Update button text to show current waveform
        this.updateButtonText(instrument, nextWaveform);
        
        // Provide visual feedback of the change
        this.buttons[instrument].classList.add('waveform-change');
        setTimeout(() => {
            this.buttons[instrument].classList.remove('waveform-change');
        }, 300);
        
        // Ensure audio context is running
        this.synthEngine.resumeAudioContext();
        
        // Play a quick preview note
        const note = 'C4';
        this.synthEngine.playNoteWithInstrument(note, instrument);
        setTimeout(() => this.synthEngine.stopNote(note), 200);
    }
    
    changeInstrument(instrument) {
        try {
            // Stop all arpeggiators and notes before changing instrument
            Object.keys(this.synthEngine.arpeggiators).forEach(arpInstrument => {
                try {
                    if (this.synthEngine.arpeggiators[arpInstrument].enabled) {
                        this.synthEngine.stopArpeggiator(arpInstrument);
                    }
                } catch (e) {
                    console.warn(`Error stopping arpeggiator for ${arpInstrument}:`, e);
                }
            });
            
            // Create a copy of keys to avoid modification during iteration
            const activeNotes = [...Object.keys(this.synthEngine.activeOscillators)];
            
            // Stop all active notes with proper error handling
            activeNotes.forEach(note => {
                try {
                    this.synthEngine.stopNote(note);
                } catch (e) {
                    console.warn(`Error stopping note ${note}:`, e);
                    // Force cleanup if error occurs
                    if (this.synthEngine.activeOscillators[note]) delete this.synthEngine.activeOscillators[note];
                    if (this.synthEngine.activeGains[note]) delete this.synthEngine.activeGains[note];
                }
            });
            
            // Get and apply the instrument preset
            const preset = this.synthEngine.setInstrument(instrument);
            
            // Update sequencer to show the pattern for this instrument
            if (window.sequencer) {
                window.sequencer.setCurrentInstrument(instrument);
                
                // Update mute button state when changing instruments
                if (window.sequencer.ui && typeof window.sequencer.ui.updateMuteButtonState === 'function') {
                    window.sequencer.ui.updateMuteButtonState();
                }
                
                // No need to force colors - CSS handles drum colors by row
            }
            
            // Remove all instrument classes from ADSR controls
            const adsrControls = document.querySelector('.adsr-controls');
            adsrControls.className = 'adsr-controls';
            // Add the new instrument class
            adsrControls.classList.add(`instrument-${instrument}`);
            
            // Update ADSR controls with instrument-specific UI
            const adsrControlsInstance = document.querySelector('.adsr-controls').__adsrControlsInstance;
            if (adsrControlsInstance && typeof adsrControlsInstance.updateValues === 'function') {
                adsrControlsInstance.updateValues(preset);
            }
            
            // Return the preset for ADSR controls to update
            return preset;
        } catch (error) {
            console.error("Error during instrument switch:", error);
            return null;
        }
    }
    
    updateButtonText(instrument, waveform) {
        console.log('updateButtonText called:', instrument, waveform);
        // Special handling for drums
        if (instrument === 'drums' && waveform && waveform.startsWith('kit')) {
            // Extract kit number from 'kit1', 'kit2', etc.
            const kitNum = waveform.replace('kit', '');
            console.log('Setting drums button to Kit', kitNum);
            this.buttons[instrument].textContent = `Kit ${kitNum}`;
            this.buttons[instrument].setAttribute('title', `Drum Kit ${kitNum}`);
            return;
        }
        
        // Determine the display name for the instrument
        let displayNum;
        switch(instrument) {
            case 'synth': displayNum = '1'; break;
            case 'bass': displayNum = '2'; break;
            case 'keys': displayNum = '3'; break;
            case 'drums': displayNum = '4'; break;
            default: displayNum = '';
        }
        
        // Remove all waveform classes from the button
        this.buttons[instrument].classList.remove('square', 'sine', 'sawtooth', 'triangle');
        
        // Add the current waveform class (except for square which is the default)
        if (waveform !== 'square') {
            this.buttons[instrument].classList.add(waveform);
        }
        
        // Keep the number visible but add waveform as title
        this.buttons[instrument].setAttribute('title', `${instrument} - ${waveform}`);
    }

    updateButtonStates() {
        // Set active class for current instrument
        const currentInstrument = this.synthEngine.currentInstrument;
        if (this.buttons[currentInstrument]) {
            this.buttons[currentInstrument].classList.add('active');
        }
    }
}

export default InstrumentControls;