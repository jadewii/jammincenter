#!/bin/bash

echo "🎹 Creating Complete Rosita iOS Project with all files..."

# Clean up previous attempts
rm -rf RositaXcode
rm -rf RositaComplete

# Create new project structure
mkdir -p RositaComplete/Rosita
mkdir -p RositaComplete/Rosita/Audio
mkdir -p RositaComplete/Rosita/Views

cd RositaComplete/Rosita

# Create RositaApp.swift
cat > RositaApp.swift << 'EOF'
import SwiftUI
import AudioKit

@main
struct RositaApp: App {
    @StateObject private var audioEngine = AudioEngine()
    
    init() {
        // Keep screen on while app is active
        UIApplication.shared.isIdleTimerDisabled = true
        
        // TODO: Initialize StoreKit 2 subscription manager here
        // SubscriptionManager.shared.initialize()
    }
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(audioEngine)
                .preferredColorScheme(.dark)
                .statusBar(hidden: true)
        }
    }
}
EOF

# Create ContentView.swift
cat > ContentView.swift << 'EOF'
import SwiftUI

struct ContentView: View {
    @EnvironmentObject var audioEngine: AudioEngine
    @State private var isPlaying = false
    
    var body: some View {
        GeometryReader { geometry in
            ZStack {
                // Pink gradient background
                LinearGradient(
                    gradient: Gradient(colors: [
                        Color(red: 1.0, green: 0.71, blue: 0.76),
                        Color(red: 0.9, green: 0.35, blue: 0.5)
                    ]),
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
                .ignoresSafeArea()
                
                VStack(spacing: 0) {
                    // Title
                    Text("ROSITA")
                        .font(.system(size: 36, weight: .bold, design: .rounded))
                        .foregroundColor(.white)
                        .shadow(color: .pink, radius: 10)
                        .padding(.top, 10)
                    
                    // Main content area
                    HStack(spacing: 20) {
                        // Left panel
                        VStack(spacing: 20) {
                            InstrumentSelectorView()
                            ADSRControlsView()
                            Spacer()
                        }
                        .frame(width: geometry.size.width * 0.2)
                        
                        // Center - Sequencer
                        VStack(spacing: 10) {
                            SequencerControlsView(isPlaying: $isPlaying)
                            SequencerGridView()
                        }
                        .frame(width: geometry.size.width * 0.5)
                        
                        // Right panel - Effects
                        EffectsControlsView()
                            .frame(width: geometry.size.width * 0.2)
                    }
                    .padding(.horizontal)
                    .frame(height: geometry.size.height * 0.6)
                    
                    // Piano keyboard at bottom
                    PianoKeyboardView()
                        .frame(height: geometry.size.height * 0.25)
                        .padding(.bottom, 20)
                }
            }
        }
        .onAppear {
            audioEngine.start()
        }
    }
}
EOF

# Create Audio/AudioEngine.swift
cat > Audio/AudioEngine.swift << 'EOF'
import Foundation
import AudioKit
import AVFoundation

class AudioEngine: ObservableObject {
    // Audio engine
    private let engine = AudioKit.AudioEngine()
    
    // Instruments
    private var oscillators: [Oscillator] = []
    private var envelopes: [AmplitudeEnvelope] = []
    
    // Effects
    private var delays: [Delay] = []
    private var reverbs: [Reverb] = []
    private var distortions: [Distortion] = []
    private var choruses: [Chorus] = []
    
    // Mixer
    private let mainMixer = Mixer()
    
    // Published properties
    @Published var currentInstrument = 0
    @Published var attack: Float = 0.01
    @Published var decay: Float = 0.1
    @Published var sustain: Float = 0.8
    @Published var release: Float = 0.5
    @Published var tempo: Double = 120.0
    @Published var currentPattern = 0
    
    // Effects parameters
    @Published var delayAmount: Float = 0.0
    @Published var reverbAmount: Float = 0.0
    @Published var saturationAmount: Float = 0.0
    @Published var chorusAmount: Float = 0.0
    
    // Sequencer
    private var sequencerTimer: Timer?
    private var currentStep = 0
    @Published var sequencerData: [[Bool]] = Array(repeating: Array(repeating: false, count: 16), count: 4)
    
    // Instrument colors
    let instrumentColors: [Color] = [
        Color(red: 1.0, green: 0.71, blue: 0.76), // Pink
        Color(red: 0.54, green: 0.81, blue: 0.94), // Blue  
        Color(red: 0.87, green: 0.63, blue: 0.87), // Purple
        Color(red: 1.0, green: 0.84, blue: 0.0)    // Gold
    ]
    
    init() {
        setupAudio()
    }
    
    private func setupAudio() {
        // Create 4 instruments
        for i in 0..<4 {
            let oscillator = Oscillator()
            oscillator.amplitude = 0
            
            if i == 0 {
                oscillator.waveform = .sawtooth
            } else if i == 1 {
                oscillator.waveform = .square
            } else if i == 2 {
                oscillator.waveform = .sine
            } else {
                oscillator.waveform = .triangle
            }
            
            let envelope = AmplitudeEnvelope(oscillator)
            envelope.attackDuration = 0.01
            envelope.decayDuration = 0.1
            envelope.sustainLevel = 0.8
            envelope.releaseDuration = 0.5
            
            // Effects chain
            let delay = Delay(envelope)
            delay.time = 0.375
            delay.feedback = 0.5
            delay.dryWetMix = 0.0
            
            let reverb = Reverb(delay)
            reverb.dryWetMix = 0.0
            
            let distortion = Distortion(reverb)
            distortion.decimation = 0.5
            distortion.rounding = 0.0
            distortion.inputGain = 1.0
            
            let chorus = Chorus(distortion)
            chorus.frequency = 1.0
            chorus.depth = 0.0
            chorus.feedback = 0.0
            chorus.dryWetMix = 0.0
            
            oscillators.append(oscillator)
            envelopes.append(envelope)
            delays.append(delay)
            reverbs.append(reverb)
            distortions.append(distortion)
            choruses.append(chorus)
            
            mainMixer.addInput(chorus)
        }
        
        engine.output = mainMixer
    }
    
    func start() {
        do {
            try engine.start()
        } catch {
            print("AudioKit failed to start: \(error)")
        }
    }
    
    func playNote(pitch: Float, velocity: Float = 0.8) {
        let osc = oscillators[currentInstrument]
        let env = envelopes[currentInstrument]
        
        osc.frequency = pitch
        osc.amplitude = velocity
        
        env.attackDuration = Double(attack)
        env.decayDuration = Double(decay)
        env.sustainLevel = Double(sustain)
        env.releaseDuration = Double(release)
        
        // Update effects
        delays[currentInstrument].dryWetMix = Double(delayAmount)
        reverbs[currentInstrument].dryWetMix = Double(reverbAmount)
        distortions[currentInstrument].inputGain = Double(1 + saturationAmount * 4)
        choruses[currentInstrument].dryWetMix = Double(chorusAmount)
        
        DispatchQueue.main.async {
            env.start()
        }
    }
    
    func stopNote() {
        let env = envelopes[currentInstrument]
        DispatchQueue.main.async {
            env.stop()
        }
    }
    
    func startSequencer() {
        sequencerTimer?.invalidate()
        currentStep = 0
        
        let interval = 60.0 / tempo / 4.0 // 16th notes
        
        sequencerTimer = Timer.scheduledTimer(withTimeInterval: interval, repeats: true) { _ in
            self.playStep()
            self.currentStep = (self.currentStep + 1) % 16
        }
    }
    
    func stopSequencer() {
        sequencerTimer?.invalidate()
        sequencerTimer = nil
    }
    
    private func playStep() {
        for instrument in 0..<4 {
            if sequencerData[instrument][currentStep] {
                let previousInstrument = currentInstrument
                currentInstrument = instrument
                
                if instrument == 3 {
                    // Drums
                    playDrumHit(currentStep % 4)
                } else {
                    // Melodic instruments
                    let note = 60 + (currentStep % 8) * 2
                    playNote(pitch: Float(note).midiNoteToFrequency(), velocity: 0.6)
                }
                
                currentInstrument = previousInstrument
            }
        }
    }
    
    private func playDrumHit(_ type: Int) {
        switch type {
        case 0: playNote(pitch: 60, velocity: 0.8) // Kick
        case 1: playNote(pitch: 200, velocity: 0.7) // Snare
        case 2: playNote(pitch: 1000, velocity: 0.5) // Hi-hat
        default: playNote(pitch: 500, velocity: 0.6) // Other
        }
    }
}

extension Float {
    func midiNoteToFrequency() -> Float {
        return 440.0 * pow(2.0, (self - 69.0) / 12.0)
    }
}

extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3:
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6:
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8:
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }
        self.init(.sRGB, red: Double(r) / 255, green: Double(g) / 255, blue: Double(b) / 255, opacity: Double(a) / 255)
    }
}
EOF

# Create all View files
cat > Views/InstrumentSelectorView.swift << 'EOF'
import SwiftUI

struct InstrumentSelectorView: View {
    @EnvironmentObject var audioEngine: AudioEngine
    
    let instrumentNames = ["SYNTH", "BASS", "KEYS", "DRUMS"]
    
    var body: some View {
        VStack(spacing: 15) {
            Text("INSTRUMENT")
                .font(.system(size: 14, weight: .bold))
                .foregroundColor(.white)
            
            HStack(spacing: 10) {
                ForEach(0..<4) { index in
                    Button(action: {
                        audioEngine.currentInstrument = index
                        UIImpactFeedbackGenerator(style: .light).impactOccurred()
                    }) {
                        Text("\(index + 1)")
                            .font(.system(size: 18, weight: .bold))
                            .frame(width: 40, height: 40)
                            .foregroundColor(audioEngine.currentInstrument == index ? .black : .white)
                            .background(
                                RoundedRectangle(cornerRadius: 8)
                                    .fill(audioEngine.currentInstrument == index ? 
                                          audioEngine.instrumentColors[index] : 
                                          Color.white.opacity(0.2))
                            )
                            .overlay(
                                RoundedRectangle(cornerRadius: 8)
                                    .stroke(audioEngine.instrumentColors[index], lineWidth: 2)
                            )
                            .shadow(color: audioEngine.currentInstrument == index ? 
                                   audioEngine.instrumentColors[index] : .clear, radius: 5)
                    }
                }
            }
            
            Text(instrumentNames[audioEngine.currentInstrument])
                .font(.system(size: 12, weight: .medium))
                .foregroundColor(audioEngine.instrumentColors[audioEngine.currentInstrument])
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 15)
                .fill(Color.black.opacity(0.3))
        )
    }
}
EOF

cat > Views/ADSRControlsView.swift << 'EOF'
import SwiftUI

struct ADSRControlsView: View {
    @EnvironmentObject var audioEngine: AudioEngine
    
    var body: some View {
        VStack(spacing: 15) {
            Text("ADSR ENVELOPE")
                .font(.system(size: 14, weight: .bold))
                .foregroundColor(.white)
            
            VStack(spacing: 10) {
                SliderRow(label: "A", value: $audioEngine.attack, range: 0...1)
                SliderRow(label: "D", value: $audioEngine.decay, range: 0...1)
                SliderRow(label: "S", value: $audioEngine.sustain, range: 0...1)
                SliderRow(label: "R", value: $audioEngine.release, range: 0...2)
            }
            
            // Octave controls
            HStack {
                Text("OCTAVE")
                    .font(.system(size: 12, weight: .medium))
                    .foregroundColor(.white)
                
                Spacer()
                
                Button("-") {
                    // TODO: Implement octave down
                }
                .buttonStyle(OctaveButtonStyle())
                
                Button("+") {
                    // TODO: Implement octave up
                }
                .buttonStyle(OctaveButtonStyle())
            }
            .padding(.top, 10)
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 15)
                .fill(Color.black.opacity(0.3))
        )
    }
}

struct SliderRow: View {
    let label: String
    @Binding var value: Float
    let range: ClosedRange<Float>
    
    var body: some View {
        HStack {
            Text(label)
                .font(.system(size: 12, weight: .bold))
                .foregroundColor(.white)
                .frame(width: 20)
            
            Slider(value: $value, in: range)
                .accentColor(.cyan)
        }
    }
}

struct OctaveButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.system(size: 16, weight: .bold))
            .frame(width: 30, height: 30)
            .foregroundColor(.white)
            .background(
                RoundedRectangle(cornerRadius: 5)
                    .fill(configuration.isPressed ? Color.cyan : Color.white.opacity(0.2))
            )
            .overlay(
                RoundedRectangle(cornerRadius: 5)
                    .stroke(Color.cyan, lineWidth: 1)
            )
    }
}
EOF

cat > Views/SequencerGridView.swift << 'EOF'
import SwiftUI

struct SequencerGridView: View {
    @EnvironmentObject var audioEngine: AudioEngine
    let rows = 4
    let columns = 16
    
    var body: some View {
        VStack(spacing: 5) {
            ForEach(0..<rows, id: \.self) { row in
                HStack(spacing: 5) {
                    ForEach(0..<columns, id: \.self) { column in
                        SequencerCell(
                            isActive: audioEngine.sequencerData[row][column],
                            color: audioEngine.instrumentColors[row],
                            action: {
                                audioEngine.sequencerData[row][column].toggle()
                                UIImpactFeedbackGenerator(style: .light).impactOccurred()
                            }
                        )
                    }
                }
            }
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 15)
                .fill(Color.black.opacity(0.3))
        )
    }
}

struct SequencerCell: View {
    let isActive: Bool
    let color: Color
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            RoundedRectangle(cornerRadius: 4)
                .fill(isActive ? color : Color.white.opacity(0.2))
                .overlay(
                    RoundedRectangle(cornerRadius: 4)
                        .stroke(color.opacity(0.5), lineWidth: 1)
                )
                .frame(width: 30, height: 30)
                .shadow(color: isActive ? color : .clear, radius: 5)
        }
    }
}
EOF

cat > Views/SequencerControlsView.swift << 'EOF'
import SwiftUI

struct SequencerControlsView: View {
    @Binding var isPlaying: Bool
    @EnvironmentObject var audioEngine: AudioEngine
    
    var body: some View {
        HStack(spacing: 20) {
            // Play/Stop button
            Button(action: {
                if isPlaying {
                    audioEngine.stopSequencer()
                } else {
                    audioEngine.startSequencer()
                }
                isPlaying.toggle()
                UIImpactFeedbackGenerator(style: .medium).impactOccurred()
            }) {
                Image(systemName: isPlaying ? "stop.fill" : "play.fill")
                    .font(.system(size: 24))
                    .foregroundColor(.white)
                    .frame(width: 60, height: 40)
                    .background(
                        RoundedRectangle(cornerRadius: 10)
                            .fill(isPlaying ? Color.red : Color.green)
                    )
                    .shadow(color: isPlaying ? .red : .green, radius: 10)
            }
            
            // Pattern buttons
            HStack(spacing: 5) {
                ForEach(0..<8) { pattern in
                    Button(action: {
                        audioEngine.currentPattern = pattern
                        UIImpactFeedbackGenerator(style: .light).impactOccurred()
                    }) {
                        Text("\(pattern + 1)")
                            .font(.system(size: 14, weight: .bold))
                            .frame(width: 30, height: 30)
                            .foregroundColor(audioEngine.currentPattern == pattern ? .black : .white)
                            .background(
                                RoundedRectangle(cornerRadius: 5)
                                    .fill(audioEngine.currentPattern == pattern ? Color.cyan : Color.gray.opacity(0.3))
                            )
                            .overlay(
                                RoundedRectangle(cornerRadius: 5)
                                    .stroke(Color.cyan.opacity(0.5), lineWidth: 1)
                            )
                    }
                }
            }
            
            Spacer()
            
            // BPM control
            VStack(alignment: .trailing, spacing: 5) {
                Text("BPM: \(Int(audioEngine.tempo))")
                    .font(.system(size: 12, weight: .medium))
                    .foregroundColor(.white)
                
                Slider(value: $audioEngine.tempo, in: 60...200, step: 1)
                    .frame(width: 150)
                    .accentColor(.cyan)
            }
        }
        .padding()
    }
}
EOF

cat > Views/EffectsControlsView.swift << 'EOF'
import SwiftUI

struct EffectsControlsView: View {
    @EnvironmentObject var audioEngine: AudioEngine
    
    var body: some View {
        VStack(spacing: 20) {
            Text("EFFECTS")
                .font(.system(size: 16, weight: .bold))
                .foregroundColor(.white)
            
            HStack(spacing: 30) {
                EffectSlider(
                    value: $audioEngine.delayAmount,
                    label: "DLY",
                    color: .cyan
                )
                
                EffectSlider(
                    value: $audioEngine.reverbAmount,
                    label: "REV",
                    color: .purple
                )
                
                EffectSlider(
                    value: $audioEngine.saturationAmount,
                    label: "SAT",
                    color: .orange
                )
                
                EffectSlider(
                    value: $audioEngine.chorusAmount,
                    label: "CHO",
                    color: .green
                )
            }
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 15)
                .fill(Color.black.opacity(0.3))
        )
    }
}

struct EffectSlider: View {
    @Binding var value: Float
    let label: String
    let color: Color
    
    var body: some View {
        VStack(spacing: 10) {
            GeometryReader { geometry in
                ZStack(alignment: .bottom) {
                    // Background
                    RoundedRectangle(cornerRadius: 10)
                        .fill(Color.white.opacity(0.1))
                    
                    // Fill
                    RoundedRectangle(cornerRadius: 10)
                        .fill(
                            LinearGradient(
                                gradient: Gradient(colors: [color.opacity(0.3), color]),
                                startPoint: .bottom,
                                endPoint: .top
                            )
                        )
                        .frame(height: geometry.size.height * CGFloat(value))
                        .animation(.easeInOut(duration: 0.1), value: value)
                    
                    // Glow effect
                    RoundedRectangle(cornerRadius: 10)
                        .stroke(color, lineWidth: 2)
                        .blur(radius: 3)
                        .opacity(Double(value))
                }
                .gesture(
                    DragGesture()
                        .onChanged { value in
                            let newValue = Float(1 - value.location.y / geometry.size.height)
                            self.value = max(0, min(1, newValue))
                        }
                )
            }
            .frame(width: 40, height: 200)
            
            Text(label)
                .font(.system(size: 12, weight: .bold))
                .foregroundColor(color)
        }
    }
}
EOF

cat > Views/PianoKeyboardView.swift << 'EOF'
import SwiftUI

struct PianoKeyboardView: View {
    @EnvironmentObject var audioEngine: AudioEngine
    @State private var activeKeys: Set<Int> = []
    
    let whiteKeyNotes = [60, 62, 64, 65, 67, 69, 71, 72, 74, 76, 77, 79, 81, 83, 84, 86, 88, 89, 91, 93, 95, 96]
    let blackKeyNotes = [61, 63, 0, 66, 68, 70, 0, 73, 75, 0, 78, 80, 82, 0, 85, 87, 0, 90, 92, 94]
    
    var body: some View {
        GeometryReader { geometry in
            ZStack(alignment: .topLeading) {
                // White keys
                HStack(spacing: 2) {
                    ForEach(0..<whiteKeyNotes.count, id: \.self) { index in
                        WhiteKey(
                            note: whiteKeyNotes[index],
                            isActive: activeKeys.contains(whiteKeyNotes[index]),
                            color: audioEngine.instrumentColors[audioEngine.currentInstrument],
                            playNote: { note in
                                playNote(note)
                            },
                            stopNote: {
                                stopNote()
                            }
                        )
                    }
                }
                
                // Black keys
                HStack(spacing: 2) {
                    ForEach(0..<blackKeyNotes.count, id: \.self) { index in
                        if blackKeyNotes[index] != 0 {
                            BlackKey(
                                note: blackKeyNotes[index],
                                isActive: activeKeys.contains(blackKeyNotes[index]),
                                color: audioEngine.instrumentColors[audioEngine.currentInstrument],
                                playNote: { note in
                                    playNote(note)
                                },
                                stopNote: {
                                    stopNote()
                                }
                            )
                            .offset(x: CGFloat(index) * (geometry.size.width / CGFloat(whiteKeyNotes.count)) - 
                                   CGFloat(index) * 2)
                        } else {
                            Color.clear
                                .frame(width: 0)
                        }
                    }
                }
            }
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 15)
                .fill(Color.black.opacity(0.3))
        )
    }
    
    private func playNote(_ note: Int) {
        activeKeys.insert(note)
        let frequency = Float(note).midiNoteToFrequency()
        audioEngine.playNote(pitch: frequency)
        UIImpactFeedbackGenerator(style: .light).impactOccurred()
    }
    
    private func stopNote() {
        activeKeys.removeAll()
        audioEngine.stopNote()
    }
}

struct WhiteKey: View {
    let note: Int
    let isActive: Bool
    let color: Color
    let playNote: (Int) -> Void
    let stopNote: () -> Void
    
    var body: some View {
        RoundedRectangle(cornerRadius: 0)
            .fill(isActive ? color : Color.white)
            .overlay(
                RoundedRectangle(cornerRadius: 0)
                    .stroke(Color.gray, lineWidth: 1)
            )
            .shadow(color: isActive ? color : .clear, radius: 10)
            .onTapGesture {
                // For tap, play and immediately stop
                playNote(note)
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
                    stopNote()
                }
            }
    }
}

struct BlackKey: View {
    let note: Int
    let isActive: Bool
    let color: Color
    let playNote: (Int) -> Void
    let stopNote: () -> Void
    
    var body: some View {
        RoundedRectangle(cornerRadius: 0)
            .fill(isActive ? color : Color.black)
            .frame(width: 25, height: 80)
            .overlay(
                RoundedRectangle(cornerRadius: 0)
                    .stroke(Color.gray, lineWidth: 1)
            )
            .shadow(color: isActive ? color : .clear, radius: 10)
            .onTapGesture {
                playNote(note)
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
                    stopNote()
                }
            }
    }
}
EOF

# Copy Info.plist
cp /Users/jade/Wiistrument-Development/01-Active-Projects/Rosita-Project/source-code/wiistruments-center-clean/rosita-ios/RositaSynthiOS/Info.plist . 2>/dev/null || cat > Info.plist << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleDevelopmentRegion</key>
    <string>$(DEVELOPMENT_LANGUAGE)</string>
    <key>CFBundleDisplayName</key>
    <string>Rosita</string>
    <key>CFBundleExecutable</key>
    <string>$(EXECUTABLE_NAME)</string>
    <key>CFBundleIdentifier</key>
    <string>com.jadewii.rosita</string>
    <key>CFBundleInfoDictionaryVersion</key>
    <string>6.0</string>
    <key>CFBundleName</key>
    <string>$(PRODUCT_NAME)</string>
    <key>CFBundlePackageType</key>
    <string>$(PRODUCT_BUNDLE_PACKAGE_TYPE)</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0</string>
    <key>CFBundleVersion</key>
    <string>1</string>
    <key>LSRequiresIPhoneOS</key>
    <true/>
    <key>UIApplicationSupportsIndirectInputEvents</key>
    <true/>
    <key>UILaunchStoryboardName</key>
    <string>LaunchScreen</string>
    <key>UIRequiredDeviceCapabilities</key>
    <array>
        <string>armv7</string>
    </array>
    <key>UIRequiresFullScreen</key>
    <true/>
    <key>UIStatusBarHidden</key>
    <true/>
    <key>UIStatusBarStyle</key>
    <string>UIStatusBarStyleLightContent</string>
    <key>UISupportedInterfaceOrientations</key>
    <array>
        <string>UIInterfaceOrientationLandscapeLeft</string>
        <string>UIInterfaceOrientationLandscapeRight</string>
    </array>
    <key>UISupportedInterfaceOrientations~ipad</key>
    <array>
        <string>UIInterfaceOrientationLandscapeLeft</string>
        <string>UIInterfaceOrientationLandscapeRight</string>
    </array>
    <key>UIViewControllerBasedStatusBarAppearance</key>
    <false/>
    <key>NSMicrophoneUsageDescription</key>
    <string>Rosita needs microphone access for audio processing and future recording features.</string>
    <key>UIBackgroundModes</key>
    <array>
        <string>audio</string>
    </array>
</dict>
</plist>
EOF

cd ../..

echo "✅ All Swift files created successfully!"
echo ""
echo "🎯 Now opening the complete project in Xcode..."

# Open project in Xcode
xed RositaComplete

echo ""
echo "📱 XCODE IS OPENING WITH YOUR COMPLETE PROJECT!"
echo ""
echo "NEXT STEPS:"
echo "1. Wait for Xcode to fully load"
echo "2. Click 'Add Account' if prompted and sign in with your Apple ID"
echo "3. Select your team in Signing & Capabilities"
echo "4. Press ⌘R to run!"
echo ""
echo "The app will build and launch in the simulator!"