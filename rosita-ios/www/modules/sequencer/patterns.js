class SequencerPatterns {
    constructor(sequencer) {
        this.sequencer = sequencer;
    }
    
    generateRandomSequence() {
        // Clear current sequence first
        this.clearSequencer();
        
        // Only generate pattern for the current instrument
        if (this.sequencer.currentInstrument === 'drums') {
            // Create classic drum patterns instead of random ones
            this.generateClassicDrumPattern();
        } else {
            // Generate random melodic pattern for the current instrument only
            this.generateRandomMelodicPattern(this.sequencer.currentInstrument);
        }
        
        // Update the grid after pattern generation
        this.sequencer.grid.createGrid();
    }
    
    generateClassicDrumPattern() {
        // Define classic drum pattern templates
        const classicPatterns = [
            // Basic Rock Pattern
            {
                kick: [0, 4],           // Beats 1 and 5
                snare: [2, 6],          // Beats 3 and 7
                hat1: [0, 1, 2, 3, 4, 5, 6, 7], // Every beat
                hat2: [1, 3, 5, 7]      // Off-beats
            },
            // Funk Pattern
            {
                kick: [0, 3, 6],        // Syncopated kick
                snare: [2, 6],          // Backbeats
                hat1: [1, 4, 5, 7],     // Sparse hi-hat
                hat2: [0, 2, 4, 6]      // Quarter notes
            },
            // Disco Pattern
            {
                kick: [0, 2, 4, 6],     // Four on the floor
                snare: [2, 6],          // Backbeats
                hat1: [1, 3, 5, 7],     // Off-beats
                hat2: [0, 1, 2, 3, 4, 5, 6, 7] // Continuous
            },
            // Breakbeat Pattern
            {
                kick: [0, 5],           // Syncopated
                snare: [2, 3, 6],       // Complex snare
                hat1: [1, 4, 7],        // Sparse placement
                hat2: [0, 2, 4, 6]      // Steady rhythm
            },
            // Latin Pattern
            {
                kick: [0, 3, 5],        // Latin kick pattern
                snare: [2, 7],          // Accent beats
                hat1: [0, 1, 3, 4, 6, 7], // Syncopated
                hat2: [1, 2, 5, 6]      // Counter-rhythm
            }
        ];
        
        // Randomly select a classic pattern
        const selectedPattern = classicPatterns[Math.floor(Math.random() * classicPatterns.length)];
        
        // Apply the pattern to the grid
        const kickRow = 0;  // Kick drum row
        const snareRow = 1; // Snare row
        const hat1Row = 2;  // Hat 1 row
        const hat2Row = 3;  // Hat 2 row
        
        // Set kick pattern
        selectedPattern.kick.forEach(col => {
            this.sequencer.sequencerTracks.drums[kickRow * 8 + col] = true;
        });
        
        // Set snare pattern
        selectedPattern.snare.forEach(col => {
            this.sequencer.sequencerTracks.drums[snareRow * 8 + col] = true;
        });
        
        // Set hat 1 pattern
        selectedPattern.hat1.forEach(col => {
            this.sequencer.sequencerTracks.drums[hat1Row * 8 + col] = true;
        });
        
        // Set hat 2 pattern
        selectedPattern.hat2.forEach(col => {
            this.sequencer.sequencerTracks.drums[hat2Row * 8 + col] = true;
        });
    }
    
    generateRandomMelodicPattern(instrument) {
        // Create patterns based on current scale
        const currentScale = window.keyboard ? window.keyboard.currentScale : 'major';
        
        // Generate random melodic pattern
        for (let col = 0; col < 8; col++) {
            // 40% chance of a note on each column
            if (Math.random() < 0.4) {
                // Pick a random row from 0-11 that's within the scale
                let row;
                if (currentScale === 'major') {
                    const scaleRows = [0, 2, 4, 5, 7, 9, 11]; // C, D, E, F, G, A, B
                    row = scaleRows[Math.floor(Math.random() * scaleRows.length)];
                } else {
                    const scaleRows = [0, 2, 3, 5, 7, 8, 10]; // C, D, Eb, F, G, Ab, Bb
                    row = scaleRows[Math.floor(Math.random() * scaleRows.length)];
                }
                
                // Set the note in the grid
                this.sequencer.sequencerTracks[instrument][row * 8 + col] = true;
            }
        }
    }
    
    clearSequencer() {
        // Reset only the current instrument track
        this.sequencer.sequencerTracks[this.sequencer.currentInstrument] = Array(96).fill(false);
        
        // Update the grid
        this.sequencer.grid.createGrid();
    }
    
    convertAllNotesToScale(fromScale, toScale) {
        // Define scale patterns (row indices in the grid)
        const scales = {
            major: [0, 2, 4, 5, 7, 9, 11], // C, D, E, F, G, A, B
            minor: [0, 2, 3, 5, 7, 8, 10]  // C, D, Eb, F, G, Ab, Bb
        };
        
        // Get the scale arrays
        const fromRows = scales[fromScale];
        const toRows = scales[toScale];
        
        // Only process melodic instruments (not drums)
        for (const instrument of ['synth', 'bass', 'keys']) {
            // Create a new track array to avoid issues with modifying while iterating
            const newTrack = Array(96).fill(false);
            
            // Process each row and column in the grid
            for (let col = 0; col < 8; col++) {
                // Check ALL rows (0-11) for existing notes
                for (let row = 0; row < 12; row++) {
                    const oldIndex = row * 8 + col;
                    
                    // If a note exists at this position
                    if (this.sequencer.sequencerTracks[instrument][oldIndex]) {
                        // Find the nearest scale note in the target scale
                        let nearestScaleRow = toRows[0]; // Default to first note of target scale
                        let minDistance = Math.abs(row - nearestScaleRow);
                        
                        // Find the closest note in the target scale
                        for (let i = 0; i < toRows.length; i++) {
                            const distance = Math.abs(row - toRows[i]);
                            if (distance < minDistance) {
                                minDistance = distance;
                                nearestScaleRow = toRows[i];
                            }
                        }
                        
                        // Set the note in the nearest scale position
                        const newIndex = nearestScaleRow * 8 + col;
                        newTrack[newIndex] = true;
                    }
                }
            }
            
            // Update the track with the converted notes
            this.sequencer.sequencerTracks[instrument] = newTrack;
        }
        
        // Update grid if current instrument is not drums
        if (this.sequencer.currentInstrument !== 'drums') {
            this.sequencer.grid.createGrid();
        }
    }
    
    convertCurrentInstrumentToScale(targetScale) {
        // Don't convert drums
        if (this.sequencer.currentInstrument === 'drums') {
            return;
        }
        
        // Define scale patterns (row indices in the grid) 
        const scales = {
            major: [0, 2, 4, 5, 7, 9, 11], // C, D, E, F, G, A, B
            minor: [0, 2, 3, 5, 7, 8, 10]  // C, D, Eb, F, G, Ab, Bb
        };
        
        const targetScaleRows = scales[targetScale];
        const instrument = this.sequencer.currentInstrument;
        
        // Create a new track array
        const newTrack = Array(96).fill(false);
        
        // Process each column to maintain rhythm
        for (let col = 0; col < 8; col++) {
            // Find if there's any note in this column
            let foundNote = false;
            let originalRow = -1;
            
            // Check all rows in this column for existing notes
            for (let row = 0; row < 12; row++) {
                const oldIndex = row * 8 + col;
                if (this.sequencer.sequencerTracks[instrument][oldIndex]) {
                    foundNote = true;
                    originalRow = row;
                    break; // Take the first note found in this column
                }
            }
            
            // If we found a note, map it to the scale
            if (foundNote) {
                // Map the original row to a scale position
                // Use modulo to wrap within scale length and map to scale rows
                const scaleIndex = originalRow % targetScaleRows.length;
                const newRow = targetScaleRows[scaleIndex];
                const newIndex = newRow * 8 + col;
                newTrack[newIndex] = true;
            }
        }
        
        // Update only the current instrument's track
        this.sequencer.sequencerTracks[instrument] = newTrack;
    }
}

export default SequencerPatterns;