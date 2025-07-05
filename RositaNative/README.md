# Rosita - Native iOS Synthesizer

A professional iOS synthesizer app built with SwiftUI and AudioKit, featuring a 16-step sequencer, real-time synthesis, and comprehensive effects chain.

## Features

✅ **Audio Engine**
- AudioKit-powered oscillator with 4 waveforms (Sine, Sawtooth, Square, Triangle)
- Full ADSR envelope control
- Low-latency audio (5ms buffer)
- Professional audio session configuration

✅ **Sequencer**
- 16-step x 8-note grid
- Real-time pattern playback
- Visual feedback for current step
- BPM control (60-200)
- Clear and randomize functions

✅ **Effects Chain**
- **Delay**: Time, feedback, and mix controls
- **Reverb**: Large hall preset with mix control
- **Saturation**: TanhDistortion for warmth
- **Filter**: Low-pass with cutoff and resonance

✅ **Touch-Optimized UI**
- Responsive piano keyboard
- Color-coded sequencer grid
- Haptic feedback on all interactions
- Landscape-only orientation
- Pink gradient theme matching original Rosita

## Project Structure

```
RositaNative/
├── RositaApp.swift          # App entry point
├── ContentView.swift        # Main layout
├── SynthEngine.swift        # Core audio engine
├── InstrumentSelectorView.swift
├── WaveformSelectorView.swift
├── ADSRControlsView.swift
├── EffectsControlsView.swift
├── TransportControlsView.swift
├── SequencerGridView.swift
├── PianoKeyboardView.swift
├── Info.plist
└── Package.swift
```

## Setup Instructions

1. **Create Xcode Project**
   - Open Xcode
   - Create new iOS App
   - Product Name: Rosita
   - Bundle ID: com.jadewii.rosita
   - Interface: SwiftUI
   - Language: Swift

2. **Add AudioKit Dependencies**
   - File → Add Package Dependencies
   - Add Swift Package Collection:
     ```
     https://swiftpackageindex.com/AudioKit/collection.json
     ```
   - Select and add:
     - AudioKit
     - AudioKitEX
     - SoundpipeAudioKit

3. **Copy Source Files**
   - Replace default files with the provided Swift files
   - Ensure Info.plist is included

4. **Build & Run**
   - Select iPhone or iPad simulator
   - Press ⌘+R to build and run
   - Rotate to landscape orientation

## Usage

1. **Playing Notes**: Touch the piano keys to play notes
2. **Creating Patterns**: Tap cells in the sequencer grid
3. **Playback**: Hit the play button to start the sequencer
4. **Sound Design**: 
   - Select waveform type
   - Adjust ADSR envelope
   - Add effects to taste

## Technical Details

- **AudioKit Version**: 5.6+
- **iOS Minimum**: 16.0
- **Orientation**: Landscape only
- **Audio Latency**: 5ms buffer
- **Sample Rate**: Device default (typically 48kHz)

## Differences from Web Version

This native iOS version includes:
- True low-latency audio
- Haptic feedback
- Optimized touch handling
- Native iOS animations
- Professional audio session management

## Future Enhancements

- Pattern saving/loading
- Multiple pattern banks
- MIDI support
- Audio recording
- More waveform options
- Additional effects (chorus, phaser)
- Arpeggiator modes

## License

Created by jadewii