export function initializeInstruments() {
    return {
        synth: { waveform: 'square', attack: 0.1, decay: 0.2, sustain: 0.5, release: 0.5, volume: 0.6 },
        bass: { waveform: 'sawtooth', attack: 0.05, decay: 0.1, sustain: 0.5, release: 0.3, volume: 0.6 },
        keys: { waveform: 'sine', attack: 0.02, decay: 0.1, sustain: 0.5, release: 0.5, volume: 0.6 },
        drums: { 
            waveform: 'square', // Lock to Kit 1 only
            attack: 0.01, 
            decay: 0.1, 
            sustain: 0.0, 
            release: 0.1, 
            volume: 1.0,
            kickPitch: 1.0,
            snarePitch: 1.0,
            hat1Pitch: 1.0,
            hat2Pitch: 1.0,
            kickDecay: 0.4,
            snareDecay: 0.2,
            clapDecay: 0.15,
            hihatDecay: 0.1
        }
    };
}

