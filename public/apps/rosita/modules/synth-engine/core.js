// Import necessary functions from other modules
import { noteToFrequency, playNote, stopNote, playNoteWithInstrument } from './notes.js';
import { initializeInstruments } from './instruments.js';
import { toggleArpeggiator, startArpeggiator, stopArpeggiator, addNoteToArpeggiator, removeNoteFromArpeggiator } from './arpeggiator.js';
import { playDrumSound, createNoiseNode, createReverbBuffer } from './drums/index.js';
import DrumSampler from '../drum-sampler.js';

class SynthEngine {
    constructor() {
        console.log('🔧 SynthEngine constructor starting...');
        
        // Initialize all properties with safe defaults
        this.isInitialized = false;
        this.isMobile = false;
        this.audioContext = null;
        this.masterGain = null;
        this.compressor = null;
        this.instrumentSettings = {};
        this.currentInstrument = 'synth';
        this.activeOscillators = {};
        this.activeGains = {};
        this.samples = {};
        this.tempo = 120;
        
        try {
            // Safe mobile detection
            try {
                this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
                console.log('✅ Mobile detection:', this.isMobile);
            } catch (mobileError) {
                console.warn('⚠️ Mobile detection failed, assuming desktop:', mobileError);
                this.isMobile = false;
            }
            
            // Safe audio context creation
            try {
                console.log('🔧 Creating audio context...');
                const AudioContextClass = window.AudioContext || window.webkitAudioContext;
                if (!AudioContextClass) {
                    throw new Error('AudioContext not supported');
                }
                
                this.audioContext = new AudioContextClass({
                    latencyHint: 'interactive',
                    sampleRate: 44100
                });
                console.log('✅ Audio context created:', this.audioContext.state);
            } catch (audioError) {
                console.error('❌ Audio context creation failed:', audioError);
                // Create a dummy audio context to prevent crashes
                this.audioContext = {
                    state: 'suspended',
                    sampleRate: 44100,
                    createGain: () => ({ gain: { value: 0.5 }, connect: () => {}, disconnect: () => {} }),
                    createDynamicsCompressor: () => ({ 
                        threshold: { value: -24 }, 
                        knee: { value: 30 }, 
                        ratio: { value: 12 },
                        attack: { value: 0.003 },
                        release: { value: 0.25 },
                        connect: () => {},
                        disconnect: () => {}
                    }),
                    destination: { connect: () => {}, disconnect: () => {} },
                    resume: () => Promise.resolve(),
                    decodeAudioData: () => Promise.resolve(null)
                };
            }
            
            // Safe gain node creation
            try {
                console.log('🔧 Creating master gain...');
                this.masterGain = this.audioContext.createGain();
                this.masterGain.gain.value = this.isMobile ? 0.5 : 0.7;
                console.log('✅ Master gain created');
            } catch (gainError) {
                console.error('❌ Master gain creation failed:', gainError);
                this.masterGain = { gain: { value: 0.5 }, connect: () => {}, disconnect: () => {} };
            }
            
            // Safe compressor creation
            try {
                console.log('🔧 Creating compressor...');
                this.compressor = this.audioContext.createDynamicsCompressor();
                this.compressor.threshold.value = this.isMobile ? -18 : -24;
                this.compressor.knee.value = this.isMobile ? 20 : 30;
                this.compressor.ratio.value = this.isMobile ? 8 : 12;
                this.compressor.attack.value = 0.003;
                this.compressor.release.value = 0.25;
                console.log('✅ Compressor created');
            } catch (compressorError) {
                console.error('❌ Compressor creation failed:', compressorError);
                this.compressor = { 
                    threshold: { value: -24 }, 
                    knee: { value: 30 }, 
                    ratio: { value: 12 },
                    attack: { value: 0.003 },
                    release: { value: 0.25 },
                    connect: () => {},
                    disconnect: () => {}
                };
            }
            
            // Safe audio chain connection
            try {
                console.log('🔧 Connecting audio chain...');
                this.masterGain.connect(this.compressor);
                this.compressor.connect(this.audioContext.destination);
                console.log('✅ Audio chain connected');
            } catch (connectionError) {
                console.error('❌ Audio chain connection failed:', connectionError);
            }
            
            // Safe instrument initialization
            try {
                console.log('🔧 Initializing instruments...');
                this.instrumentSettings = initializeInstruments();
                console.log('✅ Instruments initialized');
            } catch (instrumentError) {
                console.error('❌ Instrument initialization failed:', instrumentError);
                this.instrumentSettings = {
                    synth: { waveform: 'sawtooth', octave: 4 },
                    bass: { waveform: 'sawtooth', octave: 3 },
                    keys: { waveform: 'sawtooth', octave: 4 },
                    drums: { waveform: 'sawtooth', octave: 4 }
                };
            }
            
            // Safe arpeggiator initialization
            try {
                console.log('🔧 Initializing arpeggiators...');
                this.arpeggiators = {
                    synth: {
                        enabled: false,
                        looping: false,
                        notes: [],
                        lastNotes: [],
                        pattern: [0, 2, 1, 2],
                        step: 0,
                        interval: null,
                        currentOctave: 4,
                        previousOctave: 4
                    },
                    bass: {
                        enabled: false,
                        looping: false,
                        notes: [],
                        lastNotes: [],
                        pattern: [0, 1, 2, 3],
                        step: 0,
                        interval: null,
                        currentOctave: 3,
                        previousOctave: 3
                    },
                    keys: {
                        enabled: false,
                        looping: false,
                        notes: [],
                        lastNotes: [],
                        pattern: [2, 1, 0, 1],
                        step: 0,
                        interval: null,
                        currentOctave: 4,
                        previousOctave: 4
                    }
                };
                console.log('✅ Arpeggiators initialized');
            } catch (arpError) {
                console.error('❌ Arpeggiator initialization failed:', arpError);
                this.arpeggiators = {};
            }
            
            // Safe emergency cleanup setup
            try {
                console.log('🔧 Setting up emergency cleanup...');
                this.setupEmergencyCleanup();
                console.log('✅ Emergency cleanup setup');
            } catch (cleanupError) {
                console.error('❌ Emergency cleanup setup failed:', cleanupError);
            }
            
            // Safe audio context resume
            try {
                console.log('🔧 Resuming audio context...');
                this.resumeAudioContext();
                console.log('✅ Audio context resume initiated');
            } catch (resumeError) {
                console.error('❌ Audio context resume failed:', resumeError);
            }
            
            // Initialize drum sampler
            try {
                console.log('🔧 Initializing drum sampler...');
                this.drumSampler = new DrumSampler(this.audioContext);
                console.log('✅ Drum sampler initialized:', this.drumSampler);
                // Make it globally accessible for debugging
                window.drumSampler = this.drumSampler;
            } catch (samplerError) {
                console.error('❌ Drum sampler initialization failed:', samplerError);
                this.drumSampler = null;
            }
            
            // Safe drum sample loading (legacy)
            try {
                console.log('🔧 Loading drum samples...');
                this.loadDrumSamples();
                console.log('✅ Drum sample loading initiated');
            } catch (drumError) {
                console.error('❌ Drum sample loading failed:', drumError);
            }
            
            this.isInitialized = true;
            console.log('✅ SynthEngine constructor completed successfully');
            
        } catch (constructorError) {
            console.error('❌ SynthEngine constructor failed:', constructorError);
            // Ensure we have a minimal working state even if everything fails
            this.isInitialized = false;
            this.isMobile = false;
            this.audioContext = null;
            this.masterGain = null;
            this.compressor = null;
            this.instrumentSettings = {};
            this.currentInstrument = 'synth';
            this.activeOscillators = {};
            this.activeGains = {};
            this.samples = {};
            this.tempo = 120;
            this.arpeggiators = {};
        }
    }
    
    // Crash-proof method to explicitly resume audio context
    resumeAudioContext() {
        try {
            console.log('🔧 resumeAudioContext called');
            
            if (!this.audioContext) {
                console.warn('⚠️ No audio context available for resume');
                return Promise.resolve();
            }
            
            if (this.audioContext.state === 'running') {
                console.log('✅ Audio context already running');
                return Promise.resolve();
            }
            
            try {
                console.log('🔧 Attempting audio context resume...');
                const resumePromise = this.audioContext.resume();
                
                if (this.isMobile) {
                    // Add timeout for mobile devices
                    const timeoutPromise = new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('Audio context resume timeout')), 3000)
                    );
                    
                    return Promise.race([resumePromise, timeoutPromise])
                        .then(() => {
                            console.log('✅ Audio context resumed successfully (mobile)');
                            // Safe preload on mobile
                            try {
                                if (this.samples && Object.keys(this.samples).length > 0) {
                                    this.preloadDrumSamples();
                                }
                            } catch (preloadError) {
                                console.warn('⚠️ Sample preload failed:', preloadError);
                            }
                            return true;
                        })
                        .catch(err => {
                            console.warn('⚠️ Failed to resume audio context (mobile):', err);
                            // Try alternative approach on mobile
                            setTimeout(() => {
                                try {
                                    if (this.audioContext && this.audioContext.resume) {
                                        this.audioContext.resume();
                                    }
                                } catch (e) {
                                    console.warn('⚠️ Fallback audio resume failed:', e);
                                }
                            }, 100);
                            return false;
                        });
                } else {
                    return resumePromise.then(() => {
                        console.log('✅ Audio context resumed successfully (desktop)');
                        return true;
                    }).catch(err => {
                        console.warn('⚠️ Failed to resume audio context (desktop):', err);
                        return false;
                    });
                }
            } catch (resumeError) {
                console.error('❌ Audio context resume error:', resumeError);
                return Promise.resolve(false);
            }
        } catch (methodError) {
            console.error('❌ resumeAudioContext method failed:', methodError);
            return Promise.resolve(false);
        }
    }
    
    async loadDrumSamples() {
        try {
            console.log('🔧 loadDrumSamples called');
            
            if (!this.audioContext || !this.audioContext.decodeAudioData) {
                console.warn('⚠️ No audio context available for drum sample loading');
                return;
            }
            
            // Initialize samples object safely
            this.samples = this.samples || {};
            
            const sampleUrls = [
                { name: 'kick', url: 'FB Kick 1.wav' },
                { name: 'snare', url: 'FB Snare 6.wav' },
                { name: 'hihatClosed', url: 'FB Hat 1.wav' },
                { name: 'hihatOpen', url: 'FB Hat 3.wav' },
                { name: 'hihat1', url: 'FB Hat 6.wav' }
            ];
            
            console.log('🔧 Loading drum samples...');
            
            for (const sample of sampleUrls) {
                try {
                    console.log(`🔧 Loading ${sample.name} from ${sample.url}`);
                    
                    const response = await fetch(sample.url);
                    if (!response.ok) {
                        console.warn(`⚠️ Failed to fetch ${sample.name}: ${response.status}`);
                        continue;
                    }
                    
                    const arrayBuffer = await response.arrayBuffer();
                    const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
                    
                    this.samples[sample.name] = audioBuffer;
                    console.log(`✅ ${sample.name} loaded successfully`);
                    
                } catch (sampleError) {
                    console.warn(`⚠️ Failed to load ${sample.name}:`, sampleError);
                    // Continue with other samples even if one fails
                }
            }
            
            console.log('✅ Drum sample loading completed');
            console.log('📊 Loaded samples:', Object.keys(this.samples));
            
        } catch (loadError) {
            console.error('❌ loadDrumSamples failed:', loadError);
            // Ensure samples object exists even if loading fails
            this.samples = this.samples || {};
        }
    }
    
    // Crash-proof preload method
    preloadDrumSamples() {
        try {
            console.log('🔧 preloadDrumSamples called');
            
            if (!this.audioContext || !this.samples) {
                console.warn('⚠️ Cannot preload - no audio context or samples');
                return;
            }
            
            // Safe audio context resume
            const resumePromise = this.audioContext.resume ? this.audioContext.resume() : Promise.resolve();
            
            resumePromise.then(() => {
                try {
                    setTimeout(() => {
                        try {
                            const silentGain = this.audioContext.createGain();
                            silentGain.gain.value = 0; // Silent
                            silentGain.connect(this.audioContext.destination);
                            
                            // Play each sample silently to get it into the buffer
                            const sampleNames = Object.keys(this.samples);
                            console.log('🔧 Preloading samples:', sampleNames);
                            
                            sampleNames.forEach(sampleName => {
                                try {
                                    if (this.samples[sampleName]) {
                                        const source = this.audioContext.createBufferSource();
                                        source.buffer = this.samples[sampleName];
                                        source.connect(silentGain);
                                        source.start();
                                        source.stop(this.audioContext.currentTime + 0.01);
                                        console.log(`✅ Preloaded ${sampleName}`);
                                    }
                                } catch (samplePreloadError) {
                                    console.warn(`⚠️ Failed to preload ${sampleName}:`, samplePreloadError);
                                }
                            });
                            
                            console.log('✅ Sample preload completed');
                        } catch (preloadSetupError) {
                            console.warn('⚠️ Preload setup failed:', preloadSetupError);
                        }
                    }, 100);
                } catch (timeoutError) {
                    console.warn('⚠️ Preload timeout setup failed:', timeoutError);
                }
            }).catch(e => {
                console.warn('⚠️ Could not resume audio context for preload:', e);
            });
            
        } catch (methodError) {
            console.error('❌ preloadDrumSamples method failed:', methodError);
        }
    }
    
    // Crash-proof ADSR envelope parameter setting
    setEnvelopeParam(param, value) {
        try {
            console.log(`🔧 setEnvelopeParam: ${param} = ${value}`);
            
            if (!this.instrumentSettings) {
                console.warn('⚠️ No instrument settings available');
                return;
            }
            
            if (!this.currentInstrument) {
                console.warn('⚠️ No current instrument set');
                return;
            }
            
            if (!this.instrumentSettings[this.currentInstrument]) {
                console.warn(`⚠️ No settings for instrument: ${this.currentInstrument}`);
                return;
            }
            
            this.instrumentSettings[this.currentInstrument][param] = value;
            console.log(`✅ Set ${param} to ${value} for ${this.currentInstrument}`);
            
        } catch (error) {
            console.error('❌ setEnvelopeParam failed:', error);
        }
    }
    
    // Crash-proof instrument setting
    setInstrument(instrument) {
        try {
            console.log(`🔧 setInstrument: ${instrument}`);
            
            if (!instrument) {
                console.warn('⚠️ No instrument provided');
                return null;
            }
            
            const validInstruments = ['synth', 'bass', 'keys', 'drums'];
            if (!validInstruments.includes(instrument)) {
                console.warn(`⚠️ Invalid instrument: ${instrument}`);
                return null;
            }
            
            this.currentInstrument = instrument;
            
            // Return the instrument settings/preset
            const preset = this.instrumentSettings[instrument];
            if (preset) {
                console.log(`✅ Instrument set to: ${instrument}`, preset);
                return preset;
            } else {
                console.warn(`⚠️ No preset found for instrument: ${instrument}`);
                return null;
            }
            
        } catch (error) {
            console.error('❌ setInstrument failed:', error);
            return null;
        }
    }
    
    // Crash-proof emergency cleanup
    setupEmergencyCleanup() {
        try {
            console.log('🔧 Setting up emergency cleanup...');
            
            // Safe window beforeunload handler
            const cleanup = () => {
                try {
                    console.log('🧹 Emergency cleanup triggered');
                    
                    // Stop all active oscillators
                    if (this.activeOscillators) {
                        Object.values(this.activeOscillators).forEach(osc => {
                            try {
                                if (osc && osc.stop) {
                                    osc.stop();
                                }
                            } catch (oscError) {
                                console.warn('⚠️ Failed to stop oscillator:', oscError);
                            }
                        });
                    }
                    
                    // Clear active oscillators
                    this.activeOscillators = {};
                    this.activeGains = {};
                    
                    // Clear safety check interval
                    if (this.safetyCheckInterval) {
                        clearInterval(this.safetyCheckInterval);
                        this.safetyCheckInterval = null;
                        console.log('✅ Safety check interval cleared');
                    }
                    
                    // Close audio context if possible
                    if (this.audioContext && this.audioContext.close) {
                        this.audioContext.close().catch(e => 
                            console.warn('⚠️ Audio context close failed:', e)
                        );
                    }
                    
                    console.log('✅ Emergency cleanup completed');
                } catch (cleanupError) {
                    console.error('❌ Emergency cleanup failed:', cleanupError);
                }
            };
            
            // Multiple cleanup triggers
            if (typeof window !== 'undefined') {
                window.addEventListener('beforeunload', cleanup);
                window.addEventListener('unload', cleanup);
                
                // Visibility change cleanup
                document.addEventListener('visibilitychange', () => {
                    if (document.hidden) {
                        try {
                            // Stop oscillators when page becomes hidden
                            Object.values(this.activeOscillators).forEach(osc => {
                                try {
                                    if (osc && osc.stop) {
                                        osc.stop();
                                    }
                                } catch (oscError) {
                                    console.warn('⚠️ Failed to stop oscillator on visibility change:', oscError);
                                }
                            });
                            this.activeOscillators = {};
                            this.activeGains = {};
                        } catch (visibilityError) {
                            console.warn('⚠️ Visibility change cleanup failed:', visibilityError);
                        }
                    }
                });
            }
            
            console.log('✅ Emergency cleanup handlers registered');
            
        } catch (setupError) {
            console.error('❌ Emergency cleanup setup failed:', setupError);
        }
    }
    
    // Functions imported from notes.js
    noteToFrequency(note) {
        return noteToFrequency.call(this, note);
    }
    
    playNote(note) {
        return playNote.call(this, note);
    }
    
    stopNote(note, forceCleanup = false) {
        return stopNote.call(this, note, forceCleanup);
    }
    
    playNoteWithInstrument(note, instrument) {
        return playNoteWithInstrument.call(this, note, instrument);
    }
    
    // Functions imported from drums.js
    playDrumSound(drumType) {
        console.log('playDrumSound called with:', drumType, 'drumSampler:', this.drumSampler);
        // Use the new drum sampler if available
        if (this.drumSampler) {
            // Map drum types to row indices
            const drumMap = {
                'Kick': 0,
                'Snare': 1,
                'Hat 1': 2,
                'Hat 2': 3,
                'Tom 1': 4,
                'Tom 2': 5,
                'Tom 3': 6,
                'Crash': 7,
                'Ride': 8,
                'Hat O': 9,
                'Clap': 10,
                'Perc': 11
            };
            
            const rowIndex = drumMap[drumType];
            if (rowIndex !== undefined) {
                this.drumSampler.playDrum(rowIndex);
                return;
            }
        }
        
        // Fallback to original drum sounds
        return playDrumSound.call(this, drumType);
    }
    
    createNoiseNode(duration, gain = 0.5) {
        return createNoiseNode.call(this, duration, gain);
    }
    
    createReverbBuffer(intensity) {
        return createReverbBuffer.call(this, intensity);
    }
    
    // Functions imported from arpeggiator.js
    toggleArpeggiator(instrument, enabled, looping = false) {
        return toggleArpeggiator.call(this, instrument, enabled, looping);
    }
    
    startArpeggiator(instrument) {
        return startArpeggiator.call(this, instrument);
    }
    
    stopArpeggiator(instrument) {
        return stopArpeggiator.call(this, instrument);
    }
    
    addNoteToArpeggiator(note, instrument) {
        return addNoteToArpeggiator.call(this, note, instrument);
    }
    
    removeNoteFromArpeggiator(note, instrument) {
        return removeNoteFromArpeggiator.call(this, note, instrument);
    }
    
    // Add this new method to ensure no notes get stuck
    setupEmergencyCleanup() {
        // Add global error handler for audio context
        this.audioContext.addEventListener('statechange', () => {
            if (this.audioContext.state === 'interrupted' || this.audioContext.state === 'suspended') {
                // Force cleanup all active notes
                Object.keys(this.activeOscillators).forEach(note => {
                    try {
                        delete this.activeOscillators[note];
                        delete this.activeGains[note];
                    } catch (e) {
                        console.warn(`Emergency cleanup error for ${note}:`, e);
                    }
                });
            }
        });
        
        // Crash-proof periodic safety check every 10 seconds to clean up any stuck notes
        try {
            this.safetyCheckInterval = setInterval(() => {
                try {
                    console.log('🧹 Running safety check for stuck notes...');
                    
                    // Safely check audio context state
                    if (!this.audioContext || this.audioContext.state !== 'running') {
                        console.log('⚠️ Audio context not running, skipping safety check');
                        return;
                    }
                    
                    const now = this.audioContext.currentTime;
                    const oscillatorKeys = Object.keys(this.activeOscillators || {});
                    
                    if (oscillatorKeys.length === 0) {
                        console.log('✅ No active oscillators to check');
                        return;
                    }
                    
                    console.log(`🔍 Checking ${oscillatorKeys.length} active oscillators...`);
                    
                    let cleanedCount = 0;
                    oscillatorKeys.forEach(note => {
                        try {
                            // Check if oscillator has been playing for more than 15 seconds (increased threshold)
                            const gainData = this.activeGains[note];
                            
                            if (gainData && gainData.startTime && (now - gainData.startTime > 15)) {
                                console.warn(`🧹 Found stuck note ${note} (${(now - gainData.startTime).toFixed(1)}s), cleaning up`);
                                
                                // Safe cleanup without using stopNote to avoid recursion
                                try {
                                    const osc = this.activeOscillators[note];
                                    const gain = this.activeGains[note];
                                    
                                    if (osc && osc.stop) {
                                        osc.stop();
                                    }
                                    if (gain && gain.gain) {
                                        gain.gain.setValueAtTime(0, now);
                                    }
                                    
                                    delete this.activeOscillators[note];
                                    delete this.activeGains[note];
                                    cleanedCount++;
                                    
                                } catch (cleanupError) {
                                    console.warn(`⚠️ Individual cleanup failed for ${note}:`, cleanupError);
                                    // Force removal even if cleanup fails
                                    delete this.activeOscillators[note];
                                    delete this.activeGains[note];
                                    cleanedCount++;
                                }
                            }
                        } catch (noteCheckError) {
                            console.warn(`⚠️ Safety check error for note ${note}:`, noteCheckError);
                            // Safe cleanup on error
                            try {
                                delete this.activeOscillators[note];
                                delete this.activeGains[note];
                                cleanedCount++;
                            } catch (deleteError) {
                                console.warn(`⚠️ Failed to delete note ${note}:`, deleteError);
                            }
                        }
                    });
                    
                    if (cleanedCount > 0) {
                        console.log(`🧹 Safety check cleaned up ${cleanedCount} stuck notes`);
                    } else {
                        console.log('✅ Safety check complete - no cleanup needed');
                    }
                    
                } catch (safetyCheckError) {
                    console.error('❌ Safety check interval failed:', safetyCheckError);
                    // Don't let safety check errors crash the app
                }
            }, 10000); // Increased to 10 seconds to reduce frequency
            
            console.log('✅ Safety check interval configured (10s)');
            
        } catch (intervalSetupError) {
            console.error('❌ Failed to setup safety check interval:', intervalSetupError);
            // App can continue without safety checks
        }
    }
}

export default SynthEngine;