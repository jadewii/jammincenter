// Enhanced Rosita - Full Feature Implementation
console.log('🎵 Starting Enhanced Rosita with all features');

// Drum Sampler Class
class DrumSampler {
    constructor(audioContext) {
        this.audioContext = audioContext;
        this.buffers = {};
        this.currentKit = 1;
        this.kits = {
            1: 'kit 1',
            2: 'kit 2', 
            3: 'kit 3',
            4: 'kit 4'
        };
        
        // Define the drum mapping (row index to sample type)
        this.drumMap = [
            'kick',   // Row 0
            'snare',  // Row 1
            'hat1',   // Row 2
            'hat2',   // Row 3
            'perc1',  // Row 4
            'perc2',  // Row 5
            'perc3',  // Row 6
            'perc4',  // Row 7
            'extra1', // Row 8
            'extra2', // Row 9
            'extra3', // Row 10
            'extra4'  // Row 11
        ];
        
        // Don't load kit immediately - it might fail and prevent UI creation
        // this.loadCurrentKit();
    }
    
    async loadAudioBuffer(url) {
        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            return audioBuffer;
        } catch (error) {
            console.error('Error loading audio file:', url, error);
            return null;
        }
    }
    
    async loadCurrentKit() {
        const kitFolder = this.kits[this.currentKit];
        const kitPath = `samples/${kitFolder}`;
        
        // Clear previous buffers
        this.buffers = {};
        
        console.log(`Loading drum kit: ${kitFolder} from ${kitPath}`);
        
        // Get list of files in the kit folder
        try {
            // For each kit, we'll map files to our drum types
            const fileMappings = {
                'kit 1': {
                    'kick': 'FB Kick 1.wav',
                    'snare': 'FB Snare 6.wav',
                    'hat1': 'FB Hat 1.wav',
                    'hat2': 'FB Hat 5.wav',
                    'perc1': 'FB Perc 1.wav',
                    'perc2': 'FB Perc 2.wav',
                    'perc3': 'FB Perc 3.wav',
                    'perc4': 'FB Perc 4.wav',
                    'extra1': 'FB Kick 2.wav',
                    'extra2': 'FB Snare 1.wav',
                    'extra3': 'FB Hat 2.wav',
                    'extra4': 'FB Perc 5.wav'
                },
                'kit 2': {
                    'kick': 'FB Kick 2.wav',
                    'snare': 'FB Snare 3.wav',
                    'hat1': 'FB Hat 2.wav',
                    'hat2': 'FB Hat 6.wav',
                    'perc1': 'FB Perc 5.wav',
                    'perc2': 'FB Perc 6.wav',
                    'perc3': 'FB Perc 7.wav',
                    'perc4': 'FB Perc 8.wav',
                    'extra1': 'FB Kick 3.wav',
                    'extra2': 'FB Snare 2.wav',
                    'extra3': 'FB Hat 3.wav',
                    'extra4': 'FB Perc 1.wav'
                },
                'kit 3': {
                    'kick': 'FB Kick 3.wav',
                    'snare': 'FB Snare 1.wav',
                    'hat1': 'FB Hat 3.wav',
                    'hat2': 'FB Hat 7.wav',
                    'perc1': 'MH1.wav',
                    'perc2': 'MH2.wav',
                    'perc3': 'MH3.wav',
                    'perc4': 'MH4.wav',
                    'extra1': 'MH5.wav',
                    'extra2': 'MH6.wav',
                    'extra3': 'MH7.wav',
                    'extra4': 'MH8.wav'
                },
                'kit 4': {
                    'kick': 'FB Kick 8.wav',
                    'snare': 'FB Snare 2.wav',
                    'hat1': 'FB Hat 4.wav',
                    'hat2': 'FB Hat 8.wav',
                    'perc1': 'MH16.wav',
                    'perc2': 'MH17.wav',
                    'perc3': 'MH21.wav',
                    'perc4': 'MH22.wav',
                    'extra1': 'MH18.wav',
                    'extra2': 'MH19.wav',
                    'extra3': 'MH20.wav',
                    'extra4': 'MH23.wav'
                }
            };
            
            const mapping = fileMappings[kitFolder];
            
            // Load each mapped file
            for (const [drumType, fileName] of Object.entries(mapping)) {
                const url = `${kitPath}/${fileName}`;
                console.log(`Loading ${drumType}: ${url}`);
                const buffer = await this.loadAudioBuffer(url);
                if (buffer) {
                    this.buffers[drumType] = buffer;
                    console.log(`✅ Loaded ${drumType}`);
                } else {
                    console.error(`❌ Failed to load ${drumType} from ${url}`);
                }
            }
            
            console.log(`Loaded drum kit ${this.currentKit}:`, Object.keys(this.buffers));
            
        } catch (error) {
            console.error('Error loading drum kit:', error);
        }
    }
    
    playDrum(rowIndex, velocity = 1.0, pan = 0, effects = {}) {
        console.log(`playDrum called for row ${rowIndex}`);
        const drumType = this.drumMap[rowIndex];
        if (!drumType || !this.buffers[drumType]) {
            console.warn(`No drum sample for row ${rowIndex} (${drumType})`);
            console.log('Available drums:', Object.keys(this.buffers));
            return;
        }
        console.log(`Playing ${drumType} drum sound`);
        
        const buffer = this.buffers[drumType];
        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();
        const panNode = this.audioContext.createStereoPanner();
        
        source.buffer = buffer;
        
        // Apply velocity
        gainNode.gain.setValueAtTime(velocity * 0.8, this.audioContext.currentTime);
        
        // Apply pan
        panNode.pan.setValueAtTime(pan, this.audioContext.currentTime);
        
        // Connect nodes
        source.connect(gainNode);
        
        // Use effects processor if available
        if (window.effectsProcessor && effects) {
            // Update effects based on current settings
            const maxWet = Math.max(effects.delay || 0, effects.reverb || 0, effects.saturation || 0, effects.chorus || 0);
            window.effectsProcessor.wetGain.gain.setValueAtTime(maxWet, this.audioContext.currentTime);
            window.effectsProcessor.dryGain.gain.setValueAtTime(1 - maxWet * 0.5, this.audioContext.currentTime);
            
            // Update individual effects
            if (effects.delay > 0) {
                // Digital delay with rhythmic timing
                const delayTime = 0.125 + (effects.delay * 0.375); // 125-500ms range
                window.effectsProcessor.effects.delay.delayNode.delayTime.setValueAtTime(delayTime, this.audioContext.currentTime);
                // High feedback for multiple repeats
                window.effectsProcessor.effects.delay.feedbackNode.gain.setValueAtTime(0.5 + (effects.delay * 0.35), this.audioContext.currentTime);
                // Adjust filter for more/less degradation
                if (window.effectsProcessor.effects.delay.filterNode) {
                    window.effectsProcessor.effects.delay.filterNode.gain.setValueAtTime(-1 - (effects.delay * 4), this.audioContext.currentTime);
                }
            }
            
            if (effects.saturation > 0 && window.effectsProcessor.effects.saturation.makeCurve) {
                window.effectsProcessor.effects.saturation.waveshaperNode.curve = window.effectsProcessor.effects.saturation.makeCurve(effects.saturation * 30);
            }
            
            if (effects.chorus > 0) {
                window.effectsProcessor.effects.filter.filterNode.frequency.setValueAtTime(200 + (effects.chorus * 3800), this.audioContext.currentTime);
                window.effectsProcessor.effects.filter.filterNode.Q.setValueAtTime(1 + (effects.chorus * 10), this.audioContext.currentTime);
            }
            
            // Connect through effects processor
            gainNode.connect(panNode);
            panNode.connect(window.effectsProcessor.inputGain);
            
            console.log(`🥁 Drum through effects - D:${(effects.delay || 0).toFixed(2)} R:${(effects.reverb || 0).toFixed(2)} S:${(effects.saturation || 0).toFixed(2)} C:${(effects.chorus || 0).toFixed(2)}`);
        } else {
            // Fallback: direct connection
            gainNode.connect(panNode);
            panNode.connect(this.audioContext.destination);
        }
        
        source.start();
    }
    
    async cycleKit() {
        this.currentKit = (this.currentKit % 4) + 1;
        await this.loadCurrentKit();
        return this.currentKit;
    }
    
    getCurrentKitName() {
        return `Kit ${this.currentKit}`;
    }
}

// Global drum sampler instance
let drumSampler = null;

// Window control functions
function closeApp() {
    try {
        if (window.__TAURI__ && window.__TAURI__.window) {
            window.__TAURI__.window.getCurrent().close();
        }
    } catch (error) {
        console.error('Close app error:', error);
    }
}

function minimizeApp() {
    try {
        if (window.__TAURI__ && window.__TAURI__.window) {
            window.__TAURI__.window.getCurrent().minimize();
        }
    } catch (error) {
        console.error('Minimize app error:', error);
    }
}

function maximizeApp() {
    try {
        if (window.__TAURI__ && window.__TAURI__.window) {
            window.__TAURI__.window.getCurrent().toggleMaximize();
        }
    } catch (error) {
        console.error('Maximize app error:', error);
    }
}

// Global state management
let audioContext = null;
let currentInstrument = 1;
let currentPattern = 1;
let isPlaying = false;
let playbackInterval = null;
let currentStep = 0;
let tempo = 120;
let currentScale = 'major'; // 'major' or 'minor'
let duplicateMode = false; // For DUP button functionality

// Octave settings per instrument and for piano keyboard
let instrumentOctaves = {
    1: 0, // Synth
    2: -1, // Bass (one octave lower)
    3: 0, // Keys
    4: 0  // Drums
};
let pianoKeyboardOctave = 0;

// Mixer state
let mixerVisible = false;
let instrumentVolumes = { 1: 0.8, 2: 0.8, 3: 0.8, 4: 0.8 };
let instrumentPans = { 1: 0, 2: 0, 3: 0, 4: 0 };

// Arpeggiator state
const arpeggiatorState = {
    1: { enabled: false, hold: false, notes: [], interval: null, currentIndex: 0 },
    2: { enabled: false, hold: false, notes: [], interval: null, currentIndex: 0 },
    3: { enabled: false, hold: false, notes: [], interval: null, currentIndex: 0 }
};

// Enhanced instrument definitions with multiple sound variations
const instrumentSounds = {
    1: { // Synth
        sounds: [
            { name: 'Saw Lead', type: 'sawtooth', volume: 0.3, decay: 0.8 },
            { name: 'Square Lead', type: 'square', volume: 0.25, decay: 0.6 },
            { name: 'Triangle Wave', type: 'triangle', volume: 0.4, decay: 1.0 },
            { name: 'Sine Wave', type: 'sine', volume: 0.35, decay: 1.2 }
        ],
        currentSound: 0
    },
    2: { // Bass
        sounds: [
            { name: 'Sub Bass', type: 'sine', volume: 0.5, decay: 0.3 },
            { name: 'Square Bass', type: 'square', volume: 0.4, decay: 0.4 },
            { name: 'Saw Bass', type: 'sawtooth', volume: 0.35, decay: 0.5 },
            { name: 'FM Bass', type: 'triangle', volume: 0.45, decay: 0.25 }
        ],
        currentSound: 0
    },
    3: { // Keys
        sounds: [
            { name: 'Electric Piano', type: 'sine', volume: 0.3, decay: 1.5 },
            { name: 'Organ', type: 'square', volume: 0.25, decay: 2.0 },
            { name: 'Bell', type: 'triangle', volume: 0.4, decay: 3.0 },
            { name: 'Pad', type: 'sawtooth', volume: 0.2, decay: 4.0 }
        ],
        currentSound: 0
    },
    4: { // Drums - special drum machine
        sounds: [
            { name: 'Kick', type: 'sine', volume: 0.8, decay: 0.15, freq: 60 },
            { name: 'Snare', type: 'sawtooth', volume: 0.6, decay: 0.2, freq: 200, noise: true },
            { name: 'Hi-Hat', type: 'square', volume: 0.4, decay: 0.08, freq: 8000, noise: true },
            { name: 'Open Hat', type: 'square', volume: 0.5, decay: 0.4, freq: 10000, noise: true },
            { name: 'Clap', type: 'sawtooth', volume: 0.7, decay: 0.12, freq: 1000, noise: true },
            { name: 'Crash', type: 'triangle', volume: 0.6, decay: 1.0, freq: 5000, noise: true },
            { name: 'Ride', type: 'triangle', volume: 0.5, decay: 0.6, freq: 3000, noise: true },
            { name: 'Tom', type: 'sine', volume: 0.7, decay: 0.25, freq: 150 }
        ],
        currentSound: 0,
        isDrumMachine: true
    }
};

// Pattern storage: 8 patterns × 4 instruments × 8 tracks × 16 steps
let patterns = {};
for (let p = 1; p <= 8; p++) {
    patterns[p] = {};
    for (let i = 1; i <= 4; i++) {
        patterns[p][i] = {};
        for (let t = 0; t < 8; t++) {
            patterns[p][i][t] = [];
            for (let s = 0; s < 16; s++) {
                patterns[p][i][t][s] = { active: false, velocity: 0.8 };
            }
        }
    }
}

// Individual ADSR settings per instrument
let instrumentADSR = {
    1: { attack: 0.1, decay: 0.2, sustain: 0.5, release: 0.5 },
    2: { attack: 0.1, decay: 0.2, sustain: 0.5, release: 0.5 },
    3: { attack: 0.1, decay: 0.2, sustain: 0.5, release: 0.5 },
    4: { attack: 0.1, decay: 0.2, sustain: 0.5, release: 0.5 }
};

// Individual effects settings per instrument
let instrumentEffects = {
    1: { delay: 0, reverb: 0, saturation: 0, chorus: 0 },
    2: { delay: 0, reverb: 0, saturation: 0, chorus: 0 },
    3: { delay: 0, reverb: 0, saturation: 0, chorus: 0 },
    4: { delay: 0, reverb: 0, saturation: 0, chorus: 0 }
};

// Note frequencies for piano keyboard
const noteFreqs = {
    'C': 261.63, 'C#': 277.18, 'D': 293.66, 'D#': 311.13,
    'E': 329.63, 'F': 349.23, 'F#': 369.99, 'G': 392.00,
    'G#': 415.30, 'A': 440.00, 'A#': 466.16, 'B': 493.88
};

// Scale definitions (notes in each scale)
const scales = {
    major: ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C'],
    minor: ['C', 'D', 'D#', 'F', 'G', 'G#', 'A#', 'C']
};

// Global effects processor
let effectsProcessor = null;

// Initialize audio context
async function initAudio() {
    try {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)({
                latencyHint: 'interactive',
                sampleRate: 44100
            });
            console.log('✅ Audio context created with low latency settings');
            
            // Initialize effects processor with proper routing
            effectsProcessor = createEffectsProcessor(audioContext);
            console.log('✅ Effects processor initialized');
            
            // Initialize drum sampler
            drumSampler = new DrumSampler(audioContext);
            console.log('✅ Drum sampler initialized');
            
            // Load drum kit asynchronously (don't wait for it)
            drumSampler.loadCurrentKit().catch(error => {
                console.error('⚠️ Failed to load drum kit, but continuing:', error);
            });
            
            // Update drum button immediately after creating sampler
            const drumButton = document.getElementById('instrument-drums');
            if (drumButton) {
                drumButton.textContent = 'Kit 1';
                drumButton.title = 'Drum Kit 1';
                console.log('✅ Drum button updated to Kit 1');
            }
        }
        if (audioContext.state === 'suspended') {
            await audioContext.resume();
            console.log('✅ Audio context resumed');
        }
        console.log('🎵 Audio context state:', audioContext.state);
        return true;
    } catch (error) {
        console.error('❌ Audio initialization failed:', error);
        return false;
    }
}

// Create effects processor (based on working effects module)
function createEffectsProcessor(audioContext) {
    console.log('🎛️ Creating effects processor...');
    
    const processor = {
        audioContext: audioContext,
        
        // Main routing nodes
        inputGain: audioContext.createGain(),
        outputGain: audioContext.createGain(),
        dryGain: audioContext.createGain(),
        wetGain: audioContext.createGain(),
        
        // Effects storage
        effects: {
            delay: null,
            reverb: null,
            saturation: null,
            filter: null
        }
    };
    
    // Set initial gains
    processor.inputGain.gain.value = 1.0;
    processor.outputGain.gain.value = 1.0;
    processor.dryGain.gain.value = 0.7;
    processor.wetGain.gain.value = 0.0;
    
    // Setup routing: input splits to dry and wet paths
    processor.inputGain.connect(processor.dryGain);
    processor.inputGain.connect(processor.wetGain);
    processor.dryGain.connect(processor.outputGain);
    processor.outputGain.connect(audioContext.destination);
    
    // Create MUSICAL TAPE/DIGITAL DELAY with proper feedback
    const delay = audioContext.createDelay(5.0);
    const delayFeedback = audioContext.createGain();
    const delayWetGain = audioContext.createGain();
    const delayInputGain = audioContext.createGain();
    const delayDryGain = audioContext.createGain();
    const delayMixGain = audioContext.createGain();
    
    // High-cut filter in feedback loop (tape-style degradation)
    const delayFilter = audioContext.createBiquadFilter();
    delayFilter.type = 'lowpass';
    delayFilter.frequency.value = 2500; // Roll off highs
    delayFilter.Q.value = 0.5;
    
    // Set initial values for EXAGGERATED DIGITAL DELAY
    delay.delayTime.value = 0.375; // 375ms for rhythmic effect
    delayFeedback.gain.value = 0.9;     // 90% feedback for MANY repeats
    delayWetGain.gain.value = 0.8;      // Stronger wet signal
    delayFilter.frequency.value = 3500;  // Less filtering for digital clarity
    delayInputGain.gain.value = 1.0;
    delayDryGain.gain.value = 1.0;
    
    // Build proper delay network
    // Input -> [Dry path] -> Mix
    //       -> Delay -> Filter -> Feedback -> Delay (loop)
    //                -> Wet -> Mix
    delayInputGain.connect(delayDryGain);
    delayDryGain.connect(delayMixGain);
    
    delayInputGain.connect(delay);
    delay.connect(delayFilter);
    delayFilter.connect(delayFeedback);
    delayFeedback.connect(delay); // Feedback loop
    
    delay.connect(delayWetGain);
    delayWetGain.connect(delayMixGain);
    
    processor.effects.delay = {
        input: delayInputGain,
        output: delayMixGain,
        delayNode: delay,
        feedbackNode: delayFeedback,
        wetGainNode: delayWetGain,
        filterNode: delayFilter,
        dryGain: delayDryGain
    };
    
    // Create RICH HALL/PLATE STYLE REVERB
    const convolver = audioContext.createConvolver();
    const reverbWetGain = audioContext.createGain();
    const reverbInputGain = audioContext.createGain();
    const preDelay = audioContext.createDelay(1.0);
    
    reverbWetGain.gain.value = 1.0;
    reverbInputGain.gain.value = 1.0;
    preDelay.delayTime.value = 0.03; // 30ms pre-delay for clarity
    
    // Create DREAMY reverb impulse response
    const length = audioContext.sampleRate * 4.5; // 4.5 seconds for dreamy tail
    const impulse = audioContext.createBuffer(2, length, audioContext.sampleRate);
    
    for (let channel = 0; channel < 2; channel++) {
        const channelData = impulse.getChannelData(channel);
        
        // Soft early reflections for dreaminess
        const earlyTime = Math.floor(audioContext.sampleRate * 0.15);
        const reflectionTimes = [0.01, 0.02, 0.03, 0.05, 0.07, 0.09, 0.11, 0.13];
        
        for (const time of reflectionTimes) {
            const sample = Math.floor(time * audioContext.sampleRate);
            if (sample < earlyTime) {
                const gain = 0.5 * Math.pow(0.85, reflectionTimes.indexOf(time));
                // Softer reflections for dreaminess
                channelData[sample] = (Math.random() * 2 - 1) * gain * 0.7;
            }
        }
        
        // Dreamy late reverb - very smooth and lush
        for (let i = earlyTime; i < length; i++) {
            const t = (i - earlyTime) / (length - earlyTime);
            // Slower, smoother decay for dreaminess
            const decay = Math.pow(1 - t, 1.2);
            
            // Lush reverb tail
            let sample = (Math.random() * 2 - 1) * decay * 0.35;
            
            // Heavy modulation for shimmer and movement
            const modFreq1 = 0.3 + channel * 0.15;
            const modFreq2 = 1.7 + channel * 0.2;
            const modulation = 1 + 0.04 * Math.sin(2 * Math.PI * modFreq1 * i / audioContext.sampleRate)
                                  + 0.02 * Math.sin(2 * Math.PI * modFreq2 * i / audioContext.sampleRate);
            sample *= modulation;
            
            // Wide stereo image
            if (channel === 1) {
                sample *= 1.1;
                // Cross-feed for width
                if (i > 20) {
                    sample = sample * 0.6 + channelData[i - 20] * 0.4;
                }
            }
            
            // High frequency damping for warmth
            if (i > audioContext.sampleRate * 0.5) {
                const dampingFactor = Math.exp(-(i - audioContext.sampleRate * 0.5) / (audioContext.sampleRate * 2));
                sample *= dampingFactor;
            }
            
            channelData[i] = sample;
        }
    }
    
    convolver.buffer = impulse;
    
    // Connect with pre-delay for clarity
    reverbInputGain.connect(preDelay);
    preDelay.connect(convolver);
    convolver.connect(reverbWetGain);
    
    processor.effects.reverb = {
        input: reverbInputGain,
        output: reverbWetGain,
        convolverNode: convolver,
        wetGainNode: reverbWetGain,
        preDelayNode: preDelay
    };
    
    // Create saturation effect
    const waveshaper = audioContext.createWaveShaper();
    const satInputGain = audioContext.createGain();
    const satOutputGain = audioContext.createGain();
    
    satInputGain.gain.value = 1.0;
    satOutputGain.gain.value = 1.0;
    
    // Distortion curve
    const makeCurve = (amount) => {
        const samples = 44100;
        const curve = new Float32Array(samples);
        const deg = Math.PI / 180;
        
        for (let i = 0; i < samples; i++) {
            const x = (i * 2) / samples - 1;
            curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
        }
        return curve;
    };
    
    waveshaper.curve = makeCurve(0);
    waveshaper.oversample = '4x';
    
    satInputGain.connect(waveshaper);
    waveshaper.connect(satOutputGain);
    
    processor.effects.saturation = {
        input: satInputGain,
        output: satOutputGain,
        waveshaperNode: waveshaper,
        makeCurve: makeCurve
    };
    
    // Create filter effect (chorus)
    const filter = audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 2000;
    filter.Q.value = 1;
    
    processor.effects.filter = {
        input: filter,
        output: filter,
        filterNode: filter
    };
    
    // Connect effects chain: wet → delay → reverb → saturation → filter → output
    let currentNode = processor.wetGain;
    const effectOrder = ['delay', 'reverb', 'saturation', 'filter'];
    
    for (const effectName of effectOrder) {
        const effect = processor.effects[effectName];
        if (effect) {
            currentNode.connect(effect.input);
            currentNode = effect.output;
        }
    }
    
    currentNode.connect(processor.outputGain);
    
    console.log('✅ Effects processor created with chain: wet → delay → reverb → saturation → filter → output');
    
    return processor;
}

// Enable audio on first user interaction
let audioEnabled = false;
async function enableAudio() {
    if (!audioEnabled) {
        const success = await initAudio();
        if (success) {
            audioEnabled = true;
            console.log('🎵 Audio enabled!');
        }
    }
}

// Track active audio nodes to prevent overload
let activeAudioNodes = 0;
const MAX_AUDIO_NODES = 30; // Increased for better polyphony

// Cleanup old nodes periodically
setInterval(() => {
    if (activeAudioNodes > 20) {
        console.log('⚠️ High audio node count:', activeAudioNodes, '- forcing cleanup');
        activeAudioNodes = Math.max(0, activeAudioNodes - 5);
    }
}, 2000);

// Enhanced note playing with individual instrument settings
function playNote(frequency, instrument = currentInstrument, velocity = 0.8) {
    if (!audioContext) {
        console.error('No audio context available');
        return;
    }
    
    // Prevent audio overload
    if (activeAudioNodes >= MAX_AUDIO_NODES) {
        console.warn('Audio node limit reached, skipping note');
        return;
    }
    
    if (audioContext.state === 'suspended') {
        console.log('Audio context suspended, resuming...');
        audioContext.resume();
    }
    
    const instrConfig = instrumentSounds[instrument];
    const soundConfig = instrConfig.sounds[instrConfig.currentSound];
    const adsr = instrumentADSR[instrument];
    const effects = instrumentEffects[instrument];
    
    // Special handling for drum machine (instrument 4)
    if (instrConfig.isDrumMachine) {
        playDrumSound(soundConfig, velocity, instrument);
        return;
    }
    
    // Create oscillator
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    // Track this audio node
    activeAudioNodes++;
    
    // Create panner for stereo positioning
    const pannerNode = audioContext.createStereoPanner();
    pannerNode.pan.setValueAtTime(instrumentPans[instrument] || 0, audioContext.currentTime);
    
    // Route through effects processor
    oscillator.connect(gainNode);
    
    // Use effects processor if available
    if (effectsProcessor) {
        // Update effects based on current instrument settings
        const effects = instrumentEffects[instrument];
        
        // Update wet/dry mix based on any active effect
        const maxWet = Math.max(effects.delay, effects.reverb, effects.saturation, effects.chorus);
        effectsProcessor.wetGain.gain.setValueAtTime(maxWet, audioContext.currentTime);
        effectsProcessor.dryGain.gain.setValueAtTime(1 - maxWet * 0.5, audioContext.currentTime);
        
        // Update individual effects with proper wet/dry mix per effect
        
        // Delay (A slider)
        if (effects.delay > 0 && effectsProcessor.effects.delay) {
            const delayNode = effectsProcessor.effects.delay.delayNode;
            const feedbackNode = effectsProcessor.effects.delay.feedbackNode;
            const wetGainNode = effectsProcessor.effects.delay.wetGainNode;
            
            // Set delay parameters
            delayNode.delayTime.setValueAtTime(0.375, audioContext.currentTime); // Fixed musical delay
            feedbackNode.gain.setValueAtTime(0.65, audioContext.currentTime); // High feedback
            if (wetGainNode) {
                wetGainNode.gain.setValueAtTime(effects.delay * 0.7, audioContext.currentTime); // Mix amount
            }
        }
        
        // Reverb (B slider)
        if (effects.reverb > 0 && effectsProcessor.effects.reverb) {
            const wetGainNode = effectsProcessor.effects.reverb.wetGainNode;
            if (wetGainNode) {
                wetGainNode.gain.setValueAtTime(effects.reverb, audioContext.currentTime);
            }
        }
        
        // Saturation (C slider)
        if (effects.saturation > 0 && effectsProcessor.effects.saturation) {
            const makeCurve = effectsProcessor.effects.saturation.makeCurve;
            if (makeCurve) {
                effectsProcessor.effects.saturation.waveshaperNode.curve = makeCurve(effects.saturation * 50);
            }
            // Compensate gain for saturation
            const outputGain = effectsProcessor.effects.saturation.outputGain;
            if (outputGain) {
                outputGain.gain.setValueAtTime(1 - (effects.saturation * 0.3), audioContext.currentTime);
            }
        }
        
        // Chorus/Filter (D slider)
        if (effects.chorus > 0 && effectsProcessor.effects.filter) {
            const filterNode = effectsProcessor.effects.filter.filterNode;
            filterNode.frequency.setValueAtTime(200 + (effects.chorus * 3800), audioContext.currentTime);
            filterNode.Q.setValueAtTime(1 + (effects.chorus * 10), audioContext.currentTime);
        }
        
        // Connect through effects processor
        gainNode.connect(pannerNode);
        pannerNode.connect(effectsProcessor.inputGain);
        
        console.log(`🎵 Using effects processor - D:${effects.delay.toFixed(2)} R:${effects.reverb.toFixed(2)} S:${effects.saturation.toFixed(2)} C:${effects.chorus.toFixed(2)}`);
        
        // Skip the old inline effects code
        const skipOldEffects = true;
        if (skipOldEffects) {
            // Set oscillator properties
            oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
            oscillator.type = soundConfig.type;
            
            // Apply ADSR envelope
            const now = audioContext.currentTime;
            const totalDuration = adsr.attack + adsr.decay + adsr.release;
            const finalVolume = soundConfig.volume * velocity * (instrumentVolumes[instrument] || 0.8);
            
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(finalVolume, now + adsr.attack);
            gainNode.gain.linearRampToValueAtTime(finalVolume * adsr.sustain, now + adsr.attack + adsr.decay);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + totalDuration);
            
            oscillator.start(now);
            oscillator.stop(now + totalDuration);
            
            // Clean up node tracking and disconnect nodes
            oscillator.addEventListener('ended', () => {
                activeAudioNodes = Math.max(0, activeAudioNodes - 1);
                setTimeout(() => {
                    try {
                        oscillator.disconnect();
                        gainNode.disconnect();
                        pannerNode.disconnect();
                    } catch (e) {
                        // Ignore disconnection errors
                    }
                }, 100);
            });
            
            console.log(`🎵 Playing ${frequency}Hz on instrument ${instrument} (${soundConfig.name})`);
            return;
        }
    }
    
    // Fallback to old inline effects (only if effects processor not available)
    let currentNode = gainNode;
    
    // Delay effect
    if (effects.delay > 0) {
        const delayNode = audioContext.createDelay();
        const delayGain = audioContext.createGain();
        const feedbackGain = audioContext.createGain();
        
        delayNode.delayTime.setValueAtTime(0.2 + (0.3 * effects.delay), audioContext.currentTime);
        delayGain.gain.setValueAtTime(0.4 * effects.delay, audioContext.currentTime);
        feedbackGain.gain.setValueAtTime(0.3 * effects.delay, audioContext.currentTime);
        
        // Create delay feedback loop
        currentNode.connect(delayNode);
        delayNode.connect(feedbackGain);
        feedbackGain.connect(delayNode); // Feedback
        delayNode.connect(delayGain);
        
        // Mix dry and wet signals
        const mixNode = audioContext.createGain();
        currentNode.connect(mixNode); // Dry signal
        delayGain.connect(mixNode); // Wet signal
        currentNode = mixNode;
    }
    
    // Reverb effect (improved algorithm)
    if (effects.reverb > 0) {
        try {
            const convolver = audioContext.createConvolver();
            const length = audioContext.sampleRate * 1.5; // 1.5 second reverb
            const impulse = audioContext.createBuffer(2, length, audioContext.sampleRate);
            
            for (let channel = 0; channel < 2; channel++) {
                const channelData = impulse.getChannelData(channel);
                for (let i = 0; i < length; i++) {
                    // Better reverb algorithm with exponential decay
                    const decay = Math.pow(1 - i / length, 2);
                    channelData[i] = (Math.random() * 2 - 1) * decay * 0.3;
                    
                    // Add some early reflections
                    if (i < audioContext.sampleRate * 0.1) {
                        channelData[i] *= 1.5;
                    }
                }
            }
            
            convolver.buffer = impulse;
            
            const reverbGain = audioContext.createGain();
            reverbGain.gain.setValueAtTime(effects.reverb * 0.4, audioContext.currentTime);
            
            // Mix dry and wet with proper gain staging
            const dryGain = audioContext.createGain();
            const wetGain = audioContext.createGain();
            const mixNode = audioContext.createGain();
            
            dryGain.gain.setValueAtTime(1 - (effects.reverb * 0.5), audioContext.currentTime);
            wetGain.gain.setValueAtTime(effects.reverb, audioContext.currentTime);
            
            currentNode.connect(dryGain);
            dryGain.connect(mixNode);
            
            currentNode.connect(convolver);
            convolver.connect(wetGain);
            wetGain.connect(mixNode);
            
            currentNode = mixNode;
        } catch (e) {
            console.error('Reverb creation failed:', e);
        }
    }
    
    // Saturation effect (fixed for proper distortion)
    if (effects.saturation > 0) {
        const waveshaper = audioContext.createWaveShaper();
        const makeDistortionCurve = (amount) => {
            const samples = 44100;
            const curve = new Float32Array(samples);
            const deg = Math.PI / 180;
            
            for (let i = 0; i < samples; i++) {
                const x = (i * 2) / samples - 1;
                curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
            }
            return curve;
        };
        
        waveshaper.curve = makeDistortionCurve(effects.saturation * 50);
        waveshaper.oversample = '4x';
        
        // Add makeup gain to compensate for volume loss
        const makeupGain = audioContext.createGain();
        makeupGain.gain.setValueAtTime(0.7 + (effects.saturation * 0.3), audioContext.currentTime);
        
        currentNode.connect(waveshaper);
        waveshaper.connect(makeupGain);
        currentNode = makeupGain;
    }
    
    // Chorus effect
    if (effects.chorus > 0) {
        const chorusDelay = audioContext.createDelay();
        const lfo = audioContext.createOscillator();
        const lfoGain = audioContext.createGain();
        
        chorusDelay.delayTime.value = 0.02;
        lfo.frequency.value = 3 + (effects.chorus * 5);
        lfoGain.gain.value = 0.002 * effects.chorus;
        
        lfo.connect(lfoGain);
        lfoGain.connect(chorusDelay.delayTime);
        
        const chorusGain = audioContext.createGain();
        chorusGain.gain.setValueAtTime(0.5 * effects.chorus, audioContext.currentTime);
        
        // Mix dry and wet
        const mixNode = audioContext.createGain();
        currentNode.connect(mixNode); // Dry
        currentNode.connect(chorusDelay);
        chorusDelay.connect(chorusGain);
        chorusGain.connect(mixNode); // Wet
        
        lfo.start();
        currentNode = mixNode;
    }
    
    // Connect final node to panner then to destination
    currentNode.connect(pannerNode);
    pannerNode.connect(audioContext.destination);
    
    // Set oscillator properties
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    oscillator.type = soundConfig.type;
    
    // Apply ADSR envelope
    const now = audioContext.currentTime;
    const totalDuration = adsr.attack + adsr.decay + adsr.release;
    const finalVolume = soundConfig.volume * velocity * (instrumentVolumes[instrument] || 0.8);
    
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(finalVolume, now + adsr.attack);
    gainNode.gain.linearRampToValueAtTime(finalVolume * adsr.sustain, now + adsr.attack + adsr.decay);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + totalDuration);
    
    oscillator.start(now);
    oscillator.stop(now + totalDuration);
    
    // Clean up node tracking and disconnect nodes
    oscillator.addEventListener('ended', () => {
        activeAudioNodes = Math.max(0, activeAudioNodes - 1);
        // Disconnect all nodes to free resources
        setTimeout(() => {
            try {
                oscillator.disconnect();
                gainNode.disconnect();
                pannerNode.disconnect();
            } catch (e) {
                // Ignore disconnection errors
            }
        }, 100);
    });
    
    console.log(`🎵 Playing ${frequency}Hz on instrument ${instrument} (${soundConfig.name})`);
}

// Special drum sound synthesis
function playDrumSound(soundConfig, velocity, instrument) {
    if (!audioContext) return;
    
    // Use drum sampler if available
    console.log('playDrumSound called:', soundConfig.name, 'track:', soundConfig.track, 'drumSampler:', drumSampler);
    if (drumSampler && Object.keys(drumSampler.buffers).length > 0) {
        // Use track index directly if provided
        const rowIndex = soundConfig.track !== undefined ? soundConfig.track : 0;
        console.log('Using track index:', rowIndex);
        
        if (rowIndex >= 0 && rowIndex < drumSampler.drumMap.length) {
            const pan = instrumentPans[instrument] || 0;
            const effects = instrumentEffects[instrument] || {};
            drumSampler.playDrum(rowIndex, velocity, pan, effects);
            return;
        }
    } else {
        console.log('Drum sampler not ready or no buffers loaded');
    }
    
    const finalVolume = soundConfig.volume * velocity * (instrumentVolumes[instrument] || 0.8);
    const duration = soundConfig.decay;
    
    // Create panner for stereo positioning
    const pannerNode = audioContext.createStereoPanner();
    pannerNode.pan.setValueAtTime(instrumentPans[instrument] || 0, audioContext.currentTime);
    
    if (soundConfig.noise) {
        // Create noise-based drum sounds (snare, hi-hat, etc.)
        const bufferSize = audioContext.sampleRate * duration;
        const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        
        // Generate filtered noise
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        
        const noiseSource = audioContext.createBufferSource();
        noiseSource.buffer = noiseBuffer;
        
        // Create filter for shaping the noise
        const filter = audioContext.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(soundConfig.freq, audioContext.currentTime);
        filter.Q.setValueAtTime(10, audioContext.currentTime);
        
        const gainNode = audioContext.createGain();
        gainNode.gain.setValueAtTime(finalVolume, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        
        noiseSource.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(pannerNode);
        pannerNode.connect(audioContext.destination);
        
        noiseSource.start(audioContext.currentTime);
        noiseSource.stop(audioContext.currentTime + duration);
        
    } else {
        // Create tonal drum sounds (kick, tom)
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.type = soundConfig.type;
        oscillator.frequency.setValueAtTime(soundConfig.freq, audioContext.currentTime);
        
        // Quick frequency sweep for kick drums
        if (soundConfig.name === 'Kick') {
            oscillator.frequency.exponentialRampToValueAtTime(40, audioContext.currentTime + 0.1);
        }
        
        gainNode.gain.setValueAtTime(finalVolume, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        
        oscillator.connect(gainNode);
        gainNode.connect(pannerNode);
        pannerNode.connect(audioContext.destination);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    }
    
    console.log(`🥁 Playing drum: ${soundConfig.name}`);
}

// Update drum grid color based on current kit
function updateDrumGridColor() {
    if (!drumSampler) return;
    
    const grid = document.getElementById('sequencer-grid');
    if (!grid) return;
    
    // Remove all kit-specific classes
    grid.classList.remove('kit-1', 'kit-2', 'kit-3', 'kit-4');
    
    // Add current kit class
    const currentKit = drumSampler.currentKit;
    grid.classList.add(`kit-${currentKit}`);
    
    
    console.log(`🎨 Updated grid color for Kit ${currentKit}`);
}



// Cycle through instrument sounds
function cycleInstrumentSound(instrumentNum) {
    // Special handling for drums - cycle kits
    if (instrumentNum === 4 && drumSampler) {
        drumSampler.cycleKit().then(newKit => {
            console.log(`🔄 Drums switched to Kit ${newKit}`);
            updateInstrumentDisplay(instrumentNum);
            updateDrumGridColor(); // Update grid color when kit changes
            
            // No sound playback when cycling kits
        });
        return;
    }
    
    const instrument = instrumentSounds[instrumentNum];
    instrument.currentSound = (instrument.currentSound + 1) % instrument.sounds.length;
    
    const currentSound = instrument.sounds[instrument.currentSound];
    console.log(`🔄 Instrument ${instrumentNum} switched to: ${currentSound.name}`);
    
    // Update UI to show current sound name
    updateInstrumentDisplay(instrumentNum);
    
    // Play a test note to hear the new sound
    playNote(440, instrumentNum);
}

// Update instrument display
function updateInstrumentDisplay(instrumentNum) {
    const button = document.getElementById(`instrument-${getInstrumentName(instrumentNum)}`);
    console.log(`Updating display for instrument ${instrumentNum}, button:`, button, 'drumSampler:', drumSampler);
    
    if (button) {
        if (instrumentNum === 4 && drumSampler) {
            // Show kit name for drums
            const kitName = drumSampler.getCurrentKitName();
            console.log(`Setting drum button to: ${kitName}`);
            button.textContent = kitName;
            button.title = `Drum ${kitName}`;
        } else {
            const currentSound = instrumentSounds[instrumentNum].sounds[instrumentSounds[instrumentNum].currentSound];
            button.title = `${getInstrumentName(instrumentNum)}: ${currentSound.name}`;
            // Keep number display for other instruments
            button.textContent = instrumentNum.toString();
        }
    } else {
        console.error(`Button not found for instrument ${instrumentNum}`);
    }
}

function getInstrumentName(num) {
    const names = { 1: 'synth', 2: 'bass', 3: 'keys', 4: 'drums' };
    return names[num] || 'synth';
}

// Create sequencer grid with individual instrument sequences
function createSequencerGrid() {
    const gridContainer = document.getElementById('sequencer-grid');
    if (!gridContainer) return;
    
    gridContainer.innerHTML = '';
    
    // Create 8 tracks × 16 steps grid
    for (let track = 0; track < 8; track++) {
        for (let step = 0; step < 16; step++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            // Add beat marker class for every 4th step (0, 4, 8, 12)
            if (step % 4 === 0) {
                cell.classList.add('beat-marker');
            }
            cell.dataset.track = track;
            cell.dataset.step = step;
            
            cell.addEventListener('click', async (event) => {
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();
                await enableAudio(); // Enable audio on first interaction
                
                console.log(`Grid clicked: track ${track}, step ${step}`);
                
                // Prevent multiple rapid clicks
                if (cell.dataset.clicking === 'true') return;
                cell.dataset.clicking = 'true';
                setTimeout(() => cell.dataset.clicking = 'false', 100);
                
                // Handle click based on mode
                if (mixerMode) {
                    handleMixerClick(track, step);
                } else {
                    toggleSequencerCell(track, step);
                }
            });
            
            gridContainer.appendChild(cell);
        }
    }
    
    updateSequencerDisplay();
    console.log('✅ Enhanced sequencer grid created');
}

// Toggle sequencer cell for current instrument and pattern
function toggleSequencerCell(track, step) {
    const pattern = patterns[currentPattern];
    const instrumentData = pattern[currentInstrument];
    
    if (instrumentData && instrumentData[track] && instrumentData[track][step]) {
        const wasActive = instrumentData[track][step].active;
        instrumentData[track][step].active = !wasActive;
        updateSequencerDisplay();
        
        // Play note only when activating (not when deactivating) and when sequencer is not playing
        if (!wasActive && instrumentData[track][step].active && !isPlaying) {
            if (currentInstrument === 4) {
                // For drums, use track to select drum sound from DrumSampler
                if (drumSampler && track < drumSampler.drumMap.length) {
                    const drumType = drumSampler.drumMap[track];
                    const drumSound = { name: drumType, track: track };
                    console.log(`Preview drum: track ${track}, drumType: ${drumType}`);
                    playDrumSound(drumSound, 0.8, currentInstrument);
                }
            } else {
                // For other instruments, use musical notes
                const notes = scales[currentScale];
                const note = notes[track % 8]; // Use track (row) for note pitch
                const frequency = noteFreqs[note] * Math.pow(2, instrumentOctaves[currentInstrument]);
                playNote(frequency, currentInstrument);
            }
        }
    }
}

// Update sequencer display for current instrument and pattern
// Helper function to get darker shade of a color
function getDarkerShade(color) {
    // Convert hex to RGB
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    // Darken by 30%
    const factor = 0.7;
    const rDark = Math.floor(r * factor);
    const gDark = Math.floor(g * factor);
    const bDark = Math.floor(b * factor);
    
    // Convert back to hex
    return `#${rDark.toString(16).padStart(2, '0')}${gDark.toString(16).padStart(2, '0')}${bDark.toString(16).padStart(2, '0')}`;
}

function updateSequencerDisplay() {
    const cells = document.querySelectorAll('.grid-cell');
    const grid = document.getElementById('sequencer-grid');
    
    console.log('🔄 updateSequencerDisplay - mixerMode is:', mixerMode);
    
    if (mixerMode) {
        console.log('🎛️ Showing MIXER mode');
        // Add purple background for mixer mode - force remove all instrument modes
        if (grid) {
            grid.classList.remove('instrument-1-mode', 'instrument-2-mode', 'instrument-3-mode', 'instrument-4-mode');
            grid.classList.add('mixer-mode');
            // Force purple background in mixer mode
            grid.style.setProperty('background', '#DDA0DD', 'important');
        }
    } else {
        console.log('🎵 Showing SEQUENCER mode');
        // Remove mixer mode and add instrument-specific background
        if (grid) {
            grid.classList.remove('mixer-mode');
            grid.classList.remove('instrument-1-mode', 'instrument-2-mode', 'instrument-3-mode', 'instrument-4-mode');
            grid.classList.add(`instrument-${currentInstrument}-mode`);
            // Remove forced background from mixer mode
            grid.style.removeProperty('background');
        }
    }
    
    if (mixerMode) {
        // MIXER MODE: Tetris-style vertical bars
        cells.forEach(cell => {
            const col = parseInt(cell.dataset.step);
            const row = parseInt(cell.dataset.track);
            
            // Remove all classes and reset to purple background
            cell.classList.remove('active', 'playing', 'muted', 'soloed', 'instrument-1', 'instrument-2', 'instrument-3', 'instrument-4');
            cell.style.removeProperty('background-color');
            cell.style.removeProperty('opacity');
            cell.style.removeProperty('border');
            cell.style.removeProperty('border-color');
            // Force purple background on all cells in mixer mode
            cell.style.setProperty('background-color', '#DDA0DD', 'important');
            // Force standard grid border to remove colored outlines
            cell.style.setProperty('border', '2px solid', 'important');
            cell.style.setProperty('border-color', '#ffffff #808080 #808080 #ffffff', 'important');
            
            // Column mapping:
            // 0-2: Instruments 1-3
            // 3-10: Drum sounds (all yellow)
            // 11-15: Empty
            
            if (col < 3) {
                // Instruments 1-3 - show solid track colors
                const instrumentNum = col + 1;
                const volume = mixerStates.volumes[col] || 0.8;
                const volumeHeight = Math.floor(volume * 8);
                
                if (row >= (8 - volumeHeight)) {
                    // Don't add instrument classes in mixer mode to avoid colored borders
                    cell.classList.add('active');
                    
                    // Different colors for each track in mixer
                    let trackColor;
                    if (instrumentNum === 1) trackColor = '#FFB6C1'; // Pink for Synth
                    else if (instrumentNum === 2) trackColor = '#87CEEB'; // Blue for Bass
                    else if (instrumentNum === 3) trackColor = '#DDA0DD'; // Purple for Keys
                    
                    cell.style.setProperty('background-color', trackColor, 'important');
                    cell.style.setProperty('opacity', '1', 'important');
                }
            } else if (col >= 3 && col < 11) {
                // Drums - each column matches its drum row color
                const drumRowIndex = col - 3; // Column 3 = drum row 0, Column 4 = drum row 1, etc.
                const volume = mixerStates.volumes[col] || 0.8;
                const volumeHeight = Math.floor(volume * 8);
                
                if (row >= (8 - volumeHeight)) {
                    // Don't add instrument classes in mixer mode to avoid colored borders
                    cell.classList.add('active');
                    
                    // Different colors for each drum sound in mixer - NO OUTLINES
                    let drumColor;
                    if (drumRowIndex === 0) drumColor = '#F0E68C'; // Yellow - Kick (swapped)
                    else if (drumRowIndex === 1) drumColor = '#87CEEB'; // Blue - Snare
                    else if (drumRowIndex === 2) drumColor = '#98FB98'; // Green - Hi-hat
                    else if (drumRowIndex === 3) drumColor = '#FFD4E1'; // Light pink - Tom 1
                    else if (drumRowIndex === 4) drumColor = '#DDA0DD'; // Purple - Tom 2
                    else if (drumRowIndex === 5) drumColor = '#AFEEEE'; // Teal - Tom 3
                    else if (drumRowIndex === 6) drumColor = '#FFB3BA'; // Pastel red - Crash (swapped)
                    else if (drumRowIndex === 7) drumColor = '#FFA07A'; // Coral - Ride
                    
                    cell.style.setProperty('background-color', drumColor, 'important');
                    cell.style.setProperty('opacity', '1', 'important');
                }
            }
            // Columns 11-15 stay empty/green
        });
    } else {
        // SEQUENCER MODE: Normal display
        console.log('🎵 SEQUENCER MODE - clearing mixer styles');
        
        const pattern = patterns[currentPattern];
        const instrumentData = pattern[currentInstrument];
        
        // Clear ALL classes and styles first (but preserve beat marker colors)
        cells.forEach(cell => {
            // Remove all possible classes
            cell.classList.remove('active', 'playing', 'muted', 'soloed', 'instrument-1', 'instrument-2', 'instrument-3', 'instrument-4');
            // Remove any forced styles from mixer mode
            cell.style.removeProperty('background-color');
            cell.style.removeProperty('opacity');
            cell.style.removeProperty('border');
            cell.style.removeProperty('border-color');
        });
        
        cells.forEach(cell => {
            const step = parseInt(cell.dataset.step);
            const track = parseInt(cell.dataset.track);
            
            // FIXED: Remove ALL instrument classes first to prevent color bleeding
            cell.classList.remove('instrument-1', 'instrument-2', 'instrument-3', 'instrument-4');
            
            
            // Add the current instrument class ONLY to active cells
            if (instrumentData && instrumentData[track] && instrumentData[track][step] && instrumentData[track][step].active) {
                cell.classList.add('active');
                cell.classList.add(`instrument-${currentInstrument}`);
                
                // Force drum colors for active cells in instrument 4
                if (currentInstrument === 4) {
                    const drumColors = {
                        0: '#FFA500', // Orange - Kick
                        1: '#00BFFF', // Blue - Snare  
                        2: '#00FF00', // Lime - Hi-hat
                        3: '#FFD6E0', // Light pink - Hat 2
                        4: '#DDA0DD', // Purple - Perc 1
                        5: '#AFEEEE', // Teal - Perc 2
                        6: '#F0E68C', // Yellow - Perc 3
                        7: '#FF69B4'  // Hot Pink - Perc 4 (changed from peach)
                    };
                    
                    if (drumColors[track]) {
                        cell.style.setProperty('background-color', drumColors[track], 'important');
                        // Fix the outline color to match the cell color
                        const darkerShade = getDarkerShade(drumColors[track]);
                        cell.style.setProperty('border-color', `${darkerShade} ${darkerShade} ${darkerShade} ${darkerShade}`, 'important');
                    }
                }
                
            } else {
                cell.classList.remove('active');
                
                // For beat markers when not active, show beat marker color
                if (currentInstrument === 4 && cell.classList.contains('beat-marker')) {
                    const beatMarkerColors = {
                        1: '#FFE0CC', // Light peach for Kit 1
                        2: '#B8FFB8', // Light green for Kit 2  
                        3: '#FFF4A3', // Light yellow for Kit 3
                        4: '#C6E2FF'  // Light blue for Kit 4
                    };
                    
                    if (drumSampler) {
                        const currentKit = drumSampler.currentKit;
                        cell.style.setProperty('background-color', beatMarkerColors[currentKit], 'important');
                    }
                }
            }
            
            // Highlight current playing step across all rows
            if (isPlaying && step === currentStep) {
                cell.classList.add('playing');
            } else {
                cell.classList.remove('playing');
            }
        });
    }
}

// Pattern switching
function switchPattern(patternNum) {
    currentPattern = patternNum;
    
    // Update pattern buttons
    document.querySelectorAll('.pattern-button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const activeButton = document.querySelector(`[data-pattern="${patternNum}"]`);
    if (activeButton) {
        activeButton.classList.add('active');
    }
    
    updateSequencerDisplay();
    console.log(`🔄 Switched to pattern ${patternNum}`);
}

// Duplicate current pattern to another slot
function duplicatePatternTo(targetPattern) {
    const sourcePattern = patterns[currentPattern];
    
    // Deep copy all instrument data from current pattern to target
    patterns[targetPattern] = {
        1: JSON.parse(JSON.stringify(sourcePattern[1])), // Synth
        2: JSON.parse(JSON.stringify(sourcePattern[2])), // Bass
        3: JSON.parse(JSON.stringify(sourcePattern[3])), // Keys
        4: JSON.parse(JSON.stringify(sourcePattern[4]))  // Drums
    };
    
    console.log(`📋 Duplicated pattern ${currentPattern} to pattern ${targetPattern}`);
    
    // Switch to the new pattern
    switchPattern(targetPattern);
}

// Instrument switching
function switchInstrument(instrumentNum) {
    currentInstrument = instrumentNum;
    
    // Update instrument buttons
    document.querySelectorAll('.instrument-button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const activeButton = document.getElementById(`instrument-${getInstrumentName(instrumentNum)}`);
    if (activeButton) {
        activeButton.classList.add('active');
    }
    
    // Update ADSR and effects displays for current instrument
    updateADSRDisplay();
    updateEffectsDisplay();
    updateSequencerDisplay();
    
    // Update grid color for drums based on current kit
    if (instrumentNum === 4) {
        updateDrumGridColor();
    }
    
    console.log(`🔄 Switched to instrument ${instrumentNum}`);
}

// Random pattern generation for current instrument only
function addRandomSteps() {
    const pattern = patterns[currentPattern];
    const instrumentData = pattern[currentInstrument];
    
    if (instrumentData) {
        // First, clear all existing steps for this instrument
        for (let track = 0; track < 8; track++) {
            for (let step = 0; step < 16; step++) {
                if (instrumentData[track] && instrumentData[track][step]) {
                    instrumentData[track][step].active = false;
                }
            }
        }
        
        if (currentInstrument === 4) {
            // Drums: Add many more steps (30-50% of grid)
            const numSteps = Math.floor(Math.random() * 31) + 30; // 30-60 steps
            
            for (let i = 0; i < numSteps; i++) {
                const randomTrack = Math.floor(Math.random() * 8);
                const randomStep = Math.floor(Math.random() * 16);
                if (instrumentData[randomTrack] && instrumentData[randomTrack][randomStep]) {
                    instrumentData[randomTrack][randomStep].active = true;
                    instrumentData[randomTrack][randomStep].velocity = 0.6 + Math.random() * 0.4;
                }
            }
            console.log(`🎲 Generated drum pattern with ${numSteps} steps`);
        } else {
            // Instruments 1-3: Only one note per column (no chords)
            // Fill 60-80% of columns with notes
            const columnsToFill = Math.floor(Math.random() * 4) + 10; // 10-13 columns
            const usedColumns = new Set();
            
            while (usedColumns.size < columnsToFill) {
                const randomStep = Math.floor(Math.random() * 16);
                if (!usedColumns.has(randomStep)) {
                    usedColumns.add(randomStep);
                    const randomTrack = Math.floor(Math.random() * 8);
                    if (instrumentData[randomTrack] && instrumentData[randomTrack][randomStep]) {
                        instrumentData[randomTrack][randomStep].active = true;
                        instrumentData[randomTrack][randomStep].velocity = 0.6 + Math.random() * 0.4;
                    }
                }
            }
            console.log(`🎲 Generated melodic pattern with ${columnsToFill} notes (no chords)`);
        }
        
        updateSequencerDisplay();
    }
}

// Clear current instrument track
function clearCurrentTrack() {
    const pattern = patterns[currentPattern];
    const instrumentData = pattern[currentInstrument];
    
    if (instrumentData) {
        for (let track = 0; track < 8; track++) {
            for (let step = 0; step < 16; step++) {
                if (instrumentData[track] && instrumentData[track][step]) {
                    instrumentData[track][step].active = false;
                }
            }
        }
        updateSequencerDisplay();
        console.log(`🧹 Cleared track for instrument ${currentInstrument}`);
    }
}

// Clear all tracks in current pattern
function clearAllTracks() {
    const pattern = patterns[currentPattern];
    
    for (let instrument = 1; instrument <= 4; instrument++) {
        const instrumentData = pattern[instrument];
        if (instrumentData) {
            for (let track = 0; track < 8; track++) {
                for (let step = 0; step < 16; step++) {
                    if (instrumentData[track] && instrumentData[track][step]) {
                        instrumentData[track][step].active = false;
                    }
                }
            }
        }
    }
    updateSequencerDisplay();
    console.log(`🧹 Cleared all tracks in pattern ${currentPattern}`);
}

// Update ADSR display for current instrument
function updateADSRDisplay() {
    const adsr = instrumentADSR[currentInstrument];
    
    const attackSlider = document.getElementById('attack');
    const decaySlider = document.getElementById('decay');
    const sustainSlider = document.getElementById('sustain');
    const releaseSlider = document.getElementById('release');
    
    if (attackSlider) attackSlider.value = adsr.attack;
    if (decaySlider) decaySlider.value = adsr.decay;
    if (sustainSlider) sustainSlider.value = adsr.sustain;
    if (releaseSlider) releaseSlider.value = adsr.release;
}

// Update effects display for current instrument
function updateEffectsDisplay() {
    const effects = instrumentEffects[currentInstrument];
    
    const delaySlider = document.getElementById('delay');
    const reverbSlider = document.getElementById('reverb');
    const saturationSlider = document.getElementById('saturation');
    const chorusSlider = document.getElementById('chorus');
    
    if (delaySlider) delaySlider.value = effects.delay;
    if (reverbSlider) reverbSlider.value = effects.reverb;
    if (saturationSlider) saturationSlider.value = effects.saturation;
    if (chorusSlider) chorusSlider.value = effects.chorus;
}

// Create enhanced piano keyboard
function createPianoKeyboard() {
    const keyboard = document.getElementById('keyboard');
    if (!keyboard) return;
    
    keyboard.innerHTML = '';
    
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    
    // Create two octaves
    for (let octave = 0; octave < 2; octave++) {
        notes.forEach(note => {
            const key = document.createElement('div');
            key.className = note.includes('#') ? 'key black' : 'key';
            key.dataset.note = note;
            key.dataset.octave = octave;
            
            key.addEventListener('mousedown', async () => {
                await enableAudio(); // Enable audio on first interaction
                const frequency = noteFreqs[note] * Math.pow(2, octave + pianoKeyboardOctave);
                playNote(frequency, currentInstrument);
                key.classList.add('active');
            });
            
            key.addEventListener('mouseup', () => {
                key.classList.remove('active');
            });
            
            key.addEventListener('mouseleave', () => {
                key.classList.remove('active');
            });
            
            keyboard.appendChild(key);
        });
    }
    
    console.log('✅ Enhanced piano keyboard created');
}

// Update piano keyboard display (for future octave indicators)
function updatePianoKeyboard() {
    // This function can be expanded later to show octave indicators
    console.log(`🎹 Piano keyboard octave: ${pianoKeyboardOctave}`);
}

// Keyboard mapping for multi-track playing (dynamic based on scale)
function getKeyboardMapping() {
    const scaleNotes = scales[currentScale];
    return {
        // Track 1 (Instrument 1): Q to \ keys - top row
        'q': { track: 1, scaleIndex: 0, octave: 0 },
        'w': { track: 1, scaleIndex: 1, octave: 0 },
        'e': { track: 1, scaleIndex: 2, octave: 0 },
        'r': { track: 1, scaleIndex: 3, octave: 0 },
        't': { track: 1, scaleIndex: 4, octave: 0 },
        'y': { track: 1, scaleIndex: 5, octave: 0 },
        'u': { track: 1, scaleIndex: 6, octave: 0 },
        'i': { track: 1, scaleIndex: 7, octave: 0 },
        'o': { track: 1, scaleIndex: 0, octave: 1 },
        'p': { track: 1, scaleIndex: 1, octave: 1 },
        '[': { track: 1, scaleIndex: 2, octave: 1 },
        ']': { track: 1, scaleIndex: 3, octave: 1 },
        '\\': { track: 1, scaleIndex: 4, octave: 1 },
        
        // Track 2 (Instrument 2): A to ' keys - middle row  
        'a': { track: 2, scaleIndex: 0, octave: 0 },
        's': { track: 2, scaleIndex: 1, octave: 0 },
        'd': { track: 2, scaleIndex: 2, octave: 0 },
        'f': { track: 2, scaleIndex: 3, octave: 0 },
        'g': { track: 2, scaleIndex: 4, octave: 0 },
        'h': { track: 2, scaleIndex: 5, octave: 0 },
        'j': { track: 2, scaleIndex: 6, octave: 0 },
        'k': { track: 2, scaleIndex: 7, octave: 0 },
        'l': { track: 2, scaleIndex: 0, octave: 1 },
        ';': { track: 2, scaleIndex: 1, octave: 1 },
        "'": { track: 2, scaleIndex: 2, octave: 1 },
        
        // Track 3 (Instrument 3): Z to / keys - bottom row
        'z': { track: 3, scaleIndex: 0, octave: 0 },
        'x': { track: 3, scaleIndex: 1, octave: 0 },
        'c': { track: 3, scaleIndex: 2, octave: 0 },
        'v': { track: 3, scaleIndex: 3, octave: 0 },
        'b': { track: 3, scaleIndex: 4, octave: 0 },
        'n': { track: 3, scaleIndex: 5, octave: 0 },
        'm': { track: 3, scaleIndex: 6, octave: 0 },
        ',': { track: 3, scaleIndex: 7, octave: 0 },
        '.': { track: 3, scaleIndex: 0, octave: 1 },
        '/': { track: 3, scaleIndex: 1, octave: 1 },
        
        // Track 4 (Drums): Number keys for drum triggers
        '3': { track: 4, drumIndex: 0 }, // Kick
        '4': { track: 4, drumIndex: 1 }, // Snare
        '5': { track: 4, drumIndex: 2 }, // Hi-hat
        '6': { track: 4, drumIndex: 3 }, // Hat 2
        '7': { track: 4, drumIndex: 4 }, // Perc 1
        '8': { track: 4, drumIndex: 5 }, // Perc 2
        '9': { track: 4, drumIndex: 6 }, // Perc 3
        '0': { track: 4, drumIndex: 7 }  // Perc 4
    };
}

// Track which keys are currently pressed to prevent repeats
let pressedKeys = new Set();

// Test effects function - plays continuous tone through all effects
window.testEffects = function() {
    console.log('🧪 TESTING ALL EFFECTS WITH EFFECTS PROCESSOR...');
    
    if (!audioContext) {
        console.error('Audio context not initialized');
        return;
    }
    
    if (!effectsProcessor) {
        console.error('Effects processor not initialized');
        return;
    }
    
    // Create test tone oscillator
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    // Use current instrument's effects
    const effects = instrumentEffects[currentInstrument];
    
    oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime); // Safe volume
    
    // Update effects processor with current settings
    const maxWet = Math.max(effects.delay, effects.reverb, effects.saturation, effects.chorus);
    effectsProcessor.wetGain.gain.setValueAtTime(maxWet, audioContext.currentTime);
    effectsProcessor.dryGain.gain.setValueAtTime(1 - maxWet * 0.5, audioContext.currentTime);
    
    // Update individual effects
    if (effects.delay > 0) {
        // Digital delay with rhythmic timing
        const delayTime = 0.125 + (effects.delay * 0.375); // 125-500ms range
        effectsProcessor.effects.delay.delayNode.delayTime.setValueAtTime(delayTime, audioContext.currentTime);
        // High feedback for multiple repeats
        effectsProcessor.effects.delay.feedbackNode.gain.setValueAtTime(0.5 + (effects.delay * 0.35), audioContext.currentTime);
        // Adjust filter for more/less degradation
        if (effectsProcessor.effects.delay.filterNode) {
            effectsProcessor.effects.delay.filterNode.gain.setValueAtTime(-1 - (effects.delay * 4), audioContext.currentTime);
        }
    }
    
    if (effects.saturation > 0 && effectsProcessor.effects.saturation.makeCurve) {
        effectsProcessor.effects.saturation.waveshaperNode.curve = effectsProcessor.effects.saturation.makeCurve(effects.saturation * 30);
    }
    
    if (effects.chorus > 0) {
        effectsProcessor.effects.filter.filterNode.frequency.setValueAtTime(200 + (effects.chorus * 3800), audioContext.currentTime);
        effectsProcessor.effects.filter.filterNode.Q.setValueAtTime(1 + (effects.chorus * 10), audioContext.currentTime);
    }
    
    // Connect through effects processor
    oscillator.connect(gainNode);
    gainNode.connect(effectsProcessor.inputGain);
    
    // Start and stop after 3 seconds
    oscillator.start();
    setTimeout(() => {
        oscillator.stop();
        console.log('✅ Test tone stopped');
    }, 3000);
    
    console.log(`🎵 Playing 440Hz test tone for 3 seconds with effects:
    Delay: ${effects.delay.toFixed(2)}
    Reverb: ${effects.reverb.toFixed(2)}
    Saturation: ${effects.saturation.toFixed(2)}
    Chorus: ${effects.chorus.toFixed(2)}`);
    
    return; // Skip old inline effects code
    
    // Delay effect
    if (effects.delay > 0) {
        const delayNode = audioContext.createDelay();
        const delayGain = audioContext.createGain();
        const feedbackGain = audioContext.createGain();
        
        delayNode.delayTime.setValueAtTime(0.2 + (0.3 * effects.delay), audioContext.currentTime);
        delayGain.gain.setValueAtTime(0.4 * effects.delay, audioContext.currentTime);
        feedbackGain.gain.setValueAtTime(0.3 * effects.delay, audioContext.currentTime);
        
        currentNode.connect(delayNode);
        delayNode.connect(feedbackGain);
        feedbackGain.connect(delayNode);
        delayNode.connect(delayGain);
        
        const mixNode = audioContext.createGain();
        currentNode.connect(mixNode);
        delayGain.connect(mixNode);
        currentNode = mixNode;
        
        console.log('✅ Delay applied:', effects.delay);
    }
    
    // Reverb effect
    if (effects.reverb > 0) {
        try {
            const convolver = audioContext.createConvolver();
            const length = audioContext.sampleRate * 1.5;
            const impulse = audioContext.createBuffer(2, length, audioContext.sampleRate);
            
            for (let channel = 0; channel < 2; channel++) {
                const channelData = impulse.getChannelData(channel);
                for (let i = 0; i < length; i++) {
                    const decay = Math.pow(1 - i / length, 2);
                    channelData[i] = (Math.random() * 2 - 1) * decay * 0.3;
                    if (i < audioContext.sampleRate * 0.1) {
                        channelData[i] *= 1.5;
                    }
                }
            }
            
            convolver.buffer = impulse;
            
            const dryGain = audioContext.createGain();
            const wetGain = audioContext.createGain();
            const mixNode = audioContext.createGain();
            
            dryGain.gain.setValueAtTime(1 - (effects.reverb * 0.5), audioContext.currentTime);
            wetGain.gain.setValueAtTime(effects.reverb, audioContext.currentTime);
            
            currentNode.connect(dryGain);
            dryGain.connect(mixNode);
            
            currentNode.connect(convolver);
            convolver.connect(wetGain);
            wetGain.connect(mixNode);
            
            currentNode = mixNode;
            console.log('✅ Reverb applied:', effects.reverb);
        } catch (e) {
            console.error('Reverb failed:', e);
        }
    }
    
    // Saturation effect
    if (effects.saturation > 0) {
        const waveshaper = audioContext.createWaveShaper();
        const makeDistortionCurve = (amount) => {
            const samples = 44100;
            const curve = new Float32Array(samples);
            const deg = Math.PI / 180;
            
            for (let i = 0; i < samples; i++) {
                const x = (i * 2) / samples - 1;
                curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
            }
            return curve;
        };
        
        waveshaper.curve = makeDistortionCurve(effects.saturation * 50);
        waveshaper.oversample = '4x';
        
        const makeupGain = audioContext.createGain();
        makeupGain.gain.setValueAtTime(0.7 + (effects.saturation * 0.3), audioContext.currentTime);
        
        currentNode.connect(waveshaper);
        waveshaper.connect(makeupGain);
        currentNode = makeupGain;
        
        console.log('✅ Saturation applied:', effects.saturation);
    }
    
    // Chorus effect
    if (effects.chorus > 0) {
        const chorusDelay = audioContext.createDelay();
        const lfo = audioContext.createOscillator();
        const lfoGain = audioContext.createGain();
        
        chorusDelay.delayTime.value = 0.02;
        lfo.frequency.value = 3 + (effects.chorus * 5);
        lfoGain.gain.value = 0.002 * effects.chorus;
        
        lfo.connect(lfoGain);
        lfoGain.connect(chorusDelay.delayTime);
        
        const chorusGain = audioContext.createGain();
        chorusGain.gain.setValueAtTime(0.5 * effects.chorus, audioContext.currentTime);
        
        const mixNode = audioContext.createGain();
        currentNode.connect(mixNode);
        currentNode.connect(chorusDelay);
        chorusDelay.connect(chorusGain);
        chorusGain.connect(mixNode);
        
        lfo.start();
        currentNode = mixNode;
        
        console.log('✅ Chorus applied:', effects.chorus);
    }
    
    // Connect to destination
    oscillator.connect(gainNode);
    currentNode.connect(audioContext.destination);
    
    // Start and stop after 3 seconds
    oscillator.start();
    setTimeout(() => {
        oscillator.stop();
        console.log('✅ Test tone stopped');
    }, 3000);
    
    console.log(`🎵 Playing 440Hz test tone for 3 seconds with effects:
    Delay: ${effects.delay.toFixed(2)}
    Reverb: ${effects.reverb.toFixed(2)}
    Saturation: ${effects.saturation.toFixed(2)}
    Chorus: ${effects.chorus.toFixed(2)}`);
};

// Make it globally accessible
window.testEffectsNow = window.testEffects;

// Setup computer keyboard input for multi-track playing
function setupComputerKeyboard() {
    document.addEventListener('keydown', async (event) => {
        const key = event.key.toLowerCase();
        
        // Prevent repeat events while key is held
        if (pressedKeys.has(key)) return;
        pressedKeys.add(key);
        
        // Play test note with T key (like other keyboard keys)
        if (key === 't' && !event.ctrlKey && !event.metaKey) {
            event.preventDefault();
            // Play middle C on current instrument
            const frequency = noteFreqs['C'] * Math.pow(2, instrumentOctaves[currentInstrument]);
            playNote(frequency, currentInstrument);
            console.log(`🎹 Test note 'T' → Track ${currentInstrument} → C${instrumentOctaves[currentInstrument]}`);
            return;
        }
        
        // Check for octave control shortcuts first
        if (key === '1') {
            changeCurrentTrackOctave('down');
            event.preventDefault();
            return;
        }
        if (key === '2') {
            changeCurrentTrackOctave('up');
            event.preventDefault();
            return;
        }
        
        const keyboardMapping = getKeyboardMapping();
        const mapping = keyboardMapping[key];
        if (mapping) {
            await enableAudio(); // Enable audio on first interaction
            
            if (mapping.track === 4) {
                // Drum track - play drum sound
                if (drumSampler && mapping.drumIndex !== undefined) {
                    const drumConfig = instrumentSounds[4];
                    const drumSound = drumConfig.sounds[mapping.drumIndex];
                    if (drumSound) {
                        playDrumSound(drumSound, 0.8, 4);
                        console.log(`🥁 Computer key '${key}' → Drum: ${drumSound.name}`);
                    }
                }
            } else {
                // Musical tracks - play notes
                const scaleNotes = scales[currentScale];
                const note = scaleNotes[mapping.scaleIndex % scaleNotes.length];
                const frequency = noteFreqs[note] * Math.pow(2, mapping.octave + instrumentOctaves[mapping.track]);
                
                // Play note on the mapped track/instrument
                playNote(frequency, mapping.track);
                
                // Add to arpeggiator if enabled
                addNoteToArpeggiator(mapping.track, frequency);
                
                console.log(`🎹 Computer key '${key}' → Track ${mapping.track} → ${note}${mapping.octave} (${currentScale} scale)`);
            }
            
            if (mapping.track !== 4) {
                // Only highlight piano keys for non-drum tracks
                const actualOctave = mapping.octave + Math.floor((mapping.scaleIndex + instrumentOctaves[mapping.track] * 8) / 12);
                const pianoKey = document.querySelector(`[data-note="${note}"][data-octave="${actualOctave % 2}"]`);
                if (pianoKey) {
                    pianoKey.classList.add('active');
                    // Add instrument-specific color
                    pianoKey.classList.add(`active-track-${mapping.track}`);
                    
                    // Set the color based on track
                    const trackColors = {
                        1: '#FFB6C1', // Pink for Synth
                        2: '#87CEEB', // Blue for Bass
                        3: '#DDA0DD'  // Purple for Keys
                    };
                    
                    if (trackColors[mapping.track]) {
                        pianoKey.style.setProperty('background-color', trackColors[mapping.track], 'important');
                    }
                }
            }
            
            // Prevent default browser behavior
            event.preventDefault();
        }
    });
    
    document.addEventListener('keyup', (event) => {
        const key = event.key.toLowerCase();
        pressedKeys.delete(key);
        
        const keyboardMapping = getKeyboardMapping();
        const mapping = keyboardMapping[key];
        if (mapping && mapping.track !== 4) {
            // Only remove piano key highlights for non-drum tracks
            const scaleNotes = scales[currentScale];
            const note = scaleNotes[mapping.scaleIndex % scaleNotes.length];
            const frequency = noteFreqs[note] * Math.pow(2, mapping.octave + instrumentOctaves[mapping.track]);
            
            // Remove from arpeggiator if enabled
            removeNoteFromArpeggiator(mapping.track, frequency);
            
            // Remove visual feedback from all piano keys with this note
            document.querySelectorAll(`.key.active`).forEach(key => {
                if (key.dataset.note === note) {
                    key.classList.remove('active');
                    key.classList.remove(`active-track-1`);
                    key.classList.remove(`active-track-2`);
                    key.classList.remove(`active-track-3`);
                    key.classList.remove(`active-track-4`);
                    // Remove the inline style
                    key.style.removeProperty('background-color');
                }
            });
        }
    });
    
    console.log('✅ Computer keyboard multi-track input enabled');
}

// Scale switching function
function toggleScale() {
    currentScale = currentScale === 'major' ? 'minor' : 'major';
    
    // Update scale button text
    const scaleButton = document.getElementById('random-scale-button');
    if (scaleButton) {
        scaleButton.textContent = currentScale.charAt(0).toUpperCase() + currentScale.slice(1);
    }
    
    console.log(`🎼 Scale switched to: ${currentScale}`);
    console.log(`🎼 Scale notes: ${scales[currentScale].join(', ')}`);
}

// Octave control functions
function changeInstrumentOctave(instrumentNum, direction) {
    const change = direction === 'up' ? 1 : -1;
    instrumentOctaves[instrumentNum] = Math.max(-3, Math.min(3, instrumentOctaves[instrumentNum] + change));
    
    console.log(`🎹 Instrument ${instrumentNum} octave: ${instrumentOctaves[instrumentNum]}`);
    
    // Play a test note to hear the octave change
    const testNote = noteFreqs['C'] * Math.pow(2, instrumentOctaves[instrumentNum]);
    playNote(testNote, instrumentNum, 0.5);
}

function changePianoOctave(direction) {
    const change = direction === 'up' ? 1 : -1;
    pianoKeyboardOctave = Math.max(-2, Math.min(2, pianoKeyboardOctave + change));
    
    console.log(`🎹 Piano keyboard octave: ${pianoKeyboardOctave}`);
    
    // Update piano keyboard display if needed
    updatePianoKeyboard();
}

function changeCurrentTrackOctave(direction) {
    // Change octave for whichever track is currently being used for computer keyboard input
    // This affects the currently selected instrument
    changeInstrumentOctave(currentInstrument, direction);
}

// Mixer functions
// Global mixer mode state
let mixerMode = false;

function toggleMixer() {
    const mixerButton = document.getElementById('mixer-button');
    
    console.log('🎛️ BEFORE toggle - mixerMode:', mixerMode);
    
    // Simple toggle - if mixer is on, turn it off, if off, turn it on
    if (mixerMode) {
        // Turn OFF
        mixerMode = false;
        if (mixerButton) mixerButton.classList.remove('active');
        console.log('🎛️ Turning Mixer OFF');
    } else {
        // Turn ON  
        mixerMode = true;
        if (mixerButton) mixerButton.classList.add('active');
        console.log('🎛️ Turning Mixer ON');
    }
    
    console.log('🎛️ AFTER toggle - mixerMode:', mixerMode);
    
    // Force update the display
    updateSequencerDisplay();
    
    console.log('🎛️ Display updated');
}

// Mixer state for grid-based mixer
const mixerStates = {
    mute: new Set(),
    solo: new Set(),
    volumes: [
        0.8, 0.8, 0.8,     // Instruments 1-3
        0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8  // 8 drum sounds
    ]
};

// Handle mixer grid clicks - Tetris-style vertical bars
function handleMixerClick(row, col) {
    // Columns 0-2: Instruments 1-3
    // Columns 3-10: Drum sounds (8 different drums)
    // Columns 11-15: Not used
    
    if (col >= 11) return; // Ignore columns 11-15
    
    const volumeLevel = (8 - row) / 8; // Invert so bottom = high volume, clicking sets exact level
    
    if (col < 3) {
        // Instruments 1-3 - adjust volume
        const instrumentIndex = col;
        mixerStates.volumes[instrumentIndex] = volumeLevel;
        instrumentVolumes[instrumentIndex + 1] = volumeLevel;
        console.log(`Instrument ${instrumentIndex + 1} volume set to ${Math.round(volumeLevel * 100)}%`);
    } else if (col < 11) {
        // Drum sounds (column 3-10 = drum 0-7) - adjust volume
        const drumIndex = col - 3;
        mixerStates.volumes[col] = volumeLevel;
        console.log(`Drum ${drumIndex + 1} volume set to ${Math.round(volumeLevel * 100)}%`);
    }
    
    updateSequencerDisplay();
}

function createMixerChannel(instrumentNum) {
    const instrumentNames = { 1: 'Synth', 2: 'Bass', 3: 'Keys', 4: 'Drums' };
    const name = instrumentNames[instrumentNum];
    const volume = instrumentVolumes[instrumentNum];
    const pan = instrumentPans[instrumentNum];
    
    return `
        <div class="mixer-channel" data-instrument="${instrumentNum}">
            <div class="channel-header">
                <h4>${name}</h4>
                <div class="channel-color instrument-${instrumentNum}"></div>
            </div>
            <div class="channel-controls">
                <div class="control-group">
                    <label>Volume</label>
                    <input type="range" class="volume-slider" min="0" max="1" step="0.01" value="${volume}" data-instrument="${instrumentNum}">
                    <span class="volume-value">${Math.round(volume * 100)}%</span>
                </div>
                <div class="control-group">
                    <label>Pan</label>
                    <input type="range" class="pan-slider" min="-1" max="1" step="0.01" value="${pan}" data-instrument="${instrumentNum}">
                    <span class="pan-value">${pan === 0 ? 'C' : pan < 0 ? 'L' + Math.abs(Math.round(pan * 100)) : 'R' + Math.round(pan * 100)}</span>
                </div>
                <div class="control-group">
                    <button class="mute-button" data-instrument="${instrumentNum}">Mute</button>
                    <button class="solo-button" data-instrument="${instrumentNum}">Solo</button>
                </div>
            </div>
        </div>
    `;
}

function setupMixerControls() {
    // Volume sliders
    document.querySelectorAll('.volume-slider').forEach(slider => {
        slider.addEventListener('input', (e) => {
            const instrument = parseInt(e.target.dataset.instrument);
            const value = parseFloat(e.target.value);
            instrumentVolumes[instrument] = value;
            
            // Update display
            const valueSpan = e.target.parentNode.querySelector('.volume-value');
            if (valueSpan) valueSpan.textContent = Math.round(value * 100) + '%';
            
            console.log(`🎛️ Instrument ${instrument} volume: ${Math.round(value * 100)}%`);
        });
    });
    
    // Pan sliders
    document.querySelectorAll('.pan-slider').forEach(slider => {
        slider.addEventListener('input', (e) => {
            const instrument = parseInt(e.target.dataset.instrument);
            const value = parseFloat(e.target.value);
            instrumentPans[instrument] = value;
            
            // Update display
            const valueSpan = e.target.parentNode.querySelector('.pan-value');
            if (valueSpan) {
                valueSpan.textContent = value === 0 ? 'C' : value < 0 ? 'L' + Math.abs(Math.round(value * 100)) : 'R' + Math.round(value * 100);
            }
            
            console.log(`🎛️ Instrument ${instrument} pan: ${value}`);
        });
    });
}

// Playback functionality
async function startPlayback() {
    if (isPlaying) return;
    
    // Ensure audio is enabled
    await enableAudio();
    
    isPlaying = true;
    currentStep = 0;
    
    const stepDuration = (60 / tempo / 4) * 1000; // 16th notes
    
    playbackInterval = setInterval(() => {
        // Play all active instruments for this step
        for (let instrument = 1; instrument <= 4; instrument++) {
            const pattern = patterns[currentPattern];
            const instrumentData = pattern[instrument];
            
            if (instrumentData) {
                // Check all tracks for this step
                for (let track = 0; track < 8; track++) {
                    if (instrumentData[track] && instrumentData[track][currentStep] && instrumentData[track][currentStep].active) {
                        if (instrument === 4) {
                            // For drums, use track to select drum sound from DrumSampler
                            if (drumSampler && track < drumSampler.drumMap.length) {
                                const drumType = drumSampler.drumMap[track];
                                const drumSound = { name: drumType, track: track };
                                console.log(`🥁 Playing: Drum ${drumType} on track ${track}`);
                                playDrumSound(drumSound, instrumentData[track][currentStep].velocity, instrument);
                            }
                        } else {
                            // For other instruments, use musical notes
                            const notes = scales[currentScale];
                            const note = notes[track % 8];
                            const frequency = noteFreqs[note] * Math.pow(2, instrumentOctaves[instrument]);
                            console.log(`🎵 Playing: Instrument ${instrument}, Track ${track}, Step ${currentStep}, Note ${note}, Freq ${frequency}`);
                            playNote(frequency, instrument, instrumentData[track][currentStep].velocity);
                        }
                    }
                }
            }
        }
        
        updateSequencerDisplay();
        currentStep = (currentStep + 1) % 16;
    }, stepDuration);
    
    console.log('▶️ Playback started');
}

function stopPlayback() {
    isPlaying = false;
    currentStep = 0;
    
    if (playbackInterval) {
        clearInterval(playbackInterval);
        playbackInterval = null;
    }
    
    updateSequencerDisplay();
    console.log('⏹️ Playback stopped');
}

// Initialize enhanced Rosita
// Arpeggiator functions
function toggleArpeggiator(trackNum) {
    const arp = arpeggiatorState[trackNum];
    
    if (!arp.enabled) {
        // First click - enable arpeggiator
        arp.enabled = true;
        arp.hold = false;
        startArpeggiator(trackNum);
        updateArpeggiatorLEDs(trackNum);
        console.log(`🎵 Arpeggiator ${trackNum} enabled`);
    } else if (!arp.hold) {
        // Second click - enable hold mode
        arp.hold = true;
        updateArpeggiatorLEDs(trackNum);
        console.log(`🎵 Arpeggiator ${trackNum} hold mode`);
    } else {
        // Third click - disable arpeggiator
        arp.enabled = false;
        arp.hold = false;
        arp.notes = [];
        stopArpeggiator(trackNum);
        updateArpeggiatorLEDs(trackNum);
        console.log(`🎵 Arpeggiator ${trackNum} disabled`);
    }
}

function startArpeggiator(trackNum) {
    const arp = arpeggiatorState[trackNum];
    
    // Clear any existing interval
    if (arp.interval) {
        clearInterval(arp.interval);
    }
    
    // Start the arpeggiator
    arp.interval = setInterval(() => {
        if (arp.notes.length > 0 || arp.hold) {
            if (arp.notes.length > 0) {
                // Play the current note
                const freq = arp.notes[arp.currentIndex];
                playNote(freq, trackNum, 0.5); // Shorter duration for arp notes
                
                // Move to next note
                arp.currentIndex = (arp.currentIndex + 1) % arp.notes.length;
            }
            
            // Cycle LEDs in hold mode
            if (arp.hold) {
                updateArpeggiatorLEDs(trackNum, true);
            }
        }
    }, 60000 / (tempo * 4)); // 16th notes
}

function stopArpeggiator(trackNum) {
    const arp = arpeggiatorState[trackNum];
    
    if (arp.interval) {
        clearInterval(arp.interval);
        arp.interval = null;
    }
    
    arp.currentIndex = 0;
}

function updateArpeggiatorLEDs(trackNum, cycle = false) {
    const arp = arpeggiatorState[trackNum];
    const instrumentName = ['synth', 'bass', 'keys'][trackNum - 1];
    
    // Update button state
    const button = document.getElementById(`arp-${instrumentName}`);
    if (button) {
        button.classList.toggle('active', arp.enabled);
        button.classList.toggle('hold', arp.hold);
    }
    
    // Update LEDs
    const leds = document.querySelectorAll(`.led[data-instrument="${instrumentName}"]`);
    
    if (cycle && arp.hold) {
        // Cycle LEDs when in hold mode
        if (!arp.ledCycleIndex) arp.ledCycleIndex = 0;
        arp.ledCycleIndex = (arp.ledCycleIndex + 1) % 3;
        
        leds.forEach((led, index) => {
            led.classList.remove('active', 'instrument-1', 'instrument-2', 'instrument-3');
            led.style.removeProperty('background-color');
            
            if (index === arp.ledCycleIndex) {
                led.classList.add('active', `instrument-${trackNum}`);
                
                // Set LED color based on track
                const ledColors = {
                    1: '#FFB6C1', // Pink for Synth
                    2: '#87CEEB', // Blue for Bass
                    3: '#DDA0DD'  // Purple for Keys
                };
                
                if (ledColors[trackNum]) {
                    led.style.setProperty('background-color', ledColors[trackNum], 'important');
                }
            }
        });
    } else {
        // Normal LED display
        leds.forEach((led, index) => {
            led.classList.remove('active', 'instrument-1', 'instrument-2', 'instrument-3');
            
            if (arp.enabled) {
                if (index === 0 || (index === 1 && arp.hold) || (index === 2 && arp.hold)) {
                    led.classList.add('active', `instrument-${trackNum}`);
                    
                    // Set LED color based on track
                    const ledColors = {
                        1: '#FFB6C1', // Pink for Synth
                        2: '#87CEEB', // Blue for Bass
                        3: '#DDA0DD'  // Purple for Keys
                    };
                    
                    if (ledColors[trackNum]) {
                        led.style.setProperty('background-color', ledColors[trackNum], 'important');
                    }
                }
            } else {
                led.style.removeProperty('background-color');
            }
        });
    }
}

function addNoteToArpeggiator(trackNum, frequency) {
    const arp = arpeggiatorState[trackNum];
    
    if (arp.enabled && !arp.hold) {
        // Add note if not already present
        if (!arp.notes.includes(frequency)) {
            arp.notes.push(frequency);
            arp.notes.sort((a, b) => a - b); // Sort notes ascending
        }
    }
}

function removeNoteFromArpeggiator(trackNum, frequency) {
    const arp = arpeggiatorState[trackNum];
    
    if (arp.enabled && !arp.hold) {
        // Remove note
        const index = arp.notes.indexOf(frequency);
        if (index > -1) {
            arp.notes.splice(index, 1);
        }
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🔧 Initializing Enhanced Rosita...');
    
    try {
        // Make sure mixer starts OFF
        mixerMode = false;
        
        // Don't wait for user interaction - initialize audio immediately
        const audioInitialized = await initAudio();
        console.log('Audio initialized on page load:', audioInitialized);
        
        // Create UI elements
        console.log('🎹 Creating piano keyboard...');
        createPianoKeyboard();
        console.log('✅ Piano keyboard created');
        
        console.log('🎵 Creating sequencer grid...');
        createSequencerGrid();
        console.log('✅ Sequencer grid created');
        
        console.log('⌨️ Setting up computer keyboard...');
        setupComputerKeyboard();
        console.log('✅ Computer keyboard setup complete');
    } catch (error) {
        console.error('❌ Error during initialization:', error);
        console.error('Stack trace:', error.stack);
        
        // Try to create UI even if audio fails
        try {
            console.log('🔧 Attempting to create UI despite error...');
            createPianoKeyboard();
            createSequencerGrid();
            setupComputerKeyboard();
            console.log('✅ UI created successfully despite audio error');
        } catch (uiError) {
            console.error('❌ UI creation also failed:', uiError);
        }
    }
    
    // Initialize instrument displays
    // Set drum button to Kit 1 immediately (even before audio init)
    const drumButton = document.getElementById('instrument-drums');
    if (drumButton) {
        drumButton.textContent = 'Kit 1';
        drumButton.title = 'Drum Kit 1';
    }
    
    // Update other instrument displays
    for (let i = 1; i <= 3; i++) {
        updateInstrumentDisplay(i);
    }
    
    // Set up instrument button cycling
    document.querySelectorAll('.instrument-button').forEach((button, index) => {
        const instrumentNum = index + 1;
        
        button.addEventListener('click', async () => {
            await enableAudio(); // Enable audio on first interaction
            
            // If mixer is open, close it and switch to track
            if (mixerMode) {
                mixerMode = false;
                const mixerButton = document.getElementById('mixer-button');
                if (mixerButton) {
                    mixerButton.classList.remove('active');
                }
                console.log('🎛️ Auto-closing mixer to switch to track', instrumentNum);
            }
            
            if (currentInstrument === instrumentNum) {
                // If clicking current instrument, cycle through sounds
                cycleInstrumentSound(instrumentNum);
            } else {
                // Switch to different instrument
                switchInstrument(instrumentNum);
            }
        });
        
        updateInstrumentDisplay(instrumentNum);
    });
    
    // Set up per-instrument octave controls
    document.querySelectorAll('.octave-button').forEach(button => {
        const instrument = button.dataset.instrument;
        const direction = button.dataset.direction;
        
        if (instrument) {
            // Per-instrument octave buttons
            const instrumentNames = { 'synth': 1, 'bass': 2, 'keys': 3, 'drums': 4 };
            const instrumentNum = instrumentNames[instrument];
            
            button.addEventListener('click', async () => {
                await enableAudio();
                changeInstrumentOctave(instrumentNum, direction);
            });
        } else {
            // Piano keyboard octave buttons (those without data-instrument)
            button.addEventListener('click', async () => {
                await enableAudio();
                changePianoOctave(direction);
            });
        }
    });
    
    // Set up pattern buttons
    document.querySelectorAll('.pattern-button').forEach(button => {
        const patternNum = parseInt(button.dataset.pattern);
        button.addEventListener('click', () => {
            if (duplicateMode) {
                // In duplicate mode, copy current pattern to selected slot
                duplicatePatternTo(patternNum);
                // Exit duplicate mode
                duplicateMode = false;
                const dupButton = document.getElementById('duplicate-pattern-button');
                if (dupButton) dupButton.classList.remove('active');
            } else {
                // Normal pattern switching
                switchPattern(patternNum);
            }
        });
    });
    
    // Set up transport controls
    const playButton = document.getElementById('play-button');
    const stopButton = document.getElementById('stop-button');
    const randomButton = document.getElementById('random-button');
    const clearButton = document.getElementById('clear-button');
    const clearAllButton = document.getElementById('clear-all-button');
    const mixerButton = document.getElementById('mixer-button');
    
    if (playButton) playButton.addEventListener('click', async () => {
        await enableAudio();
        startPlayback();
    });
    if (stopButton) stopButton.addEventListener('click', stopPlayback);
    if (randomButton) randomButton.addEventListener('click', async () => {
        await enableAudio();
        addRandomSteps();
    });
    if (clearButton) clearButton.addEventListener('click', clearCurrentTrack);
    if (clearAllButton) clearAllButton.addEventListener('click', clearAllTracks);
    if (mixerButton) mixerButton.addEventListener('click', toggleMixer);
    
    // Set up DUP button
    const dupButton = document.getElementById('duplicate-pattern-button');
    if (dupButton) {
        dupButton.addEventListener('click', () => {
            duplicateMode = !duplicateMode;
            dupButton.classList.toggle('active', duplicateMode);
            console.log(`Duplicate mode: ${duplicateMode ? 'ON' : 'OFF'}`);
        });
    }
    
    // Set up scale button
    const scaleButton = document.getElementById('random-scale-button');
    if (scaleButton) {
        scaleButton.addEventListener('click', async () => {
            await enableAudio();
            toggleScale();
        });
        // Initialize button text
        scaleButton.textContent = currentScale.charAt(0).toUpperCase() + currentScale.slice(1);
    }
    
    // Set up ADSR controls for current instrument
    ['attack', 'decay', 'sustain', 'release'].forEach(param => {
        const slider = document.getElementById(param);
        if (slider) {
            slider.addEventListener('input', (e) => {
                instrumentADSR[currentInstrument][param] = parseFloat(e.target.value);
                console.log(`🎛️ ${param} for instrument ${currentInstrument}: ${e.target.value}`);
            });
        }
    });
    
    // Set up effects controls for current instrument (no value displays)
    ['delay', 'reverb', 'saturation', 'chorus'].forEach(param => {
        const slider = document.getElementById(param);
        
        if (slider) {
            slider.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                instrumentEffects[currentInstrument][param] = value;
                console.log(`🎛️ ${param} for instrument ${currentInstrument}: ${value}`);
            });
        }
    });
    
    // Set up tempo control
    const tempoSlider = document.getElementById('tempo');
    if (tempoSlider) {
        tempoSlider.addEventListener('input', (e) => {
            tempo = parseInt(e.target.value);
            console.log(`🎵 Tempo: ${tempo} BPM`);
            
            // If playing, restart with new tempo
            if (isPlaying) {
                stopPlayback();
                startPlayback();
            }
        });
    }
    
    // Set up arpeggiator buttons
    ['synth', 'bass', 'keys'].forEach((instrument, index) => {
        const button = document.getElementById(`arp-${instrument}`);
        if (button) {
            button.addEventListener('click', () => {
                const trackNum = index + 1;
                toggleArpeggiator(trackNum);
            });
        }
    });
    
    // Initialize displays
    switchInstrument(1);
    switchPattern(1);
    
    console.log('✅ Enhanced Rosita initialized with all features!');
    console.log('🎵 Features: Instrument cycling, individual sequences, per-instrument ADSR & effects');
});