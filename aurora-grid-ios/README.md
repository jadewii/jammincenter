# Aurora Grid - Professional iOS Step Sequencer

A beautiful, professional drum sequencer for iOS with the JAdeWii design aesthetic.

## Features

- 16-step x 6-track drum sequencer
- 6 synthesized drum sounds (Kick, Snare, Hi-Hat, Open Hat, Crash, Bass)
- 4 pattern banks with seamless switching
- Real-time playback with BPM control (60-200)
- Professional swing timing
- Pattern randomization
- Per-track mute/solo
- 6 global effects (Volume, Filter, Reverb, Delay, Drive, Compression)
- 6 per-sound parameters (Pitch, Decay, Tone, Snap, Punch, Warm)
- Beautiful pastel gradient design
- Landscape orientation optimized
- Low-latency AudioKit synthesis

## Building the App

1. Open `AuroraGrid.xcodeproj` in Xcode
2. Select your development team in project settings
3. Connect your iOS device or select a simulator
4. Build and run (Cmd+R)

## Requirements

- iOS 15.0+
- Xcode 15.0+
- AudioKit 5.6+

## Architecture

- SwiftUI for UI
- AudioKit for audio synthesis
- Combine for reactive updates
- Timer-based sequencer with precise timing
- Professional audio session configuration

## UI Layout

- **Top Bar**: Title, Play/Stop, Clear, BPM control
- **Main Grid**: 6 tracks x 16 steps with visual feedback
- **Bottom Controls**: 
  - Pattern banks with swing control
  - Effects rack
  - Sound design parameters

## Technical Highlights

- Synthesized drums using AudioKit oscillators and noise generators
- Real-time audio effects chain
- Responsive knob controls with haptic feedback
- Visual step indicator during playback
- Professional swing implementation
- Optimized for iOS performance

## License

© 2025 JAdeWii. All rights reserved.