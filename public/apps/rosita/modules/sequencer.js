import SequencerGrid from './sequencer/grid.js';
import SequencerPlayer from './sequencer/playback/index.js';
import SequencerPatterns from './sequencer/patterns.js';
import SequencerNavigation from './sequencer/navigation.js';
import SequencerMemory from './sequencer/memory.js';
import SequencerUI from './sequencer/ui.js';
import SequencerMixer from './sequencer/mixer.js';

class Sequencer {
    constructor(synthEngine) {
        this.synthEngine = synthEngine;
        this.sequencerRunning = false;
        this.recording = false;
        this.tempo = 120; // BPM
        this.currentStep = 0;
        
        // Create separate sequencer data for each instrument (4 tracks including drums)
        this.sequencerTracks = {
            synth: Array(96).fill(false), 
            bass: Array(96).fill(false),
            keys: Array(96).fill(false),
            drums: Array(96).fill(false)
        };
        
        // Add mixer mode flag
        this.mixerMode = false;
        
        // Add volume levels for each instrument track (4 tracks including drums)
        this.volumeLevels = {
            synth: 0.6,
            bass: 0.6,
            keys: 0.6,
            drums: 0.8
        };
        
        this.currentInstrument = 'synth';
        
        // Change to track octave offsets per instrument (4 tracks including drums)
        this.sequencerOctaveOffsets = {
            synth: 0,
            bass: 0,
            keys: 0,
            drums: 0
        };
        
        // Add tracking for muted instrument tracks (4 tracks including drums)
        this.mutedTracks = {
            synth: false,
            bass: false,
            keys: false,
            drums: false
        };
        
        // Add current pattern index tracking
        this.currentPatternIndex = 0; // Default to first pattern
        
        // Initialize sub-modules
        this.grid = new SequencerGrid(this);
        this.player = new SequencerPlayer(this);
        this.patterns = new SequencerPatterns(this);
        this.navigation = new SequencerNavigation(this);
        this.memory = new SequencerMemory(this);
        this.ui = new SequencerUI(this);
        this.mixer = new SequencerMixer(this);
        
        // Make sequencer accessible globally for the keyboard to use
        window.sequencer = this;
    }
    
    setupSequencer() {
        // Setup UI controls
        this.ui.setupControls();
        
        // Setup pattern memory buttons
        this.memory.setupPatternButtons();
        
        // Setup sequencer grid
        this.grid.createGrid();
        
        // Setup keyboard navigation
        this.navigation.setupKeyboardNavigation();
        
        // Setup mixer
        this.mixer.setupMixer();
    }
    
    // Delegator methods that pass calls to appropriate modules
    startSequencer() {
        this.player.startSequencer();
    }
    
    stopSequencer() {
        this.player.stopSequencer();
    }
    
    generateRandomSequence() {
        this.patterns.generateRandomSequence();
        
        // Auto-save after generating random sequence
        this.memory.savePatternWithUI(this.currentPatternIndex);
    }
    
    clearSequencer() {
        this.patterns.clearSequencer();
        
        // Auto-save after clearing
        this.memory.savePatternWithUI(this.currentPatternIndex);
    }
    
    toggleSequencerStep(index) {
        if (this.mixerMode) {
            this.mixer.handleMixerStepClick(index);
        } else {
            this.ui.toggleSequencerStep(index);
        }
    }
    
    setCurrentInstrument(instrument) {
        // Reset selected cell index when switching instruments to prevent issues
        // when going between drum mode and melodic instrument modes
        this.selectedCellIndex = -1;
        
        this.currentInstrument = instrument;
        // Update grid to show current instrument's pattern
        if (!this.mixerMode) {
            this.grid.createGrid();
        }
    }
    
    // Add method to toggle mixer mode
    toggleMixerMode() {
        this.mixerMode = !this.mixerMode;
        
        // Update grid display based on current mode
        if (this.mixerMode) {
            this.mixer.createMixerGrid();
            document.getElementById('mixer-button').classList.add('active');
        } else {
            // Clean up mixer mode first
            const sequencerGrid = document.getElementById('sequencer-grid');
            sequencerGrid.classList.remove('mixer-grid');
            sequencerGrid.classList.remove('mixer-grid-vertical');
            
            // Now create the regular grid
            this.grid.createGrid();
            document.getElementById('mixer-button').classList.remove('active');
        }
        
        console.log(`Mixer mode ${this.mixerMode ? 'enabled' : 'disabled'}`);
    }
    
    // Add method to get instrument volume
    getInstrumentVolume(instrument) {
        return this.volumeLevels[instrument] || 0.6;
    }
    
    // Add method to get drum volume
    getDrumVolume(drumType) {
        return this.volumeLevels.drums[drumType] || 0.8;
    }
    
    // Add method to set instrument volume
    setInstrumentVolume(instrument, volume) {
        if (instrument === 'drums') {
            return; // Skip direct 'drums' setting as we use individual drum types
        }
        
        // Validate volume to ensure it's within bounds
        volume = Math.max(0, Math.min(1, volume));
        
        this.volumeLevels[instrument] = volume;
        
        // Update the synth engine's instrument settings safely
        try {
            if (this.synthEngine.instrumentSettings[instrument]) {
                this.synthEngine.instrumentSettings[instrument].volume = volume;
            }
        } catch (e) {
            console.warn(`Error updating instrument volume for ${instrument}:`, e);
        }
        
        console.log(`${instrument} volume set to ${volume}`);
    }
    
    // Add method to set drum volume
    setDrumVolume(drumType, volume) {
        // Validate volume to ensure it's within bounds
        volume = Math.max(0, Math.min(1, volume));
        
        if (!this.volumeLevels.drums) {
            this.volumeLevels.drums = {};
        }
        
        this.volumeLevels.drums[drumType] = volume;
        console.log(`${drumType} volume set to ${volume}`);
    }
    
    addNoteToSequencer(note) {
        if (this.recording) {
            // Extract note name and octave
            const noteName = note.slice(0, -1);
            const octave = parseInt(note.slice(-1));
            
            // Extended note map to handle more rows
            if ((octave === 3 || octave === 4) && !noteName.includes('#')) {
                // Map notes to rows
                const noteMap = {
                    'C3': 11, 'D3': 10, 'E3': 9, 'F3': 8, 
                    'G3': 7, 'A3': 6, 'B3': 5, 'C4': 4,
                    'D4': 3, 'E4': 2, 'F4': 1, 'G4': 0
                };
                
                if (noteMap[note] !== undefined) {
                    const row = noteMap[note];
                    const column = this.currentStep % 8;
                    const cellIndex = row * 8 + column;
                    
                    // Clear any existing notes in this column for this instrument
                    for (let r = 0; r < 12; r++) { 
                        const existingIndex = r * 8 + column;
                        this.sequencerTracks[this.currentInstrument][existingIndex] = false;
                    }
                    
                    // Set the new note
                    this.sequencerTracks[this.currentInstrument][cellIndex] = true;
                    
                    // Update the grid
                    this.grid.createGrid();
                    
                    // Auto-save after adding note
                    this.memory.savePatternWithUI(this.currentPatternIndex);
                    
                    // Move to next step
                    this.currentStep = (this.currentStep + 1) % 8;
                }
            }
        }
    }

    shiftSequenceOctave(direction, forceInstrument = null) {
        // Use forced instrument if provided, otherwise use current instrument
        const instrument = forceInstrument || this.currentInstrument;
        
        // Handle drums differently - use octave to select which set of drum sounds
        if (instrument === 'drums') {
            if (direction === 'up') {
                this.sequencerOctaveOffsets.drums = Math.min(2, this.sequencerOctaveOffsets.drums + 1);
            } else {
                this.sequencerOctaveOffsets.drums = Math.max(0, this.sequencerOctaveOffsets.drums - 1);
            }
            
            // Update the grid to show the new set of drum sounds
            this.grid.createGrid();
            
            console.log(`Drum set: ${this.sequencerOctaveOffsets.drums}`);
            return;
        }
        
        // Save old octave offset for arpeggiator update
        const oldOffset = this.sequencerOctaveOffsets[instrument] || 0;
        
        // Update the octave offset for only the current instrument
        if (direction === 'up') {
            this.sequencerOctaveOffsets[instrument] = Math.min(2, this.sequencerOctaveOffsets[instrument] + 1);
        } else {
            this.sequencerOctaveOffsets[instrument] = Math.max(-2, this.sequencerOctaveOffsets[instrument] - 1);
        }
        
        const newOffset = this.sequencerOctaveOffsets[instrument];
        
        // Update arpeggiator notes if it's active
        if (this.synthEngine.arpeggiators[instrument] && 
            this.synthEngine.arpeggiators[instrument].enabled) {
            // Calculate actual octaves from offsets (assuming base octave of 4)
            const baseOctave = 4;
            const oldOctave = baseOctave + oldOffset;
            const newOctave = baseOctave + newOffset;
            
            // Use the keyboard's method to update arpeggiator notes
            if (window.keyboard) {
                window.keyboard.updateArpeggiatorNotesOctave(instrument, oldOctave, newOctave);
            }
        }
        
        // Save pattern after octave change
        this.memory.savePatternWithUI(this.currentPatternIndex);
        
        console.log(`${instrument} octave offset: ${this.sequencerOctaveOffsets[instrument]}`);
    }
    
    toggleDrumMute(drumSound) {
        // Toggle mute state
        this.mutedDrums[drumSound] = !this.mutedDrums[drumSound];
        console.log(`${drumSound} ${this.mutedDrums[drumSound] ? 'muted' : 'unmuted'}`);
        return this.mutedDrums[drumSound];
    }
    
    isDrumMuted(drumSound) {
        return this.mutedDrums[drumSound] === true;
    }

    toggleMuteCurrentTrack() {
        // Get current instrument
        const instrument = this.currentInstrument;
        
        // Toggle mute state for all instruments including drums
        this.mutedTracks[instrument] = !this.mutedTracks[instrument];
        
        // Update UI to reflect mute state
        const muteButton = document.getElementById('mute-track-button');
        if (this.mutedTracks[instrument]) {
            muteButton.classList.add('active');
            
            // Update grid if this is the drums track to show all drums as muted
            if (instrument === 'drums' && this.grid) {
                this.grid.createGrid();
            }
        } else {
            muteButton.classList.remove('active');
            
            // Update grid if this is the drums track to show drums as unmuted
            if (instrument === 'drums' && this.grid) {
                this.grid.createGrid();
            }
        }
        
        console.log(`${instrument} track ${this.mutedTracks[instrument] ? 'muted' : 'unmuted'}`);
        
        return this.mutedTracks[instrument];
    }

    isTrackMuted(instrument) {
        return this.mutedTracks[instrument] === true;
    }
}

export default Sequencer;