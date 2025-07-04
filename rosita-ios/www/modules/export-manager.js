// Export manager for handling WAV, MIDI, and project files
// Tauri imports with fallback for development mode

export default class ExportManager {
    constructor(synthEngine, sequencer) {
        this.synthEngine = synthEngine;
        this.sequencer = sequencer;
        this.setupTauriListeners();
    }

    setupTauriListeners() {
        // Listen for menu events from Tauri (with fallback)
        try {
            if (window.__TAURI__ && window.__TAURI__.event) {
                window.__TAURI__.event.listen('menu_export_wav', () => {
                    this.exportWAV();
                });

                window.__TAURI__.event.listen('menu_export_midi', () => {
                    this.exportMIDI();
                });

                window.__TAURI__.event.listen('menu_save_project', () => {
                    this.saveProject();
                });

                window.__TAURI__.event.listen('menu_load_project', () => {
                    this.loadProject();
                });
                
                console.log('✅ Tauri menu listeners set up');
            } else {
                console.log('⚠️ Tauri not available - menu export disabled');
            }
        } catch (error) {
            console.warn('⚠️ Failed to setup Tauri listeners:', error);
        }
    }

    async exportWAV() {
        try {
            console.log('Starting WAV export...');
            
            // Get the current pattern and tempo
            const pattern = this.sequencer.getCurrentPattern();
            const tempo = this.sequencer.tempo || 120;
            
            // Calculate pattern duration (96 steps at current tempo)
            const stepDuration = 60 / (tempo * 4); // 16th notes
            const patternDuration = stepDuration * 96;
            
            // Create offline audio context for rendering
            const sampleRate = 44100;
            const offlineContext = new OfflineAudioContext(2, sampleRate * patternDuration, sampleRate);
            
            // Render the pattern
            await this.renderPatternToContext(offlineContext, pattern, tempo);
            
            // Start rendering
            const renderedBuffer = await offlineContext.startRendering();
            
            // Convert to WAV
            const wavData = this.audioBufferToWav(renderedBuffer);
            
            // Save file (with fallback)
            console.log('WAV export completed - would save to file in full Tauri mode');
            alert('WAV export prepared! (File save requires full Tauri mode)');
        } catch (error) {
            console.error('WAV export failed:', error);
            alert('WAV export failed: ' + error.message);
        }
    }

    async exportMIDI() {
        try {
            console.log('Starting MIDI export...');
            
            const pattern = this.sequencer.getCurrentPattern();
            const tempo = this.sequencer.tempo || 120;
            
            // Create MIDI data
            const midiData = this.createMIDIFromPattern(pattern, tempo);
            
            // Save file (with fallback)
            console.log('MIDI export completed - would save to file in full Tauri mode');
            alert('MIDI export prepared! (File save requires full Tauri mode)');
        } catch (error) {
            console.error('MIDI export failed:', error);
            alert('MIDI export failed: ' + error.message);
        }
    }

    async saveProject() {
        try {
            console.log('Starting project save...');
            
            // Gather all project data
            const projectData = {
                version: '1.0.0',
                timestamp: Date.now(),
                patterns: this.sequencer.memory.patterns,
                currentPattern: this.sequencer.currentPatternIndex,
                tempo: this.sequencer.tempo,
                instruments: {
                    synth: this.synthEngine.instruments.synth.getSettings(),
                    bass: this.synthEngine.instruments.bass.getSettings(),
                    keys: this.synthEngine.instruments.keys.getSettings(),
                    drums: this.synthEngine.instruments.drums.getSettings()
                },
                adsr: {
                    attack: document.getElementById('attack')?.value,
                    decay: document.getElementById('decay')?.value,
                    sustain: document.getElementById('sustain')?.value,
                    release: document.getElementById('release')?.value
                }
            };
            
            // Save file (with fallback)
            console.log('Project save completed - would save to file in full Tauri mode');
            console.log('Project data:', projectData);
            alert('Project save prepared! (File save requires full Tauri mode)');
        } catch (error) {
            console.error('Project save failed:', error);
            alert('Project save failed: ' + error.message);
        }
    }

    async loadProject() {
        try {
            console.log('Starting project load...');
            
            // Open file dialog (with fallback)
            console.log('Project load initiated - requires full Tauri mode for file selection');
            alert('Project load requires full Tauri mode for file selection');
            return;
            
            // This code would run in full Tauri mode:
            if (false) {
                const projectData = {};
                
                // Restore patterns
                this.sequencer.memory.patterns = projectData.patterns;
                this.sequencer.currentPatternIndex = projectData.currentPattern || 0;
                this.sequencer.tempo = projectData.tempo || 120;
                
                // Update tempo display
                const tempoSlider = document.getElementById('tempo');
                const tempoValue = document.getElementById('tempo-value');
                if (tempoSlider && tempoValue) {
                    tempoSlider.value = this.sequencer.tempo;
                    tempoValue.textContent = this.sequencer.tempo;
                }
                
                // Restore ADSR settings
                if (projectData.adsr) {
                    ['attack', 'decay', 'sustain', 'release'].forEach(param => {
                        const slider = document.getElementById(param);
                        const display = document.getElementById(param + '-value');
                        if (slider && display && projectData.adsr[param]) {
                            slider.value = projectData.adsr[param];
                            display.textContent = projectData.adsr[param];
                        }
                    });
                }
                
                // Refresh UI
                this.sequencer.memory.loadPattern(this.sequencer.currentPatternIndex);
                this.sequencer.grid.createGrid();
                
                console.log('Project loaded successfully from:', filePath);
            }
        } catch (error) {
            console.error('Project load failed:', error);
            alert('Project load failed: ' + error.message);
        }
    }

    getCurrentPattern() {
        return this.sequencer.memory.patterns[this.sequencer.currentPatternIndex] || {
            synth: Array(96).fill(false),
            bass: Array(96).fill(false),
            keys: Array(96).fill(false),
            drums: Array(96).fill(false)
        };
    }

    async renderPatternToContext(context, pattern, tempo) {
        // This is a simplified version - you would need to implement
        // full audio rendering based on your synth engine
        // For now, just create silence
        return Promise.resolve();
    }

    audioBufferToWav(buffer) {
        // Convert AudioBuffer to WAV format
        const length = buffer.length;
        const numberOfChannels = buffer.numberOfChannels;
        const sampleRate = buffer.sampleRate;
        
        const arrayBuffer = new ArrayBuffer(44 + length * numberOfChannels * 2);
        const view = new DataView(arrayBuffer);
        
        // WAV header
        const writeString = (offset, string) => {
            for (let i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        };
        
        writeString(0, 'RIFF');
        view.setUint32(4, 36 + length * numberOfChannels * 2, true);
        writeString(8, 'WAVE');
        writeString(12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, numberOfChannels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * numberOfChannels * 2, true);
        view.setUint16(32, numberOfChannels * 2, true);
        view.setUint16(34, 16, true);
        writeString(36, 'data');
        view.setUint32(40, length * numberOfChannels * 2, true);
        
        // Convert float samples to 16-bit PCM
        let offset = 44;
        for (let i = 0; i < length; i++) {
            for (let channel = 0; channel < numberOfChannels; channel++) {
                const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
                view.setInt16(offset, sample * 0x7FFF, true);
                offset += 2;
            }
        }
        
        return new Uint8Array(arrayBuffer);
    }

    createMIDIFromPattern(pattern, tempo) {
        // Basic MIDI file creation
        // This is a simplified implementation
        const midiData = [];
        
        // MIDI header
        midiData.push(...[0x4D, 0x54, 0x68, 0x64]); // "MThd"
        midiData.push(...[0x00, 0x00, 0x00, 0x06]); // Header length
        midiData.push(...[0x00, 0x00]); // Format 0
        midiData.push(...[0x00, 0x01]); // 1 track
        midiData.push(...[0x00, 0x60]); // 96 ticks per quarter note
        
        // Track header
        midiData.push(...[0x4D, 0x54, 0x72, 0x6B]); // "MTrk"
        
        // Track data would go here (simplified for now)
        const trackData = [0x00, 0xFF, 0x2F, 0x00]; // End of track
        
        // Track length
        midiData.push(...[
            (trackData.length >>> 24) & 0xFF,
            (trackData.length >>> 16) & 0xFF,
            (trackData.length >>> 8) & 0xFF,
            trackData.length & 0xFF
        ]);
        
        midiData.push(...trackData);
        
        return midiData;
    }
}