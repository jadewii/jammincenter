/**
 * EMERGENCY FIX - Effects Controls with proper event handling
 */

export default class EffectsControls {
    constructor(synthEngine) {
        this.synthEngine = synthEngine;
        console.log('🎛️ EffectsControls EMERGENCY FIX - constructor called');
        console.log('🎛️ SynthEngine passed:', this.synthEngine);
    }
    
    initialize() {
        console.log('🎛️ EffectsControls.initialize() called');
        
        try {
            // Check if synthEngine has effects processor
            if (!this.synthEngine.effectsProcessor) {
                console.error('❌ No effectsProcessor found on synthEngine!');
                console.log('🔍 synthEngine contents:', Object.keys(this.synthEngine));
            } else {
                console.log('✅ effectsProcessor found:', this.synthEngine.effectsProcessor);
            }
            
            // Ensure DOM is ready
            if (document.readyState === 'loading') {
                console.log('⏳ DOM not ready, waiting...');
                document.addEventListener('DOMContentLoaded', () => {
                    this.setupEffectSliders();
                });
            } else {
                // DOM is already ready
                this.setupEffectSliders();
            }
            
            console.log('✅ Effects controls initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing effects controls:', error);
        }
    }
    
    setupEffectSliders() {
        console.log('🎚️ EMERGENCY FIX - Setting up effect sliders...');
        
        // Delay slider
        const delaySlider = document.getElementById('delay-slider');
        const delayValue = document.getElementById('delay-value');
        if (delaySlider && delayValue) {
            console.log('✅ Found delay slider and value display');
            
            // Set initial value display
            delayValue.textContent = parseFloat(delaySlider.value).toFixed(2);
            
            // Add input event listener
            delaySlider.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                console.log(`🎚️ DELAY SLIDER MOVED: ${value}`);
                
                // Update display immediately
                delayValue.textContent = value.toFixed(2);
                
                // Apply effect
                try {
                    if (value > 0) {
                        // Enable delay and set mix
                        this.synthEngine.setEffect('delay', true);
                        this.synthEngine.setEffectParam('delay', 'wetness', value);
                        console.log(`✅ Delay enabled with wetness: ${value}`);
                    } else {
                        // Disable delay
                        this.synthEngine.setEffect('delay', false);
                        console.log(`⏹️ Delay disabled`);
                    }
                } catch (error) {
                    console.error('❌ Error setting delay:', error);
                }
            });
            
            console.log('✅ Delay slider configured');
        } else {
            console.error('❌ Delay slider or value display not found!');
        }
        
        // Reverb slider
        const reverbSlider = document.getElementById('reverb-slider');
        const reverbValue = document.getElementById('reverb-value');
        if (reverbSlider && reverbValue) {
            console.log('✅ Found reverb slider and value display');
            
            // Set initial value display
            reverbValue.textContent = parseFloat(reverbSlider.value).toFixed(2);
            
            // Add input event listener
            reverbSlider.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                console.log(`🎚️ REVERB SLIDER MOVED: ${value}`);
                
                // Update display immediately
                reverbValue.textContent = value.toFixed(2);
                
                // Apply effect
                try {
                    if (value > 0) {
                        this.synthEngine.setEffect('reverb', true);
                        this.synthEngine.setEffectParam('reverb', 'wetness', value);
                        console.log(`✅ Reverb enabled with wetness: ${value}`);
                    } else {
                        this.synthEngine.setEffect('reverb', false);
                        console.log(`⏹️ Reverb disabled`);
                    }
                } catch (error) {
                    console.error('❌ Error setting reverb:', error);
                }
            });
            
            console.log('✅ Reverb slider configured');
        } else {
            console.error('❌ Reverb slider or value display not found!');
        }
        
        // Saturation slider (maps to distortion)
        const saturationSlider = document.getElementById('saturation-slider');
        const saturationValue = document.getElementById('saturation-value');
        if (saturationSlider && saturationValue) {
            console.log('✅ Found saturation slider and value display');
            
            // Set initial value display
            saturationValue.textContent = parseFloat(saturationSlider.value).toFixed(2);
            
            // Add input event listener
            saturationSlider.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                console.log(`🎚️ SATURATION SLIDER MOVED: ${value}`);
                
                // Update display immediately
                saturationValue.textContent = value.toFixed(2);
                
                // Apply effect
                try {
                    if (value > 0) {
                        this.synthEngine.setEffect('distortion', true);
                        // Scale saturation (0-2) to distortion amount (0-100)
                        this.synthEngine.setEffectParam('distortion', 'amount', value * 50);
                        console.log(`✅ Distortion enabled with amount: ${value * 50}`);
                    } else {
                        this.synthEngine.setEffect('distortion', false);
                        console.log(`⏹️ Distortion disabled`);
                    }
                } catch (error) {
                    console.error('❌ Error setting saturation/distortion:', error);
                }
            });
            
            console.log('✅ Saturation slider configured');
        } else {
            console.error('❌ Saturation slider or value display not found!');
        }
        
        // Chorus slider (maps to filter)
        const chorusSlider = document.getElementById('chorus-slider');
        const chorusValue = document.getElementById('chorus-value');
        if (chorusSlider && chorusValue) {
            console.log('✅ Found chorus slider and value display');
            
            // Set initial value display
            chorusValue.textContent = parseFloat(chorusSlider.value).toFixed(2);
            
            // Add input event listener
            chorusSlider.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                console.log(`🎚️ CHORUS SLIDER MOVED: ${value}`);
                
                // Update display immediately
                chorusValue.textContent = value.toFixed(2);
                
                // Apply effect
                try {
                    if (value > 0) {
                        this.synthEngine.setEffect('filter', true);
                        // Map 0-1 to frequency 200-8000Hz
                        const freq = 200 + (value * 7800);
                        this.synthEngine.setEffectParam('filter', 'frequency', freq);
                        this.synthEngine.setEffectParam('filter', 'resonance', 1 + (value * 10));
                        console.log(`✅ Filter enabled with frequency: ${freq}Hz`);
                    } else {
                        this.synthEngine.setEffect('filter', false);
                        console.log(`⏹️ Filter disabled`);
                    }
                } catch (error) {
                    console.error('❌ Error setting chorus/filter:', error);
                }
            });
            
            console.log('✅ Chorus slider configured');
        } else {
            console.error('❌ Chorus slider or value display not found!');
        }
        
        console.log('✅ All effect sliders setup complete');
        
        // Add UI test function
        window.testSliderUI = () => {
            console.log('🧪 TESTING SLIDER UI...');
            
            const tests = [
                { slider: delaySlider, value: 0.5, name: 'delay' },
                { slider: reverbSlider, value: 0.7, name: 'reverb' },
                { slider: saturationSlider, value: 1.0, name: 'saturation' },
                { slider: chorusSlider, value: 0.3, name: 'chorus' }
            ];
            
            tests.forEach(test => {
                if (test.slider) {
                    console.log(`📏 Setting ${test.name} slider to ${test.value}`);
                    test.slider.value = test.value;
                    test.slider.dispatchEvent(new Event('input', { bubbles: true }));
                }
            });
            
            console.log('✅ All sliders set - check value displays and play notes!');
        };
        
        console.log('💡 Use testSliderUI() to test all sliders');
    }
}