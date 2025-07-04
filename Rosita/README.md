# 🎹 Rosita iOS Synthesizer

A beautiful iOS synthesizer app with real-time audio synthesis, effects, and sequencing.

![Rosita App Preview](preview.png)

## 🚀 Quick Start

### Step 1: Open Xcode
```bash
# If you have Xcode installed, open it
# If not, download from Mac App Store first
```

### Step 2: Create New Project
1. Open Xcode
2. Click "Create New Project"
3. Choose "iOS" → "App"
4. Configure:
   - **Product Name**: Rosita
   - **Team**: Your Apple ID
   - **Organization Identifier**: com.jadewii
   - **Interface**: SwiftUI
   - **Language**: Swift

### Step 3: Add AudioKit
1. In Xcode: **File** → **Add Package Dependencies**
2. Enter URL: `https://github.com/AudioKit/AudioKit`
3. Click "Add Package"
4. Version: 5.6.0 or later
5. Add to Target: Rosita

### Step 4: Configure Project
1. Select project in navigator
2. Select "Rosita" target
3. **General** tab:
   - Deployment Info: iOS 15.0
   - Device Orientation: **Uncheck Portrait**, keep only Landscape
   - Status Bar: Hide status bar ✓
   - Requires full screen ✓

### Step 5: Add Files
1. In Finder, navigate to the Rosita folder
2. Select all Swift files and the Info.plist
3. Drag into Xcode project navigator
4. Check "Copy items if needed"
5. Add to target: Rosita

### Step 6: Run!
1. Select iPhone/iPad simulator (or your device)
2. Press **⌘R** or click the ▶️ button
3. The app will build and launch!

## 🎮 How to Use Rosita

### Playing Notes
- **Tap the piano keys** at the bottom to play notes
- Keys light up in the current instrument's color
- Black keys play sharp/flat notes

### Selecting Instruments
- Tap buttons **1-4** to switch instruments:
  - **1**: Synth (Pink)
  - **2**: Bass (Blue)
  - **3**: Keys (Purple)
  - **4**: Drums (Gold)

### Adjusting Sound
- **ADSR Envelope**: Control attack, decay, sustain, release
- **Effects Sliders**:
  - **DELAY**: Echo/repeat effect
  - **REVERB**: Spacious room sound
  - **SATURATION**: Warm distortion
  - **CHORUS**: Detuned doubling

### Using the Sequencer
1. Select an instrument (1-4)
2. Tap cells in the grid to create patterns
3. Press **Play** to hear your sequence
4. Use pattern buttons (1-8) to switch patterns
5. Adjust **BPM** with the tempo slider

## 🎨 App Preview

The app features:
- Pink gradient background
- Neon-style glowing effects
- Touch-responsive piano keyboard
- Real-time visual feedback
- Professional audio quality

## 📱 Testing on Your iPhone/iPad

1. Connect your device via USB
2. Select your device from Xcode's device menu
3. You may need to trust your developer certificate:
   - On device: Settings → General → VPN & Device Management
   - Trust your developer app
4. Press ⌘R to run

## 🎯 What You'll See

When the app launches:
1. **Top**: "ROSITA" logo
2. **Left Panel**: Instrument selector and ADSR controls
3. **Center**: 8x16 sequencer grid
4. **Right**: Effects sliders with neon glow
5. **Bottom**: Full piano keyboard

## 🔊 Audio Features

- **4 Simultaneous Instruments**
- **Real-time Effects Processing**
- **Pattern Sequencer**
- **Professional Audio Engine**
- **Low Latency Performance**

## 🐛 Troubleshooting

**No Sound?**
- Check device isn't on silent mode
- Increase volume
- Tap a key to test

**Build Errors?**
- Clean build folder: ⇧⌘K
- Reset packages: File → Packages → Reset Package Caches

**Can't See in Landscape?**
- Rotate your device/simulator
- Check orientation settings in project

## 🎉 Enjoy Making Music!

Rosita is ready to play! Experiment with different sounds, create patterns, and have fun with your iOS synthesizer!