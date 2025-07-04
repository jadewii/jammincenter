/**
 * Creates a noise node for drum sounds
 * @param {number} duration - Duration of the noise in seconds
 * @param {number} gain - Initial gain value
 * @returns {GainNode} The gain node connected to the noise source
 */
export function createNoiseNode(duration, gain = 0.5) {
    const bufferSize = this.audioContext.sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    
    const noise = this.audioContext.createBufferSource();
    noise.buffer = buffer;
    
    const noiseGain = this.audioContext.createGain();
    noiseGain.gain.setValueAtTime(gain, this.audioContext.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
    
    noise.connect(noiseGain);
    noise.start();
    noise.stop(this.audioContext.currentTime + duration);
    
    return noiseGain;
}

/**
 * Creates a reverb impulse response buffer
 * @param {number} intensity - Reverb intensity (0-1)
 * @returns {AudioBuffer} The reverb buffer
 */
export function createReverbBuffer(intensity) {
    const sampleRate = this.audioContext.sampleRate;
    const length = sampleRate * (1 + intensity); // Up to 2 seconds based on intensity
    const buffer = this.audioContext.createBuffer(2, length, sampleRate);
    
    for (let channel = 0; channel < 2; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < length; i++) {
            const decay = Math.pow(1 - (i / length), 2);
            channelData[i] = (Math.random() * 2 - 1) * decay * intensity;
        }
    }
    
    return buffer;
}