import SwiftUI

struct ContentView: View {
    @StateObject private var synthEngine = SynthEngine()
    
    var body: some View {
        GeometryReader { geometry in
            ZStack {
                // Rosita green background like original
                Color(hex: "90EE90")
                    .ignoresSafeArea()
                
                VStack(spacing: 0) {
                    // Custom pink title bar like original
                    RositaTitleBar()
                    
                    ResponsiveLayoutView(geometry: geometry)
                }
            }
            .environmentObject(synthEngine)
        }
        .onAppear {
            // Force landscape orientation
            let value = UIInterfaceOrientation.landscapeRight.rawValue
            UIDevice.current.setValue(value, forKey: "orientation")
        }
    }
}

struct ResponsiveLayoutView: View {
    let geometry: GeometryProxy
    @EnvironmentObject var synthEngine: SynthEngine
    
    var isCompact: Bool {
        geometry.size.width < 768 // iPhone size threshold
    }
    
    var body: some View {
        if isCompact {
            // iPhone - everything on one screen, compact
            CompactAllInOneView(geometry: geometry)
        } else {
            // iPad - full layout like original
            FullLayoutView(geometry: geometry)
        }
    }
}

// MARK: - Full Layout (iPad) - Like Original Rosita
struct FullLayoutView: View {
    let geometry: GeometryProxy
    @EnvironmentObject var synthEngine: SynthEngine
    
    var body: some View {
        VStack(spacing: 1) {
            // Main control panel - horizontal split like original
            HStack(spacing: 2) {
                // Left side - Oscillator Section (like original)
                VStack(spacing: 4) {
                    // Instrument Controls
                    RositaInstrumentSection()
                    
                    // Arpeggiator Controls
                    RositaArpeggiatorSection()
                    
                    // ADSR and Effects side by side
                    HStack(spacing: 4) {
                        RositaADSRSection()
                        RositaEffectsSection()
                    }
                    
                    // Random buttons
                    RositaRandomButtons()
                    
                    Spacer()
                }
                .frame(width: 280)
                .background(Color(hex: "90EE90"))
                .padding(4)
                
                // Right side - Sequencer Section (like original)
                VStack(spacing: 4) {
                    // Transport and pattern controls
                    RositaSequencerControls()
                    
                    // Pattern memory buttons
                    RositaPatternMemory()
                    
                    // Sequencer grid - larger to match original
                    RositaSequencerGrid()
                        .frame(minHeight: 250, maxHeight: 300)
                    
                    Spacer(minLength: 0)
                }
                .background(Color(hex: "90EE90"))
                .padding(4)
                .frame(maxWidth: .infinity)
            }
            
            // Keyboard at bottom (full width) - FIXED!
            RositaPianoKeyboard()
                .frame(height: 120)
                .background(Color(hex: "90EE90"))
                .padding(.horizontal, 4)
        }
        .background(Color(hex: "90EE90"))
    }
}

// MARK: - Compact All-in-One (iPhone) - Everything Visible
struct CompactAllInOneView: View {
    let geometry: GeometryProxy
    @EnvironmentObject var synthEngine: SynthEngine
    
    var body: some View {
        VStack(spacing: 6) {
            // Top transport controls - very compact
            HStack(spacing: 8) {
                Button(action: {
                    synthEngine.togglePlayback()
                    UIImpactFeedbackGenerator(style: .medium).impactOccurred()
                }) {
                    Image(systemName: synthEngine.isPlaying ? "stop.fill" : "play.fill")
                        .font(.system(size: 16))
                        .foregroundColor(.white)
                        .frame(width: 32, height: 32)
                        .background(Circle().fill(synthEngine.isPlaying ? Color.red : Color.green))
                }
                
                Button("Clear") {
                    synthEngine.clearPattern()
                    UIImpactFeedbackGenerator(style: .light).impactOccurred()
                }
                .font(.caption2)
                .foregroundColor(.white)
                .padding(.horizontal, 6)
                .padding(.vertical, 3)
                .background(RoundedRectangle(cornerRadius: 6).fill(Color.blue))
                
                Button("Random") {
                    synthEngine.randomizePattern()
                    UIImpactFeedbackGenerator(style: .light).impactOccurred()
                }
                .font(.caption2)
                .foregroundColor(.white)
                .padding(.horizontal, 6)
                .padding(.vertical, 3)
                .background(RoundedRectangle(cornerRadius: 6).fill(Color.orange))
                
                Spacer()
                
                // BPM control
                HStack(spacing: 4) {
                    Button(action: {
                        synthEngine.bpm = max(60, synthEngine.bpm - 5)
                    }) {
                        Image(systemName: "minus.circle.fill")
                            .font(.system(size: 14))
                            .foregroundColor(.white)
                    }
                    
                    Text("\(Int(synthEngine.bpm))")
                        .font(.caption2)
                        .fontWeight(.bold)
                        .foregroundColor(.white)
                        .frame(width: 28)
                    
                    Button(action: {
                        synthEngine.bpm = min(200, synthEngine.bpm + 5)
                    }) {
                        Image(systemName: "plus.circle.fill")
                            .font(.system(size: 14))
                            .foregroundColor(.white)
                    }
                }
            }
            .padding(.horizontal, 12)
            .padding(.top, 6)
            
            // Main content in landscape split
            HStack(spacing: 8) {
                // Left side - ultra compact controls
                VStack(spacing: 6) {
                    UltraCompactInstrumentSelector()
                    UltraCompactWaveformSelector()
                    UltraCompactADSR()
                    UltraCompactEffects()
                }
                .frame(width: geometry.size.width * 0.25)
                
                // Right side - sequencer and keyboard
                VStack(spacing: 6) {
                    // Use the same retro grid for iPhone
                    RositaSequencerGrid()
                        .frame(height: geometry.size.height * 0.4)
                    
                    // Use the same retro piano for iPhone but smaller
                    RositaPianoKeyboard()
                        .frame(height: geometry.size.height * 0.2)
                }
                .frame(maxWidth: .infinity)
            }
            .padding(.horizontal, 8)
        }
    }
}

// MARK: - Custom Rosita Title Bar
struct RositaTitleBar: View {
    var body: some View {
        HStack {
            // Window controls (macOS style but non-functional for iOS)
            HStack(spacing: 8) {
                Circle()
                    .fill(Color(hex: "FF5F57"))
                    .frame(width: 12, height: 12)
                Circle()
                    .fill(Color(hex: "FFBD2E"))
                    .frame(width: 12, height: 12)
                Circle()
                    .fill(Color(hex: "28CA42"))
                    .frame(width: 12, height: 12)
            }
            .padding(.leading, 10)
            
            Spacer()
            
            // Title
            Text("Rosita")
                .font(.system(size: 12, weight: .bold, design: .monospaced))
                .foregroundColor(.white)
                .textCase(.none)
            
            Spacer()
            
            // Help button
            Button("?") {
                // Help action
            }
            .font(.system(size: 12, weight: .bold))
            .foregroundColor(.white)
            .frame(width: 20, height: 20)
            .background(Circle().fill(Color.white.opacity(0.2)))
            .padding(.trailing, 10)
        }
        .frame(height: 28)
        .background(
            LinearGradient(
                colors: [Color(hex: "FF69B4"), Color(hex: "E75A9A")],
                startPoint: .leading,
                endPoint: .trailing
            )
        )
        .overlay(
            Rectangle()
                .frame(height: 2)
                .foregroundColor(Color(hex: "D1477A")),
            alignment: .bottom
        )
    }
}

// Helper for hex colors
extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default: (a, r, g, b) = (255, 255, 255, 0)
        }
        self.init(.sRGB, red: Double(r) / 255, green: Double(g) / 255, blue: Double(b) / 255, opacity: Double(a) / 255)
    }
}