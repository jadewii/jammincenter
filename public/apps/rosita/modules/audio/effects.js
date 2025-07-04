/**
 * Effects Module - Provides reverb, delay, filter, and other audio effects
 * Optimized for real-time performance with minimal CPU usage
 * 
 * @module Effects
 */

import { acquireGainNode, acquireFilterNode, releaseNode } from './node-pool.js';

export class EffectsProcessor {
    constructor(audioContext, outputNode) {
        this.audioContext = audioContext;
        this.outputNode = outputNode;
        
        // Effect chains
        this.effects = {
            reverb: null,
            delay: null,
            filter: null,
            distortion: null
        };
        
        // Effect parameters
        this.params = {
            reverb: {
                enabled: false,
                wetness: 0.3,
                roomSize: 0.7,
                decay: 2
            },
            delay: {
                enabled: false,
                time: 0.25, // seconds
                feedback: 0.3,
                wetness: 0.3
            },
            filter: {
                enabled: false,
                type: 'lowpass',
                frequency: 2000,
                resonance: 1
            },
            distortion: {
                enabled: false,
                amount: 20
            }
        };
        
        // Main effect bus
        this.inputGain = acquireGainNode(this.audioContext);
        this.outputGain = acquireGainNode(this.audioContext);
        this.wetGain = acquireGainNode(this.audioContext);
        this.dryGain = acquireGainNode(this.audioContext);
        
        // Set up initial routing
        this.setupRouting();
        
        // Initialize effects
        this.initializeEffects();
        
        console.log('🎛️ EffectsProcessor initialized');
    }
    
    /**
     * Set up the initial audio routing
     */
    setupRouting() {
        // Input splits to dry and wet paths
        this.inputGain.connect(this.dryGain);
        this.inputGain.connect(this.wetGain);
        
        // Both paths connect to output
        this.dryGain.connect(this.outputGain);
        this.wetGain.connect(this.outputGain);
        
        // Output connects to destination
        this.outputGain.connect(this.outputNode);
        
        // Set initial mix
        this.dryGain.gain.value = 1.0;
        this.wetGain.gain.value = 0.0;
    }
    
    /**
     * Initialize all effects
     */
    initializeEffects() {
        try {
            // Initialize reverb
            this.initializeReverb();
            
            // Initialize delay
            this.initializeDelay();
            
            // Initialize filter
            this.initializeFilter();
            
            // Initialize distortion
            this.initializeDistortion();
            
            console.log('✅ All effects initialized');
        } catch (error) {
            console.error('❌ Error initializing effects:', error);
        }
    }
    
    /**
     * Initialize reverb effect using convolution
     */
    initializeReverb() {
        try {
            console.log('🌊 Initializing reverb...');
            
            // Create convolver node
            const convolver = this.audioContext.createConvolver();
            
            // Generate impulse response
            const impulseBuffer = this.createReverbImpulse(
                this.params.reverb.roomSize,
                this.params.reverb.decay
            );
            convolver.buffer = impulseBuffer;
            
            // Create wet/dry mix for reverb
            const reverbInput = acquireGainNode(this.audioContext);
            const reverbWet = acquireGainNode(this.audioContext);
            const reverbDry = acquireGainNode(this.audioContext);
            const reverbOutput = acquireGainNode(this.audioContext);
            
            // Set up reverb routing
            reverbInput.connect(reverbDry);
            reverbInput.connect(convolver);
            convolver.connect(reverbWet);
            reverbDry.connect(reverbOutput);
            reverbWet.connect(reverbOutput);
            
            // Set initial mix
            reverbWet.gain.value = this.params.reverb.wetness;
            reverbDry.gain.value = 1 - this.params.reverb.wetness;
            
            // Store reverb effect
            this.effects.reverb = {
                input: reverbInput,
                output: reverbOutput,
                convolver: convolver,
                wetGain: reverbWet,
                dryGain: reverbDry
            };
            
            console.log('✅ Reverb initialized');
        } catch (error) {
            console.error('❌ Error initializing reverb:', error);
        }
    }
    
    /**
     * Create reverb impulse response buffer
     */
    createReverbImpulse(roomSize, decay) {
        const length = this.audioContext.sampleRate * decay;
        const impulse = this.audioContext.createBuffer(2, length, this.audioContext.sampleRate);
        
        for (let channel = 0; channel < 2; channel++) {
            const channelData = impulse.getChannelData(channel);
            
            for (let i = 0; i < length; i++) {
                // Exponential decay
                const n = length - i;
                const decay = Math.pow(1 - (i / length), 2);
                
                // Add early reflections
                if (i < length * 0.1) {
                    channelData[i] = (Math.random() * 2 - 1) * decay * 0.5;
                } else {
                    // Diffuse late reflections
                    channelData[i] = (Math.random() * 2 - 1) * decay * roomSize * 0.3;
                }
            }
        }
        
        return impulse;
    }
    
    /**
     * Initialize delay effect
     */
    initializeDelay() {
        try {
            console.log('⏱️ Initializing delay...');
            
            // Create delay nodes
            const delayNode = this.audioContext.createDelay(5); // Max 5 seconds
            delayNode.delayTime.value = this.params.delay.time;
            
            // Feedback loop
            const feedbackGain = acquireGainNode(this.audioContext);
            feedbackGain.gain.value = this.params.delay.feedback;
            
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
            
            // Set initial mix
            delayWet.gain.value = this.params.delay.wetness;
            delayDry.gain.value = 1 - this.params.delay.wetness;
            
            // Store delay effect
            this.effects.delay = {
                input: delayInput,
                output: delayOutput,
                delayNode: delayNode,
                feedbackGain: feedbackGain,
                wetGain: delayWet,
                dryGain: delayDry
            };
            
            console.log('✅ Delay initialized');
        } catch (error) {
            console.error('❌ Error initializing delay:', error);
        }
    }
    
    /**
     * Initialize filter effect
     */
    initializeFilter() {
        try {
            console.log('🎚️ Initializing filter...');
            
            const filter = acquireFilterNode(this.audioContext);
            filter.type = this.params.filter.type;
            filter.frequency.value = this.params.filter.frequency;
            filter.Q.value = this.params.filter.resonance;
            
            const filterInput = acquireGainNode(this.audioContext);
            const filterOutput = acquireGainNode(this.audioContext);
            
            filterInput.connect(filter);
            filter.connect(filterOutput);
            
            this.effects.filter = {
                input: filterInput,
                output: filterOutput,
                filter: filter
            };
            
            console.log('✅ Filter initialized');
        } catch (error) {
            console.error('❌ Error initializing filter:', error);
        }
    }
    
    /**
     * Initialize distortion effect using waveshaping
     */
    initializeDistortion() {
        try {
            console.log('🎸 Initializing distortion...');
            
            const waveshaper = this.audioContext.createWaveShaper();
            waveshaper.curve = this.createDistortionCurve(this.params.distortion.amount);
            waveshaper.oversample = '2x'; // Better quality, slightly more CPU
            
            const distortionInput = acquireGainNode(this.audioContext);
            const distortionOutput = acquireGainNode(this.audioContext);
            
            distortionInput.connect(waveshaper);
            waveshaper.connect(distortionOutput);
            
            this.effects.distortion = {
                input: distortionInput,
                output: distortionOutput,
                waveshaper: waveshaper
            };
            
            console.log('✅ Distortion initialized');
        } catch (error) {
            console.error('❌ Error initializing distortion:', error);
        }
    }
    
    /**
     * Create distortion curve for waveshaper
     */
    createDistortionCurve(amount) {
        const samples = 44100;
        const curve = new Float32Array(samples);
        const deg = Math.PI / 180;
        
        for (let i = 0; i < samples; i++) {
            const x = (i * 2) / samples - 1;
            curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
        }
        
        return curve;
    }
    
    /**
     * Connect input to effects chain
     */
    connect(sourceNode) {
        sourceNode.connect(this.inputGain);
    }
    
    /**
     * Disconnect from effects chain
     */
    disconnect() {
        try {
            this.inputGain.disconnect();
        } catch (e) {
            // Already disconnected
        }
    }
    
    /**
     * Update effect chain routing based on enabled effects
     */
    updateRouting() {
        console.log('🔄 Updating effect routing...');
        
        // Disconnect wet path
        try {
            this.wetGain.disconnect();
        } catch (e) {}
        
        // Build effect chain
        let currentNode = this.wetGain;
        const enabledEffects = [];
        
        // Check each effect in order
        ['filter', 'distortion', 'delay', 'reverb'].forEach(effectName => {
            if (this.params[effectName].enabled && this.effects[effectName]) {
                currentNode.connect(this.effects[effectName].input);
                currentNode = this.effects[effectName].output;
                enabledEffects.push(effectName);
            }
        });
        
        // Connect final node to output
        currentNode.connect(this.outputGain);
        
        // Update wet/dry mix based on whether any effects are enabled
        const hasEffects = enabledEffects.length > 0;
        this.setWetDryMix(hasEffects ? 0.5 : 0);
        
        console.log('✅ Routing updated. Active effects:', enabledEffects);
    }
    
    /**
     * Set wet/dry mix
     */
    setWetDryMix(wetness) {
        const now = this.audioContext.currentTime;
        this.wetGain.gain.setTargetAtTime(wetness, now, 0.01);
        this.dryGain.gain.setTargetAtTime(1 - wetness, now, 0.01);
    }
    
    /**
     * Enable/disable an effect
     */
    setEffectEnabled(effectName, enabled) {
        if (this.params[effectName] !== undefined) {
            this.params[effectName].enabled = enabled;
            this.updateRouting();
            console.log(`${enabled ? '✅' : '❌'} ${effectName} ${enabled ? 'enabled' : 'disabled'}`);
        }
    }
    
    /**
     * Update effect parameters
     */
    setEffectParam(effectName, paramName, value) {
        if (!this.params[effectName] || this.params[effectName][paramName] === undefined) {
            console.warn(`Invalid effect parameter: ${effectName}.${paramName}`);
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
                }
                break;
                
            case 'delay':
                if (this.effects.delay) {
                    if (paramName === 'time') {
                        this.effects.delay.delayNode.delayTime.setTargetAtTime(value, now, 0.01);
                    } else if (paramName === 'feedback') {
                        this.effects.delay.feedbackGain.gain.setTargetAtTime(value, now, 0.01);
                    } else if (paramName === 'wetness') {
                        this.effects.delay.wetGain.gain.setTargetAtTime(value, now, 0.01);
                        this.effects.delay.dryGain.gain.setTargetAtTime(1 - value, now, 0.01);
                    }
                }
                break;
                
            case 'filter':
                if (this.effects.filter) {
                    if (paramName === 'frequency') {
                        this.effects.filter.filter.frequency.setTargetAtTime(value, now, 0.01);
                    } else if (paramName === 'resonance') {
                        this.effects.filter.filter.Q.setTargetAtTime(value, now, 0.01);
                    } else if (paramName === 'type') {
                        this.effects.filter.filter.type = value;
                    }
                }
                break;
                
            case 'distortion':
                if (paramName === 'amount' && this.effects.distortion) {
                    this.effects.distortion.waveshaper.curve = this.createDistortionCurve(value);
                }
                break;
        }
        
        console.log(`📊 ${effectName}.${paramName} = ${value}`);
    }
    
    /**
     * Get current effect parameters
     */
    getEffectParams(effectName) {
        return this.params[effectName] || null;
    }
    
    /**
     * Cleanup and release resources
     */
    cleanup() {
        console.log('🧹 Cleaning up effects processor...');
        
        // Disconnect all nodes
        this.disconnect();
        this.outputGain.disconnect();
        
        // Release pooled nodes
        releaseNode(this.inputGain);
        releaseNode(this.outputGain);
        releaseNode(this.wetGain);
        releaseNode(this.dryGain);
        
        // Release effect nodes
        Object.values(this.effects).forEach(effect => {
            if (effect) {
                if (effect.input) releaseNode(effect.input);
                if (effect.output) releaseNode(effect.output);
                if (effect.wetGain) releaseNode(effect.wetGain);
                if (effect.dryGain) releaseNode(effect.dryGain);
                if (effect.feedbackGain) releaseNode(effect.feedbackGain);
            }
        });
        
        console.log('✅ Effects processor cleaned up');
    }
}

/**
 * Factory function to create effects processor
 */
export function createEffectsProcessor(audioContext, outputNode) {
    return new EffectsProcessor(audioContext, outputNode);
}