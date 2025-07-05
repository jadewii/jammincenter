import SwiftUI

// MARK: - Retro Windows 95 Style Components for Rosita

// MARK: - Retro Button Style
struct RetroButtonStyle: ButtonStyle {
    let isActive: Bool
    
    init(isActive: Bool = false) {
        self.isActive = isActive
    }
    
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .padding(.horizontal, 8)
            .padding(.vertical, 6)
            .font(.system(size: 10, weight: .bold, design: .monospaced))
            .foregroundColor(.black)
            .background(Color(hex: "CCCCCC"))
            .overlay(
                Rectangle()
                    .stroke(Color.black, lineWidth: 2)
            )
            .overlay(
                // 3D border effect
                Group {
                    if isActive || configuration.isPressed {
                        // Pressed/Active state - inset border
                        Rectangle()
                            .stroke(Color(hex: "808080"), lineWidth: 1)
                            .padding(1)
                    } else {
                        // Normal state - outset border
                        Rectangle()
                            .stroke(Color.white, lineWidth: 1)
                            .padding(1)
                    }
                }
            )
            .scaleEffect(configuration.isPressed ? 0.95 : 1.0)
    }
}

// MARK: - Retro Slider Style
struct RetroSlider: View {
    let label: String
    @Binding var value: Double
    let range: ClosedRange<Double>
    let onChanged: () -> Void
    
    var body: some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(label)
                .font(.system(size: 9, weight: .bold, design: .monospaced))
                .foregroundColor(.black)
            
            HStack {
                Slider(value: $value, in: range) { _ in
                    onChanged()
                }
                .accentColor(Color(hex: "FF69B4"))
                .frame(height: 24)
                
                Text(String(format: "%.2f", value))
                    .font(.system(size: 9, weight: .bold, design: .monospaced))
                    .foregroundColor(.black)
                    .frame(width: 35)
                    .padding(.horizontal, 4)
                    .padding(.vertical, 2)
                    .background(Color.white)
                    .overlay(Rectangle().stroke(Color.black, lineWidth: 2))
            }
        }
    }
}

// MARK: - Instrument Section
struct RositaInstrumentSection: View {
    @EnvironmentObject var synthEngine: SynthEngine
    
    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("Instrument")
                .font(.system(size: 11, weight: .bold, design: .monospaced))
                .foregroundColor(.black)
                .padding(.bottom, 2)
                .overlay(
                    Rectangle()
                        .frame(height: 2)
                        .foregroundColor(.black),
                    alignment: .bottom
                )
            
            HStack(spacing: 8) {
                ForEach(0..<4) { index in
                    VStack(spacing: 2) {
                        Button("\(index + 1)") {
                            // Set current instrument
                            UIImpactFeedbackGenerator(style: .light).impactOccurred()
                        }
                        .buttonStyle(RetroButtonStyle(isActive: false))
                        .frame(width: 40, height: 24)
                        
                        if index < 3 { // No octave controls for drums
                            VStack(spacing: 1) {
                                Button("-") {
                                    UIImpactFeedbackGenerator(style: .light).impactOccurred()
                                }
                                .buttonStyle(RetroButtonStyle())
                                .frame(width: 15, height: 12)
                                
                                Button("+") {
                                    UIImpactFeedbackGenerator(style: .light).impactOccurred()
                                }
                                .buttonStyle(RetroButtonStyle())
                                .frame(width: 15, height: 12)
                            }
                        }
                    }
                }
            }
        }
        .padding(4)
    }
}

// MARK: - Arpeggiator Section
struct RositaArpeggiatorSection: View {
    @EnvironmentObject var synthEngine: SynthEngine
    
    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("Arpeggiator")
                .font(.system(size: 11, weight: .bold, design: .monospaced))
                .foregroundColor(.black)
                .padding(.bottom, 2)
                .overlay(
                    Rectangle()
                        .frame(height: 2)
                        .foregroundColor(.black),
                    alignment: .bottom
                )
            
            HStack(spacing: 8) {
                ForEach(0..<3) { index in
                    VStack(spacing: 2) {
                        Button("\(index + 1)") {
                            UIImpactFeedbackGenerator(style: .light).impactOccurred()
                        }
                        .buttonStyle(RetroButtonStyle())
                        .frame(width: 40, height: 24)
                        
                        HStack(spacing: 1) {
                            ForEach(0..<3) { ledIndex in
                                Circle()
                                    .fill(Color.green)
                                    .frame(width: 4, height: 4)
                            }
                        }
                    }
                }
            }
        }
        .padding(4)
    }
}

// MARK: - ADSR Section
struct RositaADSRSection: View {
    @EnvironmentObject var synthEngine: SynthEngine
    
    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("ADSR Envelope")
                .font(.system(size: 11, weight: .bold, design: .monospaced))
                .foregroundColor(.black)
                .padding(.bottom, 2)
                .overlay(
                    Rectangle()
                        .frame(height: 2)
                        .foregroundColor(.black),
                    alignment: .bottom
                )
            
            VStack(spacing: 4) {
                RetroSlider(label: "A:", value: $synthEngine.attack, range: 0...2) {
                    synthEngine.updateADSR()
                }
                RetroSlider(label: "D:", value: $synthEngine.decay, range: 0...2) {
                    synthEngine.updateADSR()
                }
                RetroSlider(label: "S:", value: $synthEngine.sustain, range: 0...1) {
                    synthEngine.updateADSR()
                }
                RetroSlider(label: "R:", value: $synthEngine.release, range: 0...5) {
                    synthEngine.updateADSR()
                }
            }
        }
        .padding(4)
        .frame(maxWidth: .infinity)
    }
}

// MARK: - Effects Section
struct RositaEffectsSection: View {
    @EnvironmentObject var synthEngine: SynthEngine
    
    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("Effects")
                .font(.system(size: 11, weight: .bold, design: .monospaced))
                .foregroundColor(.black)
                .padding(.bottom, 2)
                .overlay(
                    Rectangle()
                        .frame(height: 2)
                        .foregroundColor(.black),
                    alignment: .bottom
                )
            
            VStack(spacing: 4) {
                RetroSlider(label: "D:", value: $synthEngine.delayMix, range: 0...1) {
                    synthEngine.updateEffects()
                }
                RetroSlider(label: "R:", value: $synthEngine.reverbMix, range: 0...1) {
                    synthEngine.updateEffects()
                }
                RetroSlider(label: "S:", value: $synthEngine.distortionAmount, range: 0...1) {
                    synthEngine.updateEffects()
                }
                RetroSlider(label: "C:", value: $synthEngine.filterCutoff, range: 100...20000) {
                    synthEngine.updateEffects()
                }
            }
        }
        .padding(4)
        .frame(maxWidth: .infinity)
    }
}

// MARK: - Random Buttons
struct RositaRandomButtons: View {
    var body: some View {
        HStack(spacing: 8) {
            Button("ADSR") {
                UIImpactFeedbackGenerator(style: .light).impactOccurred()
            }
            .buttonStyle(RetroButtonStyle())
            
            Button("Scale") {
                UIImpactFeedbackGenerator(style: .light).impactOccurred()
            }
            .buttonStyle(RetroButtonStyle())
            
            Button("Octave") {
                UIImpactFeedbackGenerator(style: .light).impactOccurred()
            }
            .buttonStyle(RetroButtonStyle())
        }
        .padding(4)
    }
}

// MARK: - Sequencer Controls
struct RositaSequencerControls: View {
    @EnvironmentObject var synthEngine: SynthEngine
    
    var body: some View {
        HStack(spacing: 5) {
            Button(synthEngine.isPlaying ? "Stop" : "Play") {
                synthEngine.togglePlayback()
                UIImpactFeedbackGenerator(style: .medium).impactOccurred()
            }
            .buttonStyle(RetroButtonStyle())
            
            Button("Random") {
                synthEngine.randomizePattern()
                UIImpactFeedbackGenerator(style: .light).impactOccurred()
            }
            .buttonStyle(RetroButtonStyle())
            
            Button("Clear") {
                synthEngine.clearPattern()
                UIImpactFeedbackGenerator(style: .light).impactOccurred()
            }
            .buttonStyle(RetroButtonStyle())
            
            Button("Clear All") {
                synthEngine.clearPattern()
                UIImpactFeedbackGenerator(style: .light).impactOccurred()
            }
            .buttonStyle(RetroButtonStyle())
            
            Button("Mixer") {
                UIImpactFeedbackGenerator(style: .light).impactOccurred()
            }
            .buttonStyle(RetroButtonStyle())
            
            Spacer()
            
            // BPM Control
            HStack {
                Text("BPM:")
                    .font(.system(size: 9, weight: .bold, design: .monospaced))
                    .foregroundColor(.black)
                
                Slider(value: $synthEngine.bpm, in: 60...200, step: 1)
                    .accentColor(Color(hex: "FF69B4"))
                    .frame(width: 80)
                
                Text("\(Int(synthEngine.bpm))")
                    .font(.system(size: 9, weight: .bold, design: .monospaced))
                    .foregroundColor(.black)
                    .frame(width: 30)
            }
        }
        .padding(4)
    }
}

// MARK: - Pattern Memory
struct RositaPatternMemory: View {
    var body: some View {
        HStack(spacing: 4) {
            ForEach(1...8, id: \.self) { pattern in
                Button("\(pattern)") {
                    UIImpactFeedbackGenerator(style: .light).impactOccurred()
                }
                .buttonStyle(RetroButtonStyle(isActive: pattern == 1))
                .frame(width: 30, height: 24)
            }
            
            Button("Dup") {
                UIImpactFeedbackGenerator(style: .light).impactOccurred()
            }
            .buttonStyle(RetroButtonStyle())
            .frame(width: 40, height: 24)
        }
        .padding(4)
    }
}

// MARK: - Sequencer Grid
struct RositaSequencerGrid: View {
    @EnvironmentObject var synthEngine: SynthEngine
    
    let noteLabels = ["C5", "B4", "A4", "G4", "F4", "E4", "D4", "C4"]
    // Exact colors from original Rosita for each row
    let gridColors: [Color] = [
        Color(hex: "FFA500"), // Orange - Row 0
        Color(hex: "00BFFF"), // Deep Sky Blue - Row 1
        Color(hex: "32CD32"), // Lime Green - Row 2
        Color(hex: "DDA0DD"), // Plum Purple - Row 3
        Color(hex: "FFD700"), // Gold Yellow - Row 4
        Color(hex: "FF69B4"), // Hot Pink - Row 5
        Color(hex: "87CEEB"), // Sky Blue - Row 6
        Color(hex: "98FB98")  // Pale Green - Row 7
    ]
    
    var body: some View {
        VStack(spacing: 1) {
            // Step numbers header
            HStack(spacing: 1) {
                Spacer().frame(width: 30) // Space for note labels
                
                ForEach(1...16, id: \.self) { step in
                    Text("\(step)")
                        .font(.system(size: 8, weight: .bold, design: .monospaced))
                        .foregroundColor(.black)
                        .frame(maxWidth: .infinity)
                }
            }
            
            // Grid rows
            ForEach(0..<8, id: \.self) { row in
                HStack(spacing: 1) {
                    // Note label
                    Text(noteLabels[row])
                        .font(.system(size: 8, weight: .bold, design: .monospaced))
                        .foregroundColor(.black)
                        .frame(width: 30)
                    
                    // Step buttons
                    ForEach(0..<16, id: \.self) { col in
                        Button("") {
                            synthEngine.toggleCell(row: row, col: col)
                            UIImpactFeedbackGenerator(style: .light).impactOccurred()
                        }
                        .frame(maxWidth: .infinity, minHeight: 25)
                        .background(
                            Rectangle()
                                .fill(synthEngine.pattern[row][col] ? gridColors[row] : Color(hex: "87CEEB").opacity(0.3))
                                .overlay(
                                    Rectangle()
                                        .stroke(Color.black, lineWidth: 1)
                                )
                                .overlay(
                                    // 3D border effect
                                    Rectangle()
                                        .stroke(
                                            synthEngine.pattern[row][col] ? Color(hex: "404040") : Color.white,
                                            lineWidth: 1
                                        )
                                        .padding(1)
                                )
                        )
                        .overlay(
                            // Current step indicator
                            Rectangle()
                                .stroke(synthEngine.isPlaying && synthEngine.currentStep == col ? Color.red : Color.clear, lineWidth: 2)
                        )
                    }
                }
            }
        }
        .padding(4)
        .background(Color(hex: "90EE90"))
    }
}

// MARK: - Piano Keyboard
struct RositaPianoKeyboard: View {
    @EnvironmentObject var synthEngine: SynthEngine
    @State private var pressedKeys: Set<Int> = []
    
    var body: some View {
        GeometryReader { geometry in
            ZStack(alignment: .bottom) {
                // White keys (12 keys like in original)
                HStack(spacing: 1) {
                    ForEach(0..<12, id: \.self) { index in
                        Button("") {
                            // Button action handled by gesture
                        }
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                        .background(
                            Rectangle()
                                .fill(pressedKeys.contains(index) || synthEngine.activeNotes.contains(index) ? Color(hex: "FF69B4") : Color.white)
                                .overlay(
                                    Rectangle()
                                        .stroke(Color.black, lineWidth: 1)
                                )
                        )
                        .onLongPressGesture(minimumDuration: 0, maximumDistance: .infinity) {
                            
                        } onPressingChanged: { pressing in
                            if pressing {
                                pressedKeys.insert(index)
                                synthEngine.playNote(index % 8)
                            } else {
                                pressedKeys.remove(index)
                                synthEngine.stopNote(index % 8)
                            }
                        }
                    }
                }
                
                // Black keys positioned correctly
                HStack(spacing: 0) {
                    let whiteKeyWidth = geometry.size.width / 12
                    let blackKeyWidth = whiteKeyWidth * 0.6
                    
                    // Pattern: W-B-W-B-W-W-B-W-B-W-B-W (like piano)
                    ForEach([0.5, 1.5, 3.5, 4.5, 5.5, 7.5, 8.5, 10.5, 11.5], id: \.self) { position in
                        Spacer()
                            .frame(width: whiteKeyWidth * position)
                        
                        Button("") {
                            // Black key action
                        }
                        .frame(width: blackKeyWidth, height: geometry.size.height * 0.65)
                        .background(Color.black)
                        .cornerRadius(2)
                        .onLongPressGesture(minimumDuration: 0, maximumDistance: .infinity) {
                            
                        } onPressingChanged: { pressing in
                            let blackKeyIndex = Int(position) + 20 // Offset to avoid conflicts
                            if pressing {
                                pressedKeys.insert(blackKeyIndex)
                                // Play black key note
                            } else {
                                pressedKeys.remove(blackKeyIndex)
                                // Stop black key note
                            }
                        }
                        
                        if position < 11.5 {
                            Spacer()
                                .frame(width: whiteKeyWidth * (12 - position - 1))
                        }
                    }
                }
                .offset(y: -geometry.size.height * 0.18)
            }
        }
        .background(
            Rectangle()
                .fill(Color(hex: "90EE90"))
                .overlay(
                    Rectangle()
                        .stroke(Color.black, lineWidth: 2)
                )
        )
        .padding(2)
    }
}