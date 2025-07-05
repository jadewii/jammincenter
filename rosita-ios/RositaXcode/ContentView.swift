import SwiftUI
import AVFoundation

struct ContentView: View {
    @StateObject private var sequencer = SequencerEngine()
    
    var body: some View {
        GeometryReader { geometry in
            ZStack {
                // Beautiful gradient background
                LinearGradient(
                    colors: [
                        Color(red: 0.96, green: 0.76, blue: 0.78),
                        Color(red: 0.82, green: 0.93, blue: 0.95),
                        Color(red: 0.89, green: 0.89, blue: 1.0)
                    ],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
                .ignoresSafeArea()
                
                VStack(spacing: 8) {
                    // Header
                    HeaderView(sequencer: sequencer)
                        .frame(height: 50)
                    
                    // Main Grid
                    ScrollView {
                        VStack(spacing: 4) {
                            ForEach(Array(sequencer.tracks.enumerated()), id: \.offset) { index, track in
                                TrackRowView(
                                    track: track,
                                    trackIndex: index,
                                    sequencer: sequencer
                                )
                            }
                        }
                        .padding(12)
                        .background(Color.white.opacity(0.9))
                        .cornerRadius(8)
                    }
                    
                    // Bottom Controls
                    HStack(spacing: 20) {
                        PatternPanel(sequencer: sequencer)
                        EffectsPanel(sequencer: sequencer)
                        SoundDesignPanel(sequencer: sequencer)
                    }
                    .frame(height: 140)
                }
                .padding(8)
            }
        }
    }
}

struct HeaderView: View {
    @ObservedObject var sequencer: SequencerEngine
    
    var body: some View {
        HStack {
            Text("🌸 Aurora Grid")
                .font(.title2)
                .fontWeight(.semibold)
                .foregroundColor(Color(red: 0.91, green: 0.12, blue: 0.39))
            
            Spacer()
            
            HStack(spacing: 12) {
                Button(action: {
                    if sequencer.isPlaying {
                        sequencer.stop()
                    } else {
                        sequencer.play()
                    }
                }) {
                    Text(sequencer.isPlaying ? "Stop" : "Play")
                        .foregroundColor(.white)
                        .padding(.horizontal, 16)
                        .padding(.vertical, 8)
                        .background(sequencer.isPlaying ? Color.red : Color.green)
                        .cornerRadius(8)
                }
                
                Button(action: {
                    sequencer.clear()
                }) {
                    Text("Clear")
                        .foregroundColor(.black)
                        .padding(.horizontal, 16)
                        .padding(.vertical, 8)
                        .background(Color.white)
                        .overlay(
                            RoundedRectangle(cornerRadius: 8)
                                .stroke(Color.gray.opacity(0.3), lineWidth: 2)
                        )
                        .cornerRadius(8)
                }
                
                HStack {
                    Text("BPM:")
                    TextField("120", value: $sequencer.tempo, format: .number)
                        .frame(width: 60)
                        .textFieldStyle(RoundedBorderTextFieldStyle())
                }
                .padding(.horizontal, 12)
                .padding(.vertical, 8)
                .background(Color.white)
                .overlay(
                    RoundedRectangle(cornerRadius: 8)
                        .stroke(Color.gray.opacity(0.3), lineWidth: 2)
                )
                .cornerRadius(8)
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 8)
        .background(Color.white.opacity(0.9))
        .cornerRadius(8)
    }
}

struct TrackRowView: View {
    let track: Track
    let trackIndex: Int
    @ObservedObject var sequencer: SequencerEngine
    
    var trackColors: [Color] = [
        Color(red: 1.0, green: 0.7, blue: 0.73),   // Kick - pink
        Color(red: 0.73, green: 0.88, blue: 1.0),  // Snare - blue
        Color(red: 0.73, green: 1.0, blue: 0.79),  // Hi-hat - green
        Color(red: 1.0, green: 1.0, blue: 0.73),   // Open hat - yellow
        Color(red: 1.0, green: 0.87, blue: 0.73),  // Crash - orange
        Color(red: 0.88, green: 0.67, blue: 1.0)   // Bass - purple
    ]
    
    var body: some View {
        HStack(spacing: 8) {
            // Track label
            Text(track.name)
                .font(.system(size: 11, weight: .medium))
                .frame(width: 70)
                .padding(.vertical, 6)
                .background(trackColors[trackIndex])
                .cornerRadius(6)
            
            // Step grid
            HStack(spacing: 4) {
                ForEach(0..<16) { step in
                    StepButton(
                        isActive: sequencer.patterns[sequencer.currentPattern].tracks[trackIndex].steps[step],
                        isPlaying: sequencer.currentStep == step && sequencer.isPlaying,
                        isBeat: step % 4 == 0,
                        stepNumber: step + 1,
                        action: {
                            sequencer.toggleStep(track: trackIndex, step: step)
                        }
                    )
                }
            }
            
            // Mute/Solo
            HStack(spacing: 4) {
                Button(action: {
                    sequencer.toggleMute(track: trackIndex)
                }) {
                    Text("M")
                        .font(.system(size: 10, weight: .medium))
                        .foregroundColor(track.isMuted ? .white : .black)
                        .frame(width: 30, height: 24)
                        .background(track.isMuted ? Color.red : Color.white)
                        .overlay(
                            RoundedRectangle(cornerRadius: 4)
                                .stroke(Color.gray.opacity(0.3), lineWidth: 1)
                        )
                        .cornerRadius(4)
                }
                
                Button(action: {
                    sequencer.toggleSolo(track: trackIndex)
                }) {
                    Text("S")
                        .font(.system(size: 10, weight: .medium))
                        .foregroundColor(track.isSolo ? .black : .black)
                        .frame(width: 30, height: 24)
                        .background(track.isSolo ? Color.yellow : Color.white)
                        .overlay(
                            RoundedRectangle(cornerRadius: 4)
                                .stroke(Color.gray.opacity(0.3), lineWidth: 1)
                        )
                        .cornerRadius(4)
                }
            }
        }
    }
}

struct StepButton: View {
    let isActive: Bool
    let isPlaying: Bool
    let isBeat: Bool
    let stepNumber: Int
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            Text("\(stepNumber)")
                .font(.system(size: 9, weight: .semibold))
                .foregroundColor(isActive ? .white : .black)
                .frame(width: 32, height: 32)
                .background(isActive ? Color(red: 0.91, green: 0.12, blue: 0.39) : Color.clear)
                .overlay(
                    RoundedRectangle(cornerRadius: 4)
                        .stroke(
                            isPlaying ? Color.yellow : (isBeat ? Color.black : Color.gray.opacity(0.3)),
                            lineWidth: isPlaying ? 3 : (isBeat ? 3 : 2)
                        )
                )
                .cornerRadius(4)
                .scaleEffect(isPlaying ? 1.2 : 1.0)
                .animation(.easeInOut(duration: 0.1), value: isPlaying)
        }
    }
}

struct PatternPanel: View {
    @ObservedObject var sequencer: SequencerEngine
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Patterns")
                .font(.system(size: 16, weight: .semibold))
                .foregroundColor(.gray)
            
            HStack(spacing: 8) {
                ForEach(0..<4) { pattern in
                    Button(action: {
                        sequencer.switchPattern(to: pattern)
                    }) {
                        Text("\(pattern + 1)")
                            .foregroundColor(sequencer.currentPattern == pattern ? .white : .black)
                            .frame(width: 40, height: 40)
                            .background(sequencer.currentPattern == pattern ? Color(red: 0.91, green: 0.12, blue: 0.39) : Color.gray.opacity(0.2))
                            .cornerRadius(8)
                    }
                }
            }
            
            HStack {
                Text("Swing:")
                Slider(value: $sequencer.swing, in: 0...100)
                Text("\(Int(sequencer.swing))%")
                    .font(.system(size: 12))
                    .frame(width: 40)
            }
            
            Button(action: {
                sequencer.randomFill()
            }) {
                Text("Random Fill")
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 8)
                    .background(Color.blue)
                    .cornerRadius(8)
            }
        }
        .padding(20)
        .background(Color.white.opacity(0.9))
        .cornerRadius(12)
    }
}

struct EffectsPanel: View {
    @ObservedObject var sequencer: SequencerEngine
    
    let effects = ["Vol", "Filter", "Reverb", "Delay", "Drive", "Comp"]
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Mix & Effects")
                .font(.system(size: 16, weight: .semibold))
                .foregroundColor(.gray)
            
            LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 3), spacing: 16) {
                ForEach(Array(effects.enumerated()), id: \.offset) { index, effect in
                    KnobView(
                        value: .constant(0.5),
                        label: effect,
                        color: Color.blue
                    )
                }
            }
        }
        .padding(20)
        .background(Color.white.opacity(0.9))
        .cornerRadius(12)
    }
}

struct SoundDesignPanel: View {
    @ObservedObject var sequencer: SequencerEngine
    
    let parameters = ["Pitch", "Decay", "Tone", "Snap", "Punch", "Warm"]
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Sound Design")
                .font(.system(size: 16, weight: .semibold))
                .foregroundColor(.gray)
            
            LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 3), spacing: 16) {
                ForEach(Array(parameters.enumerated()), id: \.offset) { index, param in
                    KnobView(
                        value: .constant(0.5),
                        label: param,
                        color: Color.purple
                    )
                }
            }
        }
        .padding(20)
        .background(Color.white.opacity(0.9))
        .cornerRadius(12)
    }
}

struct KnobView: View {
    @Binding var value: Double
    let label: String
    let color: Color
    
    var body: some View {
        VStack(spacing: 8) {
            ZStack {
                Circle()
                    .fill(Color.gray.opacity(0.1))
                    .frame(width: 50, height: 50)
                
                Circle()
                    .stroke(Color.gray.opacity(0.3), lineWidth: 3)
                    .frame(width: 44, height: 44)
                
                Rectangle()
                    .fill(Color.black)
                    .frame(width: 3, height: 18)
                    .offset(y: -11)
                    .rotationEffect(.degrees(value * 270 - 135))
            }
            
            Text(label)
                .font(.system(size: 11))
                .foregroundColor(.gray)
        }
    }
}