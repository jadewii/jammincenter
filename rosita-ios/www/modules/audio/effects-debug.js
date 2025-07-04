/**
 * Debug version of Effects Module with extensive logging and fixes
 */

import { acquireGainNode, acquireFilterNode, releaseNode } from './node-pool.js';

export class EffectsProcessor {
    constructor(audioContext, outputNode) {
        console.log('🎛️ Creating EffectsProcessor (DEBUG VERSION)');
        this.audioContext = audioContext;
        this.outputNode = outputNode;
        
        // Effect chains
        this.effects = {
            reverb: null,
            delay: null,
            filter: null,
            distortion: null
        };
        
        // Effect parameters with WORKING defaults
        this.params = {
            reverb: {
                enabled: false,
                wetness: 0.5,  // More audible default
                roomSize: 0.7,
                decay: 2
            },
            delay: {
                enabled: false,
                time: 0.25,
                feedback: 0.5,  // More audible feedback
                wetness: 0.5    // More audible mix
            },
            filter: {
                enabled: false,
                type: 'lowpass',
                frequency: 2000,
                resonance: 5    // More resonance
            },
            distortion: {
                enabled: false,
                amount: 50      // More distortion
            }
        };
        
        // Main effect bus
        this.inputGain = acquireGainNode(this.audioContext);
        this.outputGain = acquireGainNode(this.audioContext);
        this.wetGain = acquireGainNode(this.audioContext);
        this.dryGain = acquireGainNode(this.audioContext);
        
        console.log('📊 Created main routing nodes');
        
        // Set up initial routing
        this.setupRouting();
        
        // Initialize effects
        this.initializeEffects();
        
        console.log('🎛️ EffectsProcessor initialized (DEBUG)');
    }
    
    setupRouting() {
        console.log('🔧 Setting up audio routing...');
        
        // Input splits to dry and wet paths
        this.inputGain.connect(this.dryGain);
        this.inputGain.connect(this.wetGain);
        console.log('✅ Input → Dry & Wet paths');
        
        // Both paths connect to output
        this.dryGain.connect(this.outputGain);
        // Wet will be connected through effects in updateRouting
        console.log('✅ Dry → Output');
        
        // Output connects to destination
        this.outputGain.connect(this.outputNode);
        console.log('✅ Output → Destination (compressor)');
        
        // Set initial mix - START WITH AUDIBLE VALUES
        this.dryGain.gain.value = 0.5;
        this.wetGain.gain.value = 0.5;
        console.log('📊 Initial mix: Dry=0.5, Wet=0.5');
    }
    
    initializeEffects() {
        console.log('🎨 Initializing all effects...');
        
        // Initialize reverb
        this.initializeReverb();
        
        // Initialize delay
        this.initializeDelay();
        
        // Initialize filter
        this.initializeFilter();
        
        // Initialize distortion
        this.initializeDistortion();
        
        console.log('✅ All effects initialized');
    }
    
    initializeDelay() {
        console.log('⏱️ Creating delay effect...');
        
        try {
            // Create delay nodes
            const delayNode = this.audioContext.createDelay(2); // 2 second max
            delayNode.delayTime.value = this.params.delay.time;
            console.log(`  Delay time: ${this.params.delay.time}s`);
            
            // Feedback loop
            const feedbackGain = acquireGainNode(this.audioContext);
            feedbackGain.gain.value = this.params.delay.feedback;
            console.log(`  Feedback: ${this.params.delay.feedback}`);
            
            // Wet/dry mix
            const delayInput = acquireGainNode(this.audioContext);
            const delayWet = acquireGainNode(this.audioContext);
            const delayDry = acquireGainNode(this.audioContext);
            const delayOutput = acquireGainNode(this.audioContext);
            
            // Set up delay routing with feedback
            delayInput.connect(delayDry);
            delayInput.connect(delayNode);
            delayNode.connect(feedbackGain);
            feedbackGain.connect(delayNode); // Feedback loop
            delayNode.connect(delayWet);
            delayDry.connect(delayOutput);
            delayWet.connect(delayOutput);
            
            // Set initial mix - make it audible!
            delayWet.gain.value = this.params.delay.wetness;
            delayDry.gain.value = 1 - this.params.delay.wetness;
            console.log(`  Mix: Wet=${this.params.delay.wetness}, Dry=${1 - this.params.delay.wetness}`);
            
            // Store delay effect
            this.effects.delay = {
                input: delayInput,
                output: delayOutput,
                delayNode: delayNode,
                feedbackGain: feedbackGain,
                wetGain: delayWet,
                dryGain: delayDry
            };
            
            console.log('✅ Delay effect created successfully');
        } catch (error) {
            console.error('❌ Error creating delay:', error);
        }
    }
    
    initializeReverb() {
        console.log('🌊 Creating reverb effect...');
        
        try {
            // Create convolver for reverb
            const convolver = this.audioContext.createConvolver();
            
            // Generate simple impulse response
            const length = this.audioContext.sampleRate * 2; // 2 seconds
            const impulse = this.audioContext.createBuffer(2, length, this.audioContext.sampleRate);
            
            for (let channel = 0; channel < 2; channel++) {
                const channelData = impulse.getChannelData(channel);
                for (let i = 0; i < length; i++) {
                    // Simple exponential decay
                    channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2) * 0.3;
                }
            }
            
            convolver.buffer = impulse;
            console.log('  Created impulse response buffer');
            
            // Wet/dry mix nodes
            const reverbInput = acquireGainNode(this.audioContext);
            const reverbWet = acquireGainNode(this.audioContext);
            const reverbDry = acquireGainNode(this.audioContext);
            const reverbOutput = acquireGainNode(this.audioContext);
            
            // Routing
            reverbInput.connect(reverbDry);
            reverbInput.connect(convolver);
            convolver.connect(reverbWet);
            reverbDry.connect(reverbOutput);
            reverbWet.connect(reverbOutput);
            
            // Set mix
            reverbWet.gain.value = this.params.reverb.wetness;
            reverbDry.gain.value = 1 - this.params.reverb.wetness;
            console.log(`  Mix: Wet=${this.params.reverb.wetness}, Dry=${1 - this.params.reverb.wetness}`);
            
            this.effects.reverb = {
                input: reverbInput,
                output: reverbOutput,
                convolver: convolver,
                wetGain: reverbWet,
                dryGain: reverbDry
            };
            
            console.log('✅ Reverb effect created successfully');
        } catch (error) {
            console.error('❌ Error creating reverb:', error);
        }
    }
    
    initializeFilter() {
        console.log('🎚️ Creating filter effect...');
        
        try {
            const filter = acquireFilterNode(this.audioContext);
            filter.type = this.params.filter.type;
            filter.frequency.value = this.params.filter.frequency;
            filter.Q.value = this.params.filter.resonance;
            console.log(`  Type: ${filter.type}, Freq: ${filter.frequency.value}Hz, Q: ${filter.Q.value}`);
            
            const filterInput = acquireGainNode(this.audioContext);
            const filterOutput = acquireGainNode(this.audioContext);
            
            filterInput.connect(filter);
            filter.connect(filterOutput);
            
            this.effects.filter = {
                input: filterInput,
                output: filterOutput,
                filter: filter
            };
            
            console.log('✅ Filter effect created successfully');
        } catch (error) {
            console.error('❌ Error creating filter:', error);
        }
    }
    
    initializeDistortion() {
        console.log('🎸 Creating distortion effect...');
        
        try {
            const waveshaper = this.audioContext.createWaveShaper();
            waveshaper.curve = this.createDistortionCurve(this.params.distortion.amount);
            waveshaper.oversample = '4x';
            console.log(`  Amount: ${this.params.distortion.amount}, Oversample: 4x`);
            
            const distortionInput = acquireGainNode(this.audioContext);
            const distortionOutput = acquireGainNode(this.audioContext);
            
            distortionInput.connect(waveshaper);
            waveshaper.connect(distortionOutput);
            
            this.effects.distortion = {
                input: distortionInput,
                output: distortionOutput,
                waveshaper: waveshaper
            };
            
            console.log('✅ Distortion effect created successfully');
        } catch (error) {
            console.error('❌ Error creating distortion:', error);
        }
    }
    
    createDistortionCurve(amount) {
        const samples = 44100;
        const curve = new Float32Array(samples);
        
        for (let i = 0; i < samples; i++) {
            const x = (i * 2) / samples - 1;
            curve[i] = ((3 + amount) * x * 20 * (Math.PI / 180)) / (Math.PI + amount * Math.abs(x));
        }
        
        return curve;
    }
    
    connect(sourceNode) {
        console.log('🔌 Connecting source to effects processor');
        sourceNode.connect(this.inputGain);
    }
    
    updateRouting() {
        console.log('🔄 Updating effect routing...');
        
        // Disconnect wet path from output first
        try {
            this.wetGain.disconnect();
        } catch (e) {
            console.log('  (Wet gain was not connected)');
        }
        
        // Build effect chain
        let currentNode = this.wetGain;
        const enabledEffects = [];
        
        // Check each effect in order
        ['filter', 'distortion', 'delay', 'reverb'].forEach(effectName => {
            if (this.params[effectName].enabled && this.effects[effectName]) {
                console.log(`  Connecting ${effectName}...`);
                currentNode.connect(this.effects[effectName].input);
                currentNode = this.effects[effectName].output;
                enabledEffects.push(effectName);
            }
        });
        
        // Connect final node to output
        currentNode.connect(this.outputGain);
        console.log(`  Final connection: ${enabledEffects.length > 0 ? 'Effects' : 'Wet'} → Output`);
        
        // Make sure wet/dry mix is audible
        const hasEffects = enabledEffects.length > 0;
        if (hasEffects) {
            // Keep current mix when effects are enabled
            console.log(`  Keeping mix: Dry=${this.dryGain.gain.value}, Wet=${this.wetGain.gain.value}`);
        } else {
            // All dry when no effects
            this.setWetDryMix(0);
        }
        
        console.log('✅ Routing complete. Active effects:', enabledEffects);
    }
    
    setWetDryMix(wetness) {
        const now = this.audioContext.currentTime;
        this.wetGain.gain.setTargetAtTime(wetness, now, 0.01);
        this.dryGain.gain.setTargetAtTime(1 - wetness, now, 0.01);
        console.log(`🎚️ Wet/Dry mix: ${wetness}/${1 - wetness}`);
    }
    
    setEffectEnabled(effectName, enabled) {
        console.log(`🎛️ setEffectEnabled('${effectName}', ${enabled})`);
        
        if (this.params[effectName] !== undefined) {
            this.params[effectName].enabled = enabled;
            this.updateRouting();
            console.log(`${enabled ? '✅' : '❌'} ${effectName} ${enabled ? 'enabled' : 'disabled'}`);
        } else {
            console.error(`❌ Unknown effect: ${effectName}`);
        }
    }
    
    setEffectParam(effectName, paramName, value) {
        console.log(`🎛️ setEffectParam('${effectName}', '${paramName}', ${value})`);
        
        if (!this.params[effectName] || this.params[effectName][paramName] === undefined) {
            console.warn(`❌ Invalid parameter: ${effectName}.${paramName}`);
            return;
        }
        
        this.params[effectName][paramName] = value;
        const now = this.audioContext.currentTime;
        
        // Apply parameter changes
        switch (effectName) {
            case 'reverb':
                if (paramName === 'wetness' && this.effects.reverb) {
                    this.effects.reverb.wetGain.gain.setTargetAtTime(value, now, 0.01);
                    this.effects.reverb.dryGain.gain.setTargetAtTime(1 - value, now, 0.01);
                    console.log(`  ✅ Set reverb wetness to ${value}`);
                }
                break;
                
            case 'delay':
                if (this.effects.delay) {
                    if (paramName === 'time') {
                        this.effects.delay.delayNode.delayTime.setTargetAtTime(value, now, 0.01);
                        console.log(`  ✅ Set delay time to ${value}s`);
                    } else if (paramName === 'feedback') {
                        this.effects.delay.feedbackGain.gain.setTargetAtTime(value, now, 0.01);
                        console.log(`  ✅ Set delay feedback to ${value}`);
                    } else if (paramName === 'wetness') {
                        this.effects.delay.wetGain.gain.setTargetAtTime(value, now, 0.01);
                        this.effects.delay.dryGain.gain.setTargetAtTime(1 - value, now, 0.01);
                        console.log(`  ✅ Set delay wetness to ${value}`);
                    }
                }
                break;
                
            case 'filter':
                if (this.effects.filter) {
                    if (paramName === 'frequency') {
                        this.effects.filter.filter.frequency.setTargetAtTime(value, now, 0.01);
                        console.log(`  ✅ Set filter frequency to ${value}Hz`);
                    } else if (paramName === 'resonance') {
                        this.effects.filter.filter.Q.setTargetAtTime(value, now, 0.01);
                        console.log(`  ✅ Set filter Q to ${value}`);
                    } else if (paramName === 'type') {
                        this.effects.filter.filter.type = value;
                        console.log(`  ✅ Set filter type to ${value}`);
                    }
                }
                break;
                
            case 'distortion':
                if (paramName === 'amount' && this.effects.distortion) {
                    this.effects.distortion.waveshaper.curve = this.createDistortionCurve(value);
                    console.log(`  ✅ Set distortion amount to ${value}`);
                }
                break;
        }
    }
    
    // Test method to verify audio flow
    testAudioFlow() {
        console.log('🧪 Testing audio flow through effects...');
        
        // Create a test oscillator
        const osc = this.audioContext.createOscillator();
        const testGain = this.audioContext.createGain();
        
        osc.frequency.value = 440;
        osc.type = 'sine';
        testGain.gain.value = 0.1;
        
        osc.connect(testGain);
        testGain.connect(this.inputGain);
        
        // Play for 0.5 seconds
        osc.start();
        osc.stop(this.audioContext.currentTime + 0.5);
        
        console.log('🔊 You should hear a 440Hz test tone through effects');
    }
}

export function createEffectsProcessor(audioContext, outputNode) {
    return new EffectsProcessor(audioContext, outputNode);
}