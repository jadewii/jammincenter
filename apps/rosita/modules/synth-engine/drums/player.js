/**
 * Play a drum sound based on type
 * @param {string} drumType - Type of drum sound to play
 */
export function playDrumSound(drumType) {
    // Ensure audio context is running
    if (this.audioContext.state !== 'running') {
        this.audioContext.resume();
    }

    // Create oscillator and gain node
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    oscillator.connect(gainNode);
    
    // Get kit type from current instrument settings
    const kitType = this.instrumentSettings.drums.waveform || 'triangle';
    
    // Get drum settings
    const drumSettings = this.instrumentSettings.drums;
    
    // Get current time
    const now = this.audioContext.currentTime;

    // Check if we have a sample for this drum type
    if (this.samples[drumType]) {
        try {
            // Get volume from sequencer if available
            let drumVolume = 0.8; // Default
            if (window.sequencer && typeof window.sequencer.getDrumVolume === 'function') {
                drumVolume = window.sequencer.getDrumVolume(drumType);
            }
            
            // Play sample with appropriate volume and duration
            const source = this.audioContext.createBufferSource();
            source.buffer = this.samples[drumType];
            
            // Apply pitch control for all drum types using playbackRate
            let pitchMultiplier = 1.0;
            if (drumType === 'Kick') {
                pitchMultiplier = drumSettings.kickPitch || 1.0;
            } else if (drumType === 'Snare') {
                pitchMultiplier = drumSettings.snarePitch || 1.0;
            } else if (drumType === 'Hat 1') {
                pitchMultiplier = drumSettings.hat1Pitch || 1.0;
            } else if (drumType === 'Hat 2') {
                pitchMultiplier = drumSettings.hat2Pitch || 1.0;
            }
            
            source.playbackRate.setValueAtTime(pitchMultiplier, now);
            
            // Create gain node for volume and envelope control
            const sampleGain = this.audioContext.createGain();
            sampleGain.gain.setValueAtTime(drumVolume, now);
            
            // Apply drum FX if available
            let finalNode = sampleGain;
            
            // Apply saturator FX
            if (drumSettings.saturator !== undefined && drumSettings.saturator > 0) {
                const waveshaper = this.audioContext.createWaveShaper();
                const amount = drumSettings.saturator * 50; // Much more exaggerated scaling
                const samples = 44100;
                const curve = new Float32Array(samples);
                for (let i = 0; i < samples; i++) {
                    const x = (i * 2) / samples - 1;
                    // More aggressive saturation curve for exaggerated effect
                    curve[i] = Math.sign(x) * Math.pow(Math.abs(Math.tanh(x * amount)), 0.7);
                }
                waveshaper.curve = curve;
                waveshaper.oversample = '4x';
                finalNode.connect(waveshaper);
                finalNode = waveshaper;
            }
            
            // Apply filter FX
            if (drumSettings.filterCutoff !== undefined) {
                const filter = this.audioContext.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(200 + (drumSettings.filterCutoff * 8000), now);
                filter.Q.setValueAtTime(1, now);
                finalNode.connect(filter);
                finalNode = filter;
            }
            
            // Apply distortion FX
            if (drumSettings.distortion !== undefined && drumSettings.distortion > 0) {
                const waveshaper = this.audioContext.createWaveShaper();
                const amount = drumSettings.distortion * 15; // More exaggerated scaling
                const samples = 44100;
                const curve = new Float32Array(samples);
                for (let i = 0; i < samples; i++) {
                    const x = (i * 2) / samples - 1;
                    // More aggressive distortion curve with clipping for exaggerated effect
                    const driven = x * amount;
                    curve[i] = Math.sign(driven) * Math.min(Math.abs(driven), 1) * 0.8;
                }
                waveshaper.curve = curve;
                waveshaper.oversample = '4x';
                finalNode.connect(waveshaper);
                finalNode = waveshaper;
            }
            
            // Apply reverb FX
            if (drumSettings.reverb !== undefined && drumSettings.reverb > 0) {
                const convolver = this.audioContext.createConvolver();
                const reverbBuffer = this.createReverbBuffer(drumSettings.reverb);
                convolver.buffer = reverbBuffer;
                
                const wetGain = this.audioContext.createGain();
                const dryGain = this.audioContext.createGain();
                
                wetGain.gain.setValueAtTime(drumSettings.reverb * 0.5, now);
                dryGain.gain.setValueAtTime(1 - (drumSettings.reverb * 0.3), now);
                
                finalNode.connect(wetGain);
                finalNode.connect(dryGain);
                wetGain.connect(convolver);
                
                const reverbOutput = this.audioContext.createGain();
                convolver.connect(reverbOutput);
                dryGain.connect(reverbOutput);
                
                finalNode = reverbOutput;
            }
            
            // Apply delay FX
            if (drumSettings.delay !== undefined && drumSettings.delay > 0) {
                const delayNode = this.audioContext.createDelay(1.0);
                const feedbackGain = this.audioContext.createGain();
                const wetGain = this.audioContext.createGain();
                const dryGain = this.audioContext.createGain();
                
                const delayTime = drumSettings.delay * 0.3; // Max 300ms delay
                delayNode.delayTime.setValueAtTime(delayTime, now);
                feedbackGain.gain.setValueAtTime(drumSettings.delay * 0.4, now);
                wetGain.gain.setValueAtTime(drumSettings.delay * 0.3, now);
                dryGain.gain.setValueAtTime(1 - (drumSettings.delay * 0.2), now);
                
                finalNode.connect(dryGain);
                finalNode.connect(delayNode);
                delayNode.connect(feedbackGain);
                delayNode.connect(wetGain);
                feedbackGain.connect(delayNode);
                
                const delayOutput = this.audioContext.createGain();
                dryGain.connect(delayOutput);
                wetGain.connect(delayOutput);
                
                finalNode = delayOutput;
            }
            
            // Connect and start playing
            source.connect(sampleGain);
            finalNode.connect(this.masterGain);
            source.start();
            
            // Apply decay envelope - convert percentage to actual duration
            const maxDuration = source.buffer.duration;
            const decayAmount = drumSettings.hihatDecay || 0.1; // Use appropriate decay setting
            
            // For 0% decay, use ultra-short duration
            let actualDuration;
            if (decayAmount <= 0.01) {
                actualDuration = 0.002; // 2ms for 0% decay
            } else {
                actualDuration = Math.max(0.01, decayAmount * maxDuration);
            }
            
            // For very short durations (like 0-1% decay), just stop the sample quickly
            if (decayAmount <= 0.01) {
                source.stop(now + actualDuration);
            } else {
                // For longer durations, apply fade-out envelope
                const fadeStartTime = actualDuration * 0.7; // Start fade at 70% of duration
                sampleGain.gain.setValueAtTime(drumVolume, now + fadeStartTime);
                sampleGain.gain.linearRampToValueAtTime(0, now + actualDuration);
                source.stop(now + actualDuration + 0.01);
            }
            return;
        } catch (e) {
            console.warn(`Error playing sample for ${drumType}:`, e);
            // Fall through to synthetic sounds if sample fails
        }
    }
    
    // If we don't have a sample or it failed, use synthesized sounds
    switch (drumType) {
        case 'Kick':
            window.playKickDrum.call(this, oscillator, gainNode, kitType, drumSettings, now);
            break;
            
        case 'Snare':
            window.playSnare.call(this, oscillator, gainNode, kitType, drumSettings, now);
            break;
            
        case 'Hat 1':
            window.playHiHat.call(this, oscillator, gainNode, kitType, drumSettings, now, drumType);
            break;
            
        case 'Hat 2':
        case 'Hi-hat O':
            window.playHiHat.call(this, oscillator, gainNode, kitType, drumSettings, now, drumType);
            break;
    }
}