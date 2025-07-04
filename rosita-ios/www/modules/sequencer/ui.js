// New module for UI functionality
class SequencerUI {
    constructor(sequencer) {
        this.sequencer = sequencer;
    }
    
    setupControls() {
        // Initialize sequencer UI elements
        this.sequencer.tempoSlider = document.getElementById('tempo');
        this.sequencer.tempoValue = document.getElementById('tempo-value');
        this.sequencer.playButton = document.getElementById('play-button');
        this.sequencer.stopButton = document.getElementById('stop-button');
        this.sequencer.randomButton = document.getElementById('random-button');
        this.sequencer.clearButton = document.getElementById('clear-button');
        this.sequencer.mixerButton = document.getElementById('mixer-button');
        this.sequencer.muteButton = document.getElementById('mute-track-button');
        
        // Sequencer event listeners
        this.sequencer.tempoSlider.addEventListener('input', (e) => {
            this.sequencer.tempo = parseInt(e.target.value);
            this.sequencer.tempoValue.textContent = this.sequencer.tempo;
            this.sequencer.synthEngine.tempo = this.sequencer.tempo; // Make sure synth engine knows the tempo too
        });
        
        this.sequencer.playButton.addEventListener('click', () => this.sequencer.startSequencer());
        this.sequencer.stopButton.addEventListener('click', () => this.sequencer.stopSequencer());
        this.sequencer.randomButton.addEventListener('click', () => this.sequencer.generateRandomSequence());
        this.sequencer.clearButton.addEventListener('click', () => this.sequencer.clearSequencer());
        
        // Add event listener for mute button
        this.sequencer.muteButton.addEventListener('click', () => {
            this.sequencer.toggleMuteCurrentTrack();
            
            // Update button state when instrument changes
            this.updateMuteButtonState();
        });
        
        // Add event listeners for sequencer octave buttons
        this.setupOctaveButtons();
        
        // Set initial tempo display and sync with synth engine
        this.sequencer.tempoValue.textContent = this.sequencer.tempo;
        this.sequencer.synthEngine.tempo = this.sequencer.tempo;
    }
    
    setupOctaveButtons() {
        const sequencerOctaveButtons = document.querySelectorAll('.sequencer-octave .octave-button');
        sequencerOctaveButtons.forEach(button => {
            button.addEventListener('click', () => {
                const direction = button.dataset.direction;
                
                // Check if we're looking at the drum grid
                const isDrumGrid = document.getElementById('sequencer-grid').classList.contains('drum-machine-grid');
                
                // Completely ignore octave changes for drums - don't do anything
                if (isDrumGrid || this.sequencer.currentInstrument === 'drums') {
                    return; // Exit early without doing anything
                } else {
                    this.sequencer.shiftSequenceOctave(direction);
                }
            });
        });
    }
    
    toggleSequencerStep(index) {
        // Ensure index is valid
        if (index < 0 || index >= this.sequencer.sequencerTracks[this.sequencer.currentInstrument].length) {
            console.warn(`Invalid step index: ${index}`);
            return;
        }
        
        // Get the column of the clicked cell
        const column = index % 8;
        
        // Store previous state and toggle the current cell
        const wasActive = this.sequencer.sequencerTracks[this.sequencer.currentInstrument][index];
        this.sequencer.sequencerTracks[this.sequencer.currentInstrument][index] = !wasActive;
        
        if (this.sequencer.sequencerTracks[this.sequencer.currentInstrument][index]) {
            // For non-drum instruments, implement mono behavior (only one note per column)
            if (this.sequencer.currentInstrument !== 'drums') {
                // If activating, clear other cells in the same column (mono behavior)
                for (let r = 0; r < 12; r++) { 
                    const existingCellIndex = r * 8 + column;
                    if (existingCellIndex !== index && this.sequencer.sequencerTracks[this.sequencer.currentInstrument][existingCellIndex]) {
                        this.sequencer.sequencerTracks[this.sequencer.currentInstrument][existingCellIndex] = false;
                    }
                }
            }
            
            // Play the appropriate sound when activating a cell
            if (this.sequencer.currentInstrument === 'drums') {
                // For drums, get the corresponding drum sound
                const row = Math.floor(index / 8);
                const drumSound = this.sequencer.grid.drumLabels[row];
                
                // Don't play sound for kick, snare, clap, or hi-hat C when toggling or when sequencer is running
                const silentDrums = ['Kick', 'Snare', 'Hat 1', 'Hat 2'];
                if (!silentDrums.includes(drumSound) && !this.sequencer.sequencerRunning) {
                    // Ensure audio context is running
                    this.sequencer.synthEngine.resumeAudioContext();
                    this.sequencer.synthEngine.playDrumSound(drumSound);
                }
            } else {
                // For melodic instruments, play the corresponding note
                const row = Math.floor(index / 8);
                const noteIndex = 11 - row; 
                const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']; 
                const baseOctave = row < 6 ? 4 : 3;
                const octaveOffset = this.sequencer.sequencerOctaveOffsets[this.sequencer.currentInstrument] || 0;
                const octave = baseOctave + octaveOffset;
                const note = `${notes[noteIndex % 12]}${octave}`;
                
                // Only play note when sequencer is not running
                if (!this.sequencer.sequencerRunning) {
                    // Ensure audio context is running
                    this.sequencer.synthEngine.resumeAudioContext();
                    this.sequencer.synthEngine.playNoteWithInstrument(note, this.sequencer.currentInstrument);
                    setTimeout(() => this.sequencer.synthEngine.stopNote(note), 200);
                }
            }
        }
        
        // Refresh the grid display
        this.sequencer.grid.createGrid();
        
        // CSS handles all drum colors now - no JavaScript needed!
        
        // Auto-save after toggle
        this.sequencer.memory.savePatternWithUI(this.sequencer.currentPatternIndex);
    }
    
    updateMuteButtonState() {
        if (!this.sequencer.muteButton) return;
        
        const instrument = this.sequencer.currentInstrument;
        
        // Enable button for all instruments including drums
        this.sequencer.muteButton.disabled = false;
        this.sequencer.muteButton.title = "Mute current track";
        
        if (this.sequencer.isTrackMuted(instrument)) {
            this.sequencer.muteButton.classList.add('active');
            
            // If we're looking at drums and they're muted, update the grid to show all drums as muted
            if (instrument === 'drums' && this.sequencer.grid) {
                this.sequencer.grid.createGrid();
            }
        } else {
            this.sequencer.muteButton.classList.remove('active');
        }
    }
}

export default SequencerUI;