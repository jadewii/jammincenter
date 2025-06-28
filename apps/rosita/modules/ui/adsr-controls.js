/**
 * ADSR Controls module - Handles ADSR envelope controls
 */
class AdsrControls {
    constructor(synthEngine) {
        this.synthEngine = synthEngine;
        this.sliders = {
            attack: null,
            decay: null,
            sustain: null,
            release: null
        };
        this.valueDisplays = {
            attack: null,
            decay: null,
            sustain: null,
            release: null
        };
    }

    initialize() {
        // Get ADSR slider elements
        this.sliders.attack = document.getElementById('attack');
        this.sliders.decay = document.getElementById('decay');
        this.sliders.sustain = document.getElementById('sustain');
        this.sliders.release = document.getElementById('release');
        
        // Get value display elements
        this.valueDisplays.attack = document.getElementById('attack-value');
        this.valueDisplays.decay = document.getElementById('decay-value');
        this.valueDisplays.sustain = document.getElementById('sustain-value');
        this.valueDisplays.release = document.getElementById('release-value');
        
        // Add event listeners
        this.setupEventListeners();
        
        // Initialize values from current instrument
        this.updateValues();
        
        // Store a reference to this instance on the DOM element for external access
        const adsrControlsElement = document.querySelector('.adsr-controls');
        if (adsrControlsElement) {
            adsrControlsElement.__adsrControlsInstance = this;
        }
    }
    
    setupEventListeners() {
        this.sliders.attack.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            if (this.synthEngine.currentInstrument === 'drums') {
                // For drums track, control kick drum pitch
                this.synthEngine.instrumentSettings.drums.kickPitch = 0.5 + (value * 1.5); // Range 0.5 to 2.0
                this.valueDisplays.attack.textContent = `${Math.round(value * 100)}%`;
            } else {
                this.synthEngine.setEnvelopeParam('attack', value);
                this.valueDisplays.attack.textContent = value.toFixed(2);
            }
        });
        
        this.sliders.decay.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            if (this.synthEngine.currentInstrument === 'drums') {
                // For drums track, control snare drum pitch
                this.synthEngine.instrumentSettings.drums.snarePitch = 0.5 + (value * 1.5); // Range 0.5 to 2.0
                this.valueDisplays.decay.textContent = `${Math.round(value * 100)}%`;
            } else {
                this.synthEngine.setEnvelopeParam('decay', value);
                this.valueDisplays.decay.textContent = value.toFixed(2);
            }
        });
        
        this.sliders.sustain.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            if (this.synthEngine.currentInstrument === 'drums') {
                // For drums track, control Hat 1 pitch
                this.synthEngine.instrumentSettings.drums.hat1Pitch = 0.5 + (value * 1.5); // Range 0.5 to 2.0
                this.valueDisplays.sustain.textContent = `${Math.round(value * 100)}%`;
            } else {
                this.synthEngine.setEnvelopeParam('sustain', value);
                this.valueDisplays.sustain.textContent = value.toFixed(2);
            }
        });
        
        this.sliders.release.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            if (this.synthEngine.currentInstrument === 'drums') {
                // For drums track, control Hat 2 pitch
                this.synthEngine.instrumentSettings.drums.hat2Pitch = 0.5 + (value * 1.5); // Range 0.5 to 2.0
                this.valueDisplays.release.textContent = `${Math.round(value * 100)}%`;
            } else {
                this.synthEngine.setEnvelopeParam('release', value);
                this.valueDisplays.release.textContent = value.toFixed(2);
            }
        });
    }
    
    updateValues(settings) {
        // Use provided settings or get from current instrument
        const currentSettings = settings || this.synthEngine.instrumentSettings[this.synthEngine.currentInstrument];
        
        // Check if we're dealing with drums
        if (this.synthEngine.currentInstrument === 'drums') {
            // Update section title for drum pitch
            const sectionTitle = document.querySelector('.adsr-controls h3');
            if (sectionTitle) {
                sectionTitle.textContent = 'Drum Pitch';
            }
            
            // Update slider labels for drum pitch controls
            const attackLabel = document.querySelector('label[for="attack"]');
            const decayLabel = document.querySelector('label[for="decay"]');
            const sustainLabel = document.querySelector('label[for="sustain"]');
            const releaseLabel = document.querySelector('label[for="release"]');
            
            if (attackLabel) attackLabel.textContent = 'Kick:';
            if (decayLabel) decayLabel.textContent = 'Snare:';
            if (sustainLabel) sustainLabel.textContent = 'Hat 1:';
            if (releaseLabel) releaseLabel.textContent = 'Hat 2:';
            
            // Update slider values for drum pitch controls (0-1 range, 0% = low pitch, 100% = high pitch)
            this.sliders.attack.min = 0;
            this.sliders.attack.max = 1;
            this.sliders.attack.step = 0.01;
            this.sliders.attack.value = ((this.synthEngine.instrumentSettings.drums.kickPitch || 1.0) - 0.5) / 1.5; // Convert from 0.5-2.0 to 0-1
            
            this.sliders.decay.min = 0;
            this.sliders.decay.max = 1;
            this.sliders.decay.step = 0.01;
            this.sliders.decay.value = ((this.synthEngine.instrumentSettings.drums.snarePitch || 1.0) - 0.5) / 1.5;
            
            this.sliders.sustain.min = 0;
            this.sliders.sustain.max = 1;
            this.sliders.sustain.step = 0.01;
            this.sliders.sustain.value = ((this.synthEngine.instrumentSettings.drums.hat1Pitch || 1.0) - 0.5) / 1.5;
            
            this.sliders.release.min = 0;
            this.sliders.release.max = 1;
            this.sliders.release.step = 0.01;
            this.sliders.release.value = ((this.synthEngine.instrumentSettings.drums.hat2Pitch || 1.0) - 0.5) / 1.5;
            
            // Update display values
            this.valueDisplays.attack.textContent = `${Math.round(this.sliders.attack.value * 100)}%`;
            this.valueDisplays.decay.textContent = `${Math.round(this.sliders.decay.value * 100)}%`;
            this.valueDisplays.sustain.textContent = `${Math.round(this.sliders.sustain.value * 100)}%`;
            this.valueDisplays.release.textContent = `${Math.round(this.sliders.release.value * 100)}%`;
        } else {
            // Update section title for regular instruments
            const sectionTitle = document.querySelector('.adsr-controls h3');
            if (sectionTitle) {
                sectionTitle.textContent = 'ADSR Envelope';
            }
            
            // Reset labels for regular instruments
            const attackLabel = document.querySelector('label[for="attack"]');
            const decayLabel = document.querySelector('label[for="decay"]');
            const sustainLabel = document.querySelector('label[for="sustain"]');
            const releaseLabel = document.querySelector('label[for="release"]');
            
            if (attackLabel) attackLabel.textContent = 'A:';
            if (decayLabel) decayLabel.textContent = 'D:';
            if (sustainLabel) sustainLabel.textContent = 'S:';
            if (releaseLabel) releaseLabel.textContent = 'R:';
            
            // Update slider values for ADSR
            this.sliders.attack.value = currentSettings.attack;
            this.sliders.decay.value = currentSettings.decay;
            this.sliders.sustain.value = currentSettings.sustain;
            this.sliders.release.value = currentSettings.release;
            
            // Update display values
            this.valueDisplays.attack.textContent = currentSettings.attack.toFixed(2);
            this.valueDisplays.decay.textContent = currentSettings.decay.toFixed(2);
            this.valueDisplays.sustain.textContent = currentSettings.sustain.toFixed(2);
            this.valueDisplays.release.textContent = currentSettings.release.toFixed(2);
        }
    }
}

export default AdsrControls;