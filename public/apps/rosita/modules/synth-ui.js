import AdsrControls from './ui/adsr-controls.js';
import InstrumentControls from './ui/instrument-controls.js';
import ArpeggiatorControls from './ui/arpeggiator-controls.js';
import RandomControls from './ui/random-controls.js';

/**
 * Synth UI Coordinator - Manages all UI components
 */
class SynthUI {
    constructor(synthEngine) {
        this.synthEngine = synthEngine;
        
        // Initialize UI modules
        this.adsrControls = new AdsrControls(synthEngine);
        this.instrumentControls = new InstrumentControls(synthEngine);
        this.arpeggiatorControls = new ArpeggiatorControls(synthEngine);
        this.randomControls = new RandomControls(synthEngine);
    }
    
    initUI() {
        // Initialize all UI modules
        this.adsrControls.initialize();
        this.instrumentControls.initialize();
        this.arpeggiatorControls.initialize();
        this.randomControls.initialize();
        
        // Add the instrument class initially for the default instrument
        document.querySelector('.adsr-controls').classList.add(`instrument-${this.synthEngine.currentInstrument}`);
    }
    
    // TOMBSTONE COMMENTS FOR REMOVED CODE
    
    // removed initUI() large method (moved to individual modules)
    // removed attackSlider, decaySlider, sustainSlider, releaseSlider (moved to AdsrControls)
    // removed instrumentButtons (moved to InstrumentControls)
    // removed arpButtons (moved to ArpeggiatorControls)
    // removed randomAdsrButton, randomScaleButton, randomOctaveButton (moved to RandomControls)
    // removed attackValue, decayValue, sustainValue, releaseValue (moved to AdsrControls)
    // removed updateArpLeds() method (moved to ArpeggiatorControls)
    // removed updateInstrumentButtonText() method (moved to InstrumentControls)
    // removed playSampleScale() method (moved to RandomControls)
}

export default SynthUI;