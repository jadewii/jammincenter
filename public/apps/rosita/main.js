// Main application entry point - Rosita Synthesizer
import SynthEngine from './modules/synth-engine/synth-engine.js';
import Sequencer from './modules/sequencer.js';
import InstrumentControls from './modules/ui/instrument-controls.js';
import ADSRControls from './modules/ui/adsr-controls.js';
import EffectsControls from './modules/ui/effects-controls.js';
import KeyboardManager from './modules/keyboard/keyboard-manager.js';

// Global application state
window.synthEngine = null;
window.sequencer = null;
window.instrumentControls = null;
window.adsrControls = null;
window.effectsControls = null;
window.keyboardManager = null;

// Initialize the application
async function initializeApp() {
    console.log('🎵 Initializing Rosita Synthesizer...');
    
    try {
        // Initialize the synth engine first
        console.log('🔧 Creating SynthEngine...');
        window.synthEngine = new SynthEngine();
        await window.synthEngine.initialize();
        
        // Initialize the sequencer
        console.log('🎵 Creating Sequencer...');
        window.sequencer = new Sequencer(window.synthEngine);
        window.sequencer.initialize();
        
        // Initialize instrument controls
        console.log('🎛️ Creating Instrument Controls...');
        window.instrumentControls = new InstrumentControls(window.synthEngine);
        window.instrumentControls.initialize();
        
        // Initialize ADSR controls
        console.log('📈 Creating ADSR Controls...');
        window.adsrControls = new ADSRControls(window.synthEngine);
        window.adsrControls.initialize();
        
        // Initialize effects controls
        console.log('✨ Creating Effects Controls...');
        window.effectsControls = new EffectsControls(window.synthEngine);
        window.effectsControls.initialize();
        
        // Initialize keyboard manager
        console.log('⌨️ Creating Keyboard Manager...');
        window.keyboardManager = new KeyboardManager(window.synthEngine);
        window.keyboardManager.initialize();
        
        console.log('✅ Rosita initialized successfully!');
        
    } catch (error) {
        console.error('❌ Failed to initialize Rosita:', error);
    }
}

// Start the application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}