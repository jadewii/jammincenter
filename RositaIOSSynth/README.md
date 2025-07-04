# Rosita iOS Synth

A beautiful synthesizer app built with SwiftUI and AudioKit for iOS.

## Features

- 🎹 **Full Piano Keyboard**: 2-octave touch-responsive keyboard
- 🎛️ **Live Effects**: Delay, Reverb, Saturation, and Chorus with real-time control
- 🎨 **Neon Retro Design**: Dark theme with vibrant neon accents
- 🎵 **Test Tone**: A440 test tone to preview effects
- 📱 **Responsive Layout**: Optimized for both iPhone and iPad

## Audio Signal Chain

```
Oscillator → Envelope → Delay → Reverb → Distortion → Chorus → Output
```

## Building the App

### Requirements

- Xcode 15.0 or later
- iOS 15.0+ deployment target
- Swift 5.9+

### Setup

1. **Create a new Xcode project**:
   - Open Xcode
   - File → New → Project
   - Choose "App" template
   - Product Name: `RositaIOSSynth`
   - Team: Your development team
   - Bundle Identifier: `com.jadewii.rosita`
   - Interface: SwiftUI
   - Language: Swift

2. **Add AudioKit dependency**:
   - File → Add Package Dependencies
   - Enter: `https://github.com/AudioKit/AudioKit`
   - Version: 5.6.0 or later

3. **Replace default files**:
   - Delete the default `ContentView.swift`
   - Add all the Swift files from this directory
   - Replace `Info.plist` with the provided one

4. **Configure project settings**:
   - Target → General → Deployment Info:
     - Device Orientation: Landscape Left & Right only
     - Status Bar: Hidden
     - Requires full screen: ✓
   - Target → Info:
     - Add "Privacy - Microphone Usage Description"

5. **Build and run**:
   - Select your device or simulator
   - Product → Run (⌘R)

## Project Structure

```
RositaIOSSynth/
├── RositaApp.swift        # App entry point
├── ContentView.swift      # Main UI layout
├── AudioEngine.swift      # AudioKit audio processing
├── EffectsView.swift      # Effects sliders UI
├── KeyboardView.swift     # Piano keyboard UI
├── Info.plist            # App configuration
└── Package.swift         # Swift Package Manager file
```

## Usage

1. **Play Notes**: Tap the piano keys to play notes
2. **Adjust Effects**: Drag the vertical sliders to control effect amounts
3. **Test Tone**: Tap the circular button to play/stop the test tone

## Effects Parameters

- **Delay**: Time-based echo effect (0-100%)
- **Reverb**: Spacious room simulation (0-100%)
- **Saturation**: Warm distortion/overdrive (0-100%)
- **Chorus**: Detuned doubling effect (0-100%)

## Future Enhancements

- [ ] Multiple instrument presets
- [ ] Pattern sequencer
- [ ] MIDI support
- [ ] Audio recording
- [ ] StoreKit integration for in-app purchases
- [ ] AUv3 Audio Unit support

## Troubleshooting

If you encounter audio issues:
1. Ensure your device isn't in silent mode
2. Check volume settings
3. Grant microphone permissions if prompted
4. Try restarting the app

## License

Copyright © 2024 JAde Wii. All rights reserved.