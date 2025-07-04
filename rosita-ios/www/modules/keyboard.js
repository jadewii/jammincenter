class Keyboard {
    constructor(synthEngine) {
        try {
            console.log('🔧 Keyboard constructor starting...');
            
            // Safe initialization with fallbacks
            this.synthEngine = synthEngine || null;
            this.pressedKeys = {};
            this.isInitialized = false;
            
            // Scale options - simplify to only major and minor
            this.scales = {
                major: [0, 2, 4, 5, 7, 9, 11], // C, D, E, F, G, A, B
                minor: [0, 2, 3, 5, 7, 8, 10]  // C, D, Eb, F, G, Ab, Bb
            };
            
            // Current scale
            this.currentScale = 'major';
            
            // Octave for each track
            this.trackOctaves = {
                track1: 4, // synth
                track2: 3, // bass
                track3: 2  // keys
            };
            
            // Track to instrument mapping
            this.trackInstruments = {
                track1: 'synth',
                track2: 'bass',
                track3: 'keys'
            };
            
            // Keep track of last played track for octave control
            this.lastPlayedTrack = 'track1';
            
            if (!this.synthEngine) {
                console.warn('⚠️ Keyboard created without synth engine');
            } else {
                console.log('✅ Keyboard constructor completed successfully');
            }
            
        } catch (error) {
            console.error('❌ Keyboard constructor failed:', error);
            // Ensure minimal working state
            this.synthEngine = null;
            this.pressedKeys = {};
            this.isInitialized = false;
            this.scales = { major: [0, 2, 4, 5, 7, 9, 11], minor: [0, 2, 3, 5, 7, 8, 10] };
            this.currentScale = 'major';
            this.trackOctaves = { track1: 4, track2: 3, track3: 2 };
            this.trackInstruments = { track1: 'synth', track2: 'bass', track3: 'keys' };
            this.lastPlayedTrack = 'track1';
        }
    }
    
    // Crash-proof keyboard setup
    setupKeyboard() {
        try {
            console.log('🔧 setupKeyboard called');
            
            const keyboard = document.getElementById('keyboard');
            if (!keyboard) {
                console.error('❌ Keyboard element not found');
                return;
            }
            
            // Clear existing keyboard
            try {
                keyboard.innerHTML = '';
            } catch (clearError) {
                console.warn('⚠️ Failed to clear keyboard:', clearError);
            }
            
            const octaves = 2;
            const startOctave = 3;
            
            const keyLayout = [
                { note: 'C', isBlack: false },
                { note: 'C#', isBlack: true },
                { note: 'D', isBlack: false },
                { note: 'D#', isBlack: true },
                { note: 'E', isBlack: false },
                { note: 'F', isBlack: false },
                { note: 'F#', isBlack: true },
                { note: 'G', isBlack: false },
                { note: 'G#', isBlack: true },
                { note: 'A', isBlack: false },
                { note: 'A#', isBlack: true },
                { note: 'B', isBlack: false }
            ];
            
            for (let octave = startOctave; octave < startOctave + octaves; octave++) {
                keyLayout.forEach(({ note, isBlack }) => {
                    try {
                        const key = document.createElement('div');
                        const noteName = `${note}${octave}`;
                        key.className = `key ${isBlack ? 'black' : 'white'}`;
                        key.dataset.note = noteName;
                        
                        // Safe frequency calculation
                        try {
                            if (this.synthEngine && this.synthEngine.noteToFrequency) {
                                key.dataset.frequency = this.synthEngine.noteToFrequency(noteName);
                            }
                        } catch (freqError) {
                            console.warn(`⚠️ Failed to calculate frequency for ${noteName}:`, freqError);
                        }
                        
                        // Safe mouse event listeners
                        this.addSafeEventListener(key, 'mousedown', () => {
                            this.playNoteWithFallback(noteName);
                            this.addActiveClass(key);
                            this.recordNoteIfSequencing(noteName);
                        });
                        
                        this.addSafeEventListener(key, 'mouseup', () => {
                            this.stopNoteWithFallback(noteName);
                            this.removeActiveClass(key);
                        });
                        
                        this.addSafeEventListener(key, 'mouseleave', () => {
                            this.stopNoteWithFallback(noteName);
                            this.removeActiveClass(key);
                        });
                        
                        // Safe touch event listeners
                        this.addSafeEventListener(key, 'touchstart', (e) => {
                            try {
                                e.preventDefault();
                                const noteName = key.dataset.note;
                                this.playNoteWithFallback(noteName);
                                this.addActiveClass(key);
                                this.recordNoteIfSequencing(noteName);
                            } catch (touchError) {
                                console.warn('⚠️ Touch start failed:', touchError);
                            }
                        }, { passive: false });
                        
                        this.addSafeEventListener(key, 'touchend', (e) => {
                            try {
                                e.preventDefault();
                                const noteName = key.dataset.note;
                                this.stopNoteWithFallback(noteName);
                                this.removeActiveClass(key);
                            } catch (touchError) {
                                console.warn('⚠️ Touch end failed:', touchError);
                            }
                        }, { passive: false });
                        
                        keyboard.appendChild(key);
                        
                    } catch (keyError) {
                        console.warn(`⚠️ Failed to create key ${note}${octave}:`, keyError);
                    }
                });
            }
            
            this.isInitialized = true;
            console.log('✅ Keyboard setup completed');
            
            // Setup octave buttons
            this.setupOctaveButtons();
            
        } catch (error) {
            console.error('❌ setupKeyboard failed:', error);
        }
    }
    
    // Safe event listener helper
    addSafeEventListener(element, event, handler, options = {}) {
        try {
            element.addEventListener(event, handler, options);
        } catch (eventError) {
            console.warn(`⚠️ Failed to add ${event} listener:`, eventError);
        }
    }
    
    // Safe note playing with fallback
    playNoteWithFallback(noteName) {
        try {
            if (this.synthEngine && this.synthEngine.playNote) {
                this.synthEngine.playNote(noteName);
            } else {
                console.warn(`⚠️ Cannot play note ${noteName} - no synth engine`);
            }
        } catch (playError) {
            console.warn(`⚠️ Failed to play note ${noteName}:`, playError);
        }
    }
    
    // Safe note stopping with fallback
    stopNoteWithFallback(noteName) {
        try {
            if (this.synthEngine && this.synthEngine.stopNote) {
                this.synthEngine.stopNote(noteName);
            }
        } catch (stopError) {
            console.warn(`⚠️ Failed to stop note ${noteName}:`, stopError);
        }
    }
    
    // Safe class manipulation
    addActiveClass(element) {
        try {
            if (element && element.classList) {
                element.classList.add('active');
            }
        } catch (classError) {
            console.warn('⚠️ Failed to add active class:', classError);
        }
    }
    
    removeActiveClass(element) {
        try {
            if (element && element.classList) {
                element.classList.remove('active');
            }
        } catch (classError) {
            console.warn('⚠️ Failed to remove active class:', classError);
        }
    }
    
    // Safe sequencer recording
    recordNoteIfSequencing(noteName) {
        try {
            if (typeof window !== 'undefined' && window.sequencer && window.sequencer.recording) {
                if (window.sequencer.addNoteToSequencer) {
                    window.sequencer.addNoteToSequencer(noteName);
                }
            }
        } catch (recordError) {
            console.warn(`⚠️ Failed to record note ${noteName}:`, recordError);
        }
    }
    
    // Crash-proof octave button setup
    setupOctaveButtons() {
        try {
            console.log('🔧 setupOctaveButtons called');
            
            // Get all octave buttons safely
            const octaveButtons = document.querySelectorAll('.octave-button');
            if (!octaveButtons || octaveButtons.length === 0) {
                console.warn('⚠️ No octave buttons found');
                return;
            }
            
            console.log(`🔧 Found ${octaveButtons.length} octave buttons`);
            
            // Add click event listener to each button
            octaveButtons.forEach((button, index) => {
                try {
                    this.addSafeEventListener(button, 'click', () => {
                        try {
                            const instrument = button.dataset.instrument;
                            const direction = button.dataset.direction;
                            
                            if (!instrument || !direction) {
                                console.warn('⚠️ Missing instrument or direction data on octave button');
                                return;
                            }
                            
                            // Map instrument to track
                            let track = null;
                            for (const [t, i] of Object.entries(this.trackInstruments)) {
                                if (i === instrument) {
                                    track = t;
                                    break;
                                }
                            }
                            
                            if (!track) {
                                console.warn(`⚠️ No track found for instrument: ${instrument}`);
                                return;
                            }
                            
                            // Save old octave for arpeggiator update
                            const oldOctave = this.trackOctaves[track];
                            
                            // Update octave based on direction
                            if (direction === 'down') {
                                this.trackOctaves[track] = Math.max(1, this.trackOctaves[track] - 1);
                            } else if (direction === 'up') {
                                this.trackOctaves[track] = Math.min(7, this.trackOctaves[track] + 1);
                            }
                            
                            const newOctave = this.trackOctaves[track];
                            console.log(`✅ ${instrument} octave changed: ${oldOctave} → ${newOctave}`);
                            
                            // Update arpeggiator notes if it's active
                            try {
                                if (this.synthEngine && 
                                    this.synthEngine.arpeggiators && 
                                    this.synthEngine.arpeggiators[instrument] && 
                                    this.synthEngine.arpeggiators[instrument].enabled) {
                                    this.updateArpeggiatorNotesOctave(instrument, oldOctave, newOctave);
                                }
                            } catch (arpError) {
                                console.warn('⚠️ Failed to update arpeggiator octave:', arpError);
                            }
                            
                        } catch (clickError) {
                            console.warn('⚠️ Octave button click failed:', clickError);
                        }
                    });
                    
                    console.log(`✅ Octave button ${index + 1} configured`);
                } catch (buttonError) {
                    console.warn(`⚠️ Failed to setup octave button ${index + 1}:`, buttonError);
                }
            });
            
            console.log('✅ Octave buttons setup completed');
            
        } catch (error) {
            console.error('❌ setupOctaveButtons failed:', error);
        }
    }
    
    // Crash-proof keyboard events setup
    setupKeyboardEvents() {
        try {
            console.log('🔧 setupKeyboardEvents called');
            
            // Track key mappings
            const trackMappings = {
                // Track 1: q-\
                track1: ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
                // Track 2: a-'
                track2: ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', '\''],
                // Track 3: z-/
                track3: ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/']
            };
            
            // Create key mappings safely
            const keyMap = {};
            try {
                Object.keys(trackMappings).forEach(track => {
                    trackMappings[track].forEach((key, index) => {
                        keyMap[key] = { track, noteIndex: index };
                    });
                });
                console.log('✅ Key mappings created');
            } catch (mappingError) {
                console.error('❌ Failed to create key mappings:', mappingError);
                return;
            }
            
            // Safe window event listeners
            try {
                this.addSafeEventListener(window, 'keydown', (e) => {
                    try {
                        const key = e.key.toLowerCase();
                        
                        // Octave control with 1 and 2 keys - completely isolated from other functions
                        if (key === '1' || key === '2') {
                            try {
                                e.preventDefault(); // Prevent default action
                                
                                // Use the last played track for octave control
                                const track = this.lastPlayedTrack;
                                const instrument = this.trackInstruments[track];
                                const oldOctave = this.trackOctaves[track];
                                
                                if (key === '1') {
                                    this.trackOctaves[track] = Math.max(1, this.trackOctaves[track] - 1);
                                } else {
                                    this.trackOctaves[track] = Math.min(7, this.trackOctaves[track] + 1);
                                }
                                
                                const newOctave = this.trackOctaves[track];
                                console.log(`${instrument} octave: ${newOctave}`);
                                
                                // Update arpeggiator notes if it's active
                                if (this.synthEngine && this.synthEngine.arpeggiators && 
                                    this.synthEngine.arpeggiators[instrument] && 
                                    this.synthEngine.arpeggiators[instrument].enabled) {
                                    this.updateArpeggiatorNotesOctave(instrument, oldOctave, newOctave);
                                }
                            } catch (octaveError) {
                                console.warn('⚠️ Octave control failed:', octaveError);
                            }
                            return; // Exit early to prevent further processing
                        }
                        
                        // Play note based on scale mapping
                        if (keyMap[key] && !this.pressedKeys[key]) {
                            try {
                                this.pressedKeys[key] = true;
                                const { track, noteIndex } = keyMap[key];
                                
                                // Update the last played track
                                this.lastPlayedTrack = track;
                                
                                const octave = this.trackOctaves[track];
                                const instrument = this.trackInstruments[track];
                                
                                const note = this.getNoteFromScale(noteIndex, octave);
                                const noteNameOnly = note.replace(/\d+$/, ''); // Extract just the note name without octave
                                
                                // Check if arpeggiator is on for this instrument
                                if (this.synthEngine && this.synthEngine.arpeggiators && 
                                    this.synthEngine.arpeggiators[instrument] && 
                                    this.synthEngine.arpeggiators[instrument].enabled) {
                                    // Add note to arpeggiator
                                    if (this.synthEngine.addNoteToArpeggiator) {
                                        this.synthEngine.addNoteToArpeggiator(note, instrument);
                                    }
                                } else {
                                    // Play note normally
                                    if (this.synthEngine && this.synthEngine.playNoteWithInstrument) {
                                        this.synthEngine.playNoteWithInstrument(note, instrument);
                                    }
                                }
                                
                                // Safe DOM manipulation for highlighting
                                try {
                                    const section = Math.floor(noteIndex / 4) + 1;
                                    const sectionClass = `section${section}`;
                                    
                                    document.querySelectorAll(`.key`).forEach(keyElement => {
                                        try {
                                            const keyNote = keyElement.dataset.note.replace(/\d+$/, '');
                                            if (keyNote === noteNameOnly) {
                                                keyElement.classList.add('active');
                                                keyElement.classList.add(instrument);
                                                keyElement.classList.add(sectionClass);
                                            }
                                        } catch (highlightError) {
                                            console.warn('⚠️ Key highlight failed:', highlightError);
                                        }
                                    });
                                } catch (domError) {
                                    console.warn('⚠️ DOM manipulation failed:', domError);
                                }
                                
                                // Record note if sequencer is recording
                                this.recordNoteIfSequencing(note);
                                
                            } catch (playError) {
                                console.warn('⚠️ Key play failed:', playError);
                            }
                        }
                        
                    } catch (keydownError) {
                        console.warn('⚠️ Keydown handler failed:', keydownError);
                    }
                });
                
                this.addSafeEventListener(window, 'keyup', (e) => {
                    try {
                        const key = e.key.toLowerCase();
                        if (keyMap[key]) {
                            try {
                                this.pressedKeys[key] = false;
                                const { track, noteIndex } = keyMap[key];
                                const octave = this.trackOctaves[track];
                                const instrument = this.trackInstruments[track];
                                
                                const note = this.getNoteFromScale(noteIndex, octave);
                                const noteNameOnly = note.replace(/\d+$/, '');
                                
                                // Check if arpeggiator is on for this instrument
                                if (this.synthEngine && this.synthEngine.arpeggiators && 
                                    this.synthEngine.arpeggiators[instrument] && 
                                    this.synthEngine.arpeggiators[instrument].enabled) {
                                    // Remove note from arpeggiator
                                    if (this.synthEngine.removeNoteFromArpeggiator) {
                                        this.synthEngine.removeNoteFromArpeggiator(note, instrument);
                                    }
                                } else {
                                    // Stop note normally
                                    if (this.synthEngine && this.synthEngine.stopNote) {
                                        this.synthEngine.stopNote(note);
                                    }
                                }
                                
                                // Safe DOM manipulation for removing highlights
                                try {
                                    document.querySelectorAll(`.key`).forEach(keyElement => {
                                        try {
                                            const keyNote = keyElement.dataset.note.replace(/\d+$/, '');
                                            if (keyNote === noteNameOnly) {
                                                keyElement.classList.remove('active');
                                                keyElement.classList.remove('synth', 'bass', 'keys');
                                                keyElement.classList.remove('section1', 'section2', 'section3');
                                            }
                                        } catch (unhighlightError) {
                                            console.warn('⚠️ Key unhighlight failed:', unhighlightError);
                                        }
                                    });
                                } catch (domError) {
                                    console.warn('⚠️ DOM cleanup failed:', domError);
                                }
                                
                            } catch (stopError) {
                                console.warn('⚠️ Key stop failed:', stopError);
                            }
                        }
                    } catch (keyupError) {
                        console.warn('⚠️ Keyup handler failed:', keyupError);
                    }
                });
                
                console.log('✅ Keyboard event listeners configured');
                
            } catch (eventError) {
                console.error('❌ Failed to setup keyboard events:', eventError);
            }
            
            console.log('✅ setupKeyboardEvents completed');
            
        } catch (error) {
            console.error('❌ setupKeyboardEvents failed:', error);
        }
    }
    
    // Crash-proof note generation
    getNoteFromScale(noteIndex, octave) {
        try {
            const scaleSteps = this.scales[this.currentScale] || this.scales.major;
            const scaleIndex = noteIndex % scaleSteps.length;
            const octaveOffset = Math.floor(noteIndex / scaleSteps.length);
            
            const noteStep = scaleSteps[scaleIndex];
            const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
            const noteName = noteNames[noteStep] || 'C';
            const noteOctave = Math.max(1, Math.min(8, octave + octaveOffset));
            
            return `${noteName}${noteOctave}`;
        } catch (error) {
            console.warn('⚠️ getNoteFromScale failed:', error);
            return 'C4'; // Safe fallback
        }
    }
    
    // Crash-proof arpeggiator octave update
    updateArpeggiatorNotesOctave(instrument, oldOctave, newOctave) {
        try {
            if (!this.synthEngine || !this.synthEngine.arpeggiators) {
                console.warn('⚠️ No arpeggiators available');
                return;
            }
            
            const arp = this.synthEngine.arpeggiators[instrument];
            if (!arp || !arp.notes || !arp.notes.length) return;
            
            // Create new notes array with updated octaves
            const updatedNotes = arp.notes.map(note => {
                try {
                    const noteName = note.slice(0, -1); // Get note without octave
                    return `${noteName}${newOctave}`;
                } catch (noteError) {
                    console.warn(`⚠️ Failed to update note ${note}:`, noteError);
                    return note; // Return original note if update fails
                }
            });
            
            // Update the arpeggiator's notes array
            arp.notes = updatedNotes;
            
            // Also update lastNotes to ensure looping mode uses correct octave
            if (arp.lastNotes && arp.lastNotes.length > 0) {
                try {
                    arp.lastNotes = arp.lastNotes.map(note => {
                        const noteName = note.slice(0, -1);
                        return `${noteName}${newOctave}`;
                    });
                } catch (lastNotesError) {
                    console.warn('⚠️ Failed to update lastNotes:', lastNotesError);
                }
            }
            
            // Store the current octave to help with note removal
            arp.currentOctave = newOctave;
            arp.previousOctave = oldOctave;
            
            console.log(`✅ Updated ${instrument} arpeggiator octave: ${oldOctave} → ${newOctave}`);
            
        } catch (error) {
            console.error('❌ updateArpeggiatorNotesOctave failed:', error);
        }
    }
}

export default Keyboard;