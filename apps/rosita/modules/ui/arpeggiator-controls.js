/**
 * Arpeggiator Controls module - Handles arpeggiator button controls
 */
class ArpeggiatorControls {
    constructor(synthEngine) {
        this.synthEngine = synthEngine;
        this.buttons = {
            synth: null,
            bass: null,
            keys: null
        };
    }

    initialize() {
        // Get arpeggiator button elements
        this.buttons.synth = document.getElementById('arp-synth');
        this.buttons.bass = document.getElementById('arp-bass');
        this.buttons.keys = document.getElementById('arp-keys');
        
        // Add event listeners
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Set up arpeggiator button event listeners
        Object.keys(this.buttons).forEach(instrument => {
            this.buttons[instrument].addEventListener('click', () => {
                const arp = this.synthEngine.arpeggiators[instrument];
                
                // Toggle between off, on, and looping modes
                if (!arp.enabled) {
                    // Turn on
                    this.synthEngine.toggleArpeggiator(instrument, true, false);
                    this.buttons[instrument].classList.add('active');
                    this.buttons[instrument].classList.remove('looping');
                    
                    // Update LED indicators
                    this.updateArpLeds(instrument, 1);
                } else if (arp.enabled && !arp.looping) {
                    // Turn on looping mode
                    this.synthEngine.toggleArpeggiator(instrument, true, true);
                    this.buttons[instrument].classList.add('active');
                    this.buttons[instrument].classList.add('looping');
                    
                    // Update LED indicators
                    this.updateArpLeds(instrument, 2);
                } else {
                    // Turn off
                    this.synthEngine.toggleArpeggiator(instrument, false, false);
                    this.buttons[instrument].classList.remove('active');
                    this.buttons[instrument].classList.remove('looping');
                    
                    // Update LED indicators
                    this.updateArpLeds(instrument, 0);
                }
            });
        });
    }
    
    updateArpLeds(instrument, state) {
        // Clear all LEDs for this instrument
        document.querySelectorAll(`.led[data-instrument="${instrument}"]`).forEach(led => {
            led.classList.remove('active');
        });
        
        // Set active LEDs based on state
        if (state >= 1) {
            document.querySelector(`.led[data-instrument="${instrument}"][data-led="1"]`).classList.add('active');
        }
        if (state >= 2) {
            document.querySelector(`.led[data-instrument="${instrument}"][data-led="2"]`).classList.add('active');
        }
        if (state >= 3) {
            document.querySelector(`.led[data-instrument="${instrument}"][data-led="3"]`).classList.add('active');
        }
    }
}

export default ArpeggiatorControls;