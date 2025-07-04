/**
 * WORKING Effects Module - EMERGENCY FIX VERSION
 * Complete audio effects implementation with proper routing and testing
 */

export class EffectsProcessor {
    constructor(audioContext, outputNode) {
        console.log('🎛️ EffectsProcessor: EMERGENCY FIX - Starting initialization...');
        this.audioContext = audioContext;
        this.outputNode = outputNode;
        
        // Ensure audio context is running
        if (this.audioContext.state === 'suspended') {
            console.log('⚠️ AudioContext suspended, resuming...');
            this.audioContext.resume().then(() => {
                console.log('✅ AudioContext resumed');
            });
        }
        
        // Create main routing nodes
        this.inputGain = this.audioContext.createGain();
        this.outputGain = this.audioContext.createGain();
        this.dryGain = this.audioContext.createGain();
        this.wetGain = this.audioContext.createGain();
        
        // CRITICAL: Set gains to audible values
        this.inputGain.gain.value = 1.0;
        this.outputGain.gain.value = 1.0;
        this.dryGain.gain.value = 0.7;  // 70% dry signal
        this.wetGain.gain.value = 0.0;   // Start with no effects
        
        console.log('📊 Initial gains - Input: 1.0, Output: 1.0, Dry: 0.7, Wet: 0.0');
        
        // Effect nodes storage
        this.effects = {
            delay: null,
            filter: null,
            saturation: null,
            reverb: null
        };
        
        // Effect parameters
        this.effectParams = {
            delay: { time: 0.5, feedback: 0.3, mix: 0 },
            filter: { frequency: 2000, resonance: 1, mix: 0 },
            saturation: { amount: 0, mix: 0 },
            reverb: { roomSize: 0.7, decay: 2, mix: 0 }
        };
        
        // Initialize routing and effects
        this.setupInitialRouting();
        this.createAllEffects();
        this.setupEffectsChain();
        
        // Add global test functions
        this.addGlobalTestFunctions();
        
        console.log('✅ EffectsProcessor EMERGENCY FIX ready!');
    }
    
    setupInitialRouting() {
        console.log('🔧 Setting up audio routing...');
        
        // Input splits to dry and wet paths
        this.inputGain.connect(this.dryGain);
        this.inputGain.connect(this.wetGain);
        
        // Both paths merge at output
        this.dryGain.connect(this.outputGain);
        // Wet path will connect through effects chain
        
        // Output goes to destination
        this.outputGain.connect(this.outputNode);
        
        console.log('✅ Basic routing complete: input → [dry + wet] → output → destination');
    }
    
    createAllEffects() {
        console.log('🎨 Creating all audio effects...');
        
        // DELAY EFFECT - Musical tape/digital delay with proper feedback
        try {
            const delay = this.audioContext.createDelay(5.0); // Max 5 seconds
            const feedback = this.audioContext.createGain();
            const wetGain = this.audioContext.createGain();
            const inputGain = this.audioContext.createGain();
            const dryGain = this.audioContext.createGain();
            const mixGain = this.audioContext.createGain();
            
            // High-cut filter in feedback loop (tape-style degradation)
            const filterNode = this.audioContext.createBiquadFilter();
            filterNode.type = 'lowpass';
            filterNode.frequency.value = 2500; // Roll off highs
            filterNode.Q.value = 0.5;
            
            // Set initial values for musical delay
            delay.delayTime.value = 0.375; // 375ms for dotted eighth at 120bpm
            feedback.gain.value = 0.65;    // 65% feedback for multiple repeats
            wetGain.gain.value = 0.7;      // Strong wet signal
            inputGain.gain.value = 1.0;
            dryGain.gain.value = 1.0;
            
            // Build proper delay network
            // Input -> [Dry path] -> Mix
            //       -> Delay -> Filter -> Feedback -> Delay (loop)
            //                -> Wet -> Mix
            inputGain.connect(dryGain);
            dryGain.connect(mixGain);
            
            inputGain.connect(delay);
            delay.connect(filterNode);
            filterNode.connect(feedback);
            feedback.connect(delay); // Feedback loop
            
            delay.connect(wetGain);
            wetGain.connect(mixGain);
            
            this.effects.delay = {
                input: inputGain,
                output: mixGain,
                delayNode: delay,
                feedbackNode: feedback,
                wetGainNode: wetGain,
                filterNode: filterNode,
                dryGain: dryGain
            };
            
            console.log('✅ Musical Delay created - 375ms, 65% feedback with high-cut filter');
        } catch (e) {
            console.error('❌ Delay creation failed:', e);
        }
        
        // FILTER EFFECT
        try {
            const filter = this.audioContext.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 2000;
            filter.Q.value = 1;
            
            this.effects.filter = {
                input: filter,
                output: filter,
                filterNode: filter
            };
            
            console.log('✅ Filter created - Lowpass 2000Hz');
        } catch (e) {
            console.error('❌ Filter creation failed:', e);
        }
        
        // SATURATION/DISTORTION EFFECT
        try {
            const waveshaper = this.audioContext.createWaveShaper();
            const inputGain = this.audioContext.createGain();
            const outputGain = this.audioContext.createGain();
            
            inputGain.gain.value = 1.0;
            outputGain.gain.value = 1.0;
            
            // Create initial curve
            this.updateDistortionCurve(waveshaper, 0);
            waveshaper.oversample = '4x';
            
            // Connect saturation chain
            inputGain.connect(waveshaper);
            waveshaper.connect(outputGain);
            
            this.effects.saturation = {
                input: inputGain,
                output: outputGain,
                waveshaperNode: waveshaper,
                inputGain: inputGain,
                outputGain: outputGain
            };
            
            console.log('✅ Saturation created');
        } catch (e) {
            console.error('❌ Saturation creation failed:', e);
        }
        
        // REVERB EFFECT - Rich hall/plate style reverb
        try {
            const convolver = this.audioContext.createConvolver();
            const wetGain = this.audioContext.createGain();
            const inputGain = this.audioContext.createGain();
            const preDelay = this.audioContext.createDelay(1.0);
            
            wetGain.gain.value = 1.0;
            inputGain.gain.value = 1.0;
            preDelay.delayTime.value = 0.03; // 30ms pre-delay for clarity
            
            // Create rich impulse response with early reflections and late reverb
            const length = this.audioContext.sampleRate * 3.5; // 3.5 seconds for spacious sound
            const impulse = this.audioContext.createBuffer(2, length, this.audioContext.sampleRate);
            
            for (let channel = 0; channel < 2; channel++) {
                const channelData = impulse.getChannelData(channel);
                
                // Early reflections (first 100ms) - discrete echoes
                const earlyTime = Math.floor(this.audioContext.sampleRate * 0.1);
                const reflectionTimes = [0.005, 0.01, 0.015, 0.02, 0.025, 0.03, 0.04, 0.05, 0.07, 0.09];
                
                for (const time of reflectionTimes) {
                    const sample = Math.floor(time * this.audioContext.sampleRate);
                    if (sample < earlyTime) {
                        const gain = 0.7 * Math.pow(0.9, reflectionTimes.indexOf(time));
                        channelData[sample] = (Math.random() * 2 - 1) * gain;
                    }
                }
                
                // Late reverb (after 100ms) - dense, smooth decay
                for (let i = earlyTime; i < length; i++) {
                    // Exponential decay with slight randomization
                    const t = (i - earlyTime) / (length - earlyTime);
                    const decay = Math.pow(1 - t, 1.5); // Smoother decay curve
                    
                    // Denser reverb tail with filtered noise
                    let sample = (Math.random() * 2 - 1) * decay * 0.25;
                    
                    // Add slight modulation for richness
                    const modFreq = 0.5 + channel * 0.1; // Different for each channel
                    const modulation = 1 + 0.02 * Math.sin(2 * Math.PI * modFreq * i / this.audioContext.sampleRate);
                    sample *= modulation;
                    
                    // Stereo width - different decay characteristics per channel
                    if (channel === 1) {
                        sample *= 1.05; // Slightly louder/different on right
                        // Add micro-delay for width
                        if (i > 5) {
                            sample = sample * 0.7 + channelData[i - 5] * 0.3;
                        }
                    }
                    
                    channelData[i] = sample;
                }
            }
            
            convolver.buffer = impulse;
            
            // Connect with pre-delay for clarity
            inputGain.connect(preDelay);
            preDelay.connect(convolver);
            convolver.connect(wetGain);
            
            this.effects.reverb = {
                input: inputGain,
                output: wetGain,
                convolverNode: convolver,
                wetGainNode: wetGain,
                preDelayNode: preDelay
            };
            
            console.log('✅ Rich Hall Reverb created - 3.5s decay with early reflections');
        } catch (e) {
            console.error('❌ Reverb creation failed:', e);
        }
    }
    
    setupEffectsChain() {
        console.log('🔗 Setting up effects chain...');
        
        // Connect effects in series: wet → delay → filter → saturation → reverb → output
        try {
            // Disconnect any existing connections
            this.wetGain.disconnect();
            
            // Chain effects together
            let currentNode = this.wetGain;
            
            // Connect through each effect if it exists
            const effectOrder = ['delay', 'filter', 'saturation', 'reverb'];
            
            for (const effectName of effectOrder) {
                const effect = this.effects[effectName];
                if (effect && effect.input && effect.output) {
                    console.log(`🔗 Connecting ${effectName} to chain`);
                    currentNode.connect(effect.input);
                    currentNode = effect.output;
                }
            }
            
            // Connect final effect to output
            currentNode.connect(this.outputGain);
            
            console.log('✅ Effects chain connected: wet → delay → filter → saturation → reverb → output');
        } catch (e) {
            console.error('❌ Effects chain setup failed:', e);
            // Fallback: connect wet directly to output
            this.wetGain.connect(this.outputGain);
        }
    }
    
    updateDistortionCurve(waveshaper, amount) {
        const samples = 44100;
        const curve = new Float32Array(samples);
        const deg = Math.PI / 180;
        
        for (let i = 0; i < samples; i++) {
            const x = (i * 2) / samples - 1;
            curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
        }
        
        waveshaper.curve = curve;
    }
    
    // Get input node for external connections
    getInputNode() {
        return this.inputGain;
    }
    
    // Get output node for external connections
    getOutputNode() {
        return this.outputGain;
    }
    
    // Set delay parameters
    setDelayTime(time) {
        console.log(`🎚️ Setting delay time to ${time}s`);
        if (this.effects.delay) {
            const now = this.audioContext.currentTime;
            this.effects.delay.delayNode.delayTime.setValueAtTime(time, now);
            this.effectParams.delay.time = time;
        }
    }
    
    setDelayFeedback(feedback) {
        console.log(`🎚️ Setting delay feedback to ${feedback}`);
        if (this.effects.delay) {
            const now = this.audioContext.currentTime;
            this.effects.delay.feedbackNode.gain.setValueAtTime(feedback, now);
            this.effectParams.delay.feedback = feedback;
        }
    }
    
    setDelayMix(mix) {
        console.log(`🎚️ Setting delay mix to ${mix}`);
        this.effectParams.delay.mix = mix;
        this.updateWetDryMix();
    }
    
    // Set filter parameters
    setFilterFrequency(frequency) {
        console.log(`🎚️ Setting filter frequency to ${frequency}Hz`);
        if (this.effects.filter) {
            const now = this.audioContext.currentTime;
            this.effects.filter.filterNode.frequency.setValueAtTime(frequency, now);
            this.effectParams.filter.frequency = frequency;
        }
    }
    
    setFilterResonance(resonance) {
        console.log(`🎚️ Setting filter resonance to ${resonance}`);
        if (this.effects.filter) {
            const now = this.audioContext.currentTime;
            this.effects.filter.filterNode.Q.setValueAtTime(resonance, now);
            this.effectParams.filter.resonance = resonance;
        }
    }
    
    setFilterMix(mix) {
        console.log(`🎚️ Setting filter mix to ${mix}`);
        this.effectParams.filter.mix = mix;
        this.updateWetDryMix();
    }
    
    // Set saturation parameters
    setSaturationAmount(amount) {
        console.log(`🎚️ Setting saturation amount to ${amount}`);
        if (this.effects.saturation) {
            this.updateDistortionCurve(this.effects.saturation.waveshaperNode, amount);
            this.effectParams.saturation.amount = amount;
        }
    }
    
    setSaturationMix(mix) {
        console.log(`🎚️ Setting saturation mix to ${mix}`);
        this.effectParams.saturation.mix = mix;
        this.updateWetDryMix();
    }
    
    // Set reverb parameters
    setReverbMix(mix) {
        console.log(`🎚️ Setting reverb mix to ${mix}`);
        this.effectParams.reverb.mix = mix;
        this.updateWetDryMix();
    }
    
    // Update overall wet/dry mix based on individual effect mixes
    updateWetDryMix() {
        // Calculate total wet amount from all effect mixes
        const totalWet = Math.max(
            this.effectParams.delay.mix,
            this.effectParams.filter.mix,
            this.effectParams.saturation.mix,
            this.effectParams.reverb.mix
        );
        
        const now = this.audioContext.currentTime;
        
        // Set wet and dry gains
        this.wetGain.gain.setValueAtTime(totalWet, now);
        this.dryGain.gain.setValueAtTime(1 - totalWet * 0.5, now); // Keep some dry signal
        
        console.log(`📊 Updated wet/dry mix - Wet: ${totalWet}, Dry: ${1 - totalWet * 0.5}`);
    }
    
    // Simplified parameter setter for UI
    setEffectParam(effectName, paramName, value) {
        console.log(`🎛️ setEffectParam('${effectName}', '${paramName}', ${value})`);
        
        switch (effectName) {
            case 'delay':
                if (paramName === 'wetness' || paramName === 'mix') this.setDelayMix(value);
                else if (paramName === 'time') this.setDelayTime(value);
                else if (paramName === 'feedback') this.setDelayFeedback(value);
                break;
                
            case 'filter':
                if (paramName === 'wetness' || paramName === 'mix') this.setFilterMix(value);
                else if (paramName === 'frequency') this.setFilterFrequency(value);
                else if (paramName === 'resonance') this.setFilterResonance(value);
                break;
                
            case 'distortion':
                if (paramName === 'wetness' || paramName === 'mix') this.setSaturationMix(value);
                else if (paramName === 'amount') this.setSaturationAmount(value);
                break;
                
            case 'reverb':
                if (paramName === 'wetness' || paramName === 'mix') this.setReverbMix(value);
                break;
        }
    }
    
    // Enable/disable effect (by setting mix)
    setEffect(effectName, enabled) {
        console.log(`🎛️ setEffect('${effectName}', ${enabled})`);
        
        const mixValue = enabled ? 0.5 : 0; // Default to 50% mix when enabled
        
        switch (effectName) {
            case 'delay':
                this.setDelayMix(mixValue);
                break;
            case 'filter':
                this.setFilterMix(mixValue);
                break;
            case 'distortion':
                this.setSaturationMix(mixValue);
                break;
            case 'reverb':
                this.setReverbMix(mixValue);
                break;
        }
    }
    
    // Add global test functions
    addGlobalTestFunctions() {
        // Verify effects chain with test tone
        window.verifyEffectsChain = () => {
            console.log('🧪 VERIFYING EFFECTS CHAIN...');
            console.log('Playing 440Hz tone with 500ms delay for 3 seconds');
            
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            
            osc.frequency.value = 440;
            osc.type = 'sine';
            gain.gain.value = 0.3;
            
            // Enable delay with obvious settings
            this.setDelayTime(0.5);
            this.setDelayFeedback(0.5);
            this.setDelayMix(0.8);
            
            // Connect through effects
            osc.connect(gain);
            gain.connect(this.inputGain);
            
            osc.start();
            osc.stop(this.audioContext.currentTime + 3);
            
            console.log('✅ You should hear the original tone plus delayed echoes');
            return 'Test tone playing with delay effect';
        };
        
        // Inspect audio graph
        window.inspectAudioGraph = () => {
            console.log('🔍 AUDIO GRAPH INSPECTION:');
            console.log('AudioContext state:', this.audioContext.state);
            console.log('Sample rate:', this.audioContext.sampleRate);
            console.log('Current time:', this.audioContext.currentTime);
            console.log('Base latency:', this.audioContext.baseLatency);
            
            console.log('\n📊 GAIN NODES:');
            console.log('Input gain:', this.inputGain.gain.value);
            console.log('Dry gain:', this.dryGain.gain.value);
            console.log('Wet gain:', this.wetGain.gain.value);
            console.log('Output gain:', this.outputGain.gain.value);
            
            console.log('\n🎛️ EFFECT PARAMETERS:');
            console.log('Delay:', this.effectParams.delay);
            console.log('Filter:', this.effectParams.filter);
            console.log('Saturation:', this.effectParams.saturation);
            console.log('Reverb:', this.effectParams.reverb);
            
            console.log('\n🔗 CONNECTIONS:');
            console.log('Input → Dry + Wet');
            console.log('Wet → Delay → Filter → Saturation → Reverb → Output');
            console.log('Dry → Output');
            console.log('Output → Destination');
            
            return this.effectParams;
        };
        
        // Test all effects at once
        window.testEffects = () => {
            console.log('🧪 ENABLING ALL EFFECTS WITH MAXIMUM SETTINGS...');
            
            // Set all effects to maximum audible values
            this.setDelayTime(0.5);
            this.setDelayFeedback(0.6);
            this.setDelayMix(0.7);
            
            this.setFilterFrequency(800);
            this.setFilterResonance(10);
            this.setFilterMix(0.5);
            
            this.setSaturationAmount(50);
            this.setSaturationMix(0.3);
            
            this.setReverbMix(0.6);
            
            console.log('✅ All effects enabled with obvious settings');
            console.log('Play some notes to hear the effects!');
            
            // Also play a test tone
            window.verifyEffectsChain();
        };
        
        // Individual effect setters
        window.setDelayWetness = (val) => {
            console.log(`🔧 Global setDelayWetness(${val})`);
            this.setDelayMix(val);
        };
        
        window.setDelayTime = (val) => {
            console.log(`🔧 Global setDelayTime(${val})`);
            this.setDelayTime(val);
        };
        
        window.setReverbAmount = (val) => {
            console.log(`🔧 Global setReverbAmount(${val})`);
            this.setReverbMix(val);
        };
        
        console.log('💡 Global test functions added:');
        console.log('   - verifyEffectsChain() - Plays test tone with delay');
        console.log('   - inspectAudioGraph() - Shows all audio node states');
        console.log('   - testEffects() - Enables all effects with max values');
        console.log('   - setDelayWetness(0-1), setDelayTime(0-5), setReverbAmount(0-1)');
    }
}

export function createEffectsProcessor(audioContext, outputNode) {
    return new EffectsProcessor(audioContext, outputNode);
}