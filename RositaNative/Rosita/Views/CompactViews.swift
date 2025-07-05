import SwiftUI

// MARK: - Compact Instrument Selector
struct CompactInstrumentSelectorView: View {
    @EnvironmentObject var synthEngine: SynthEngine
    let instruments = ["Synth", "Bass", "Keys", "Kit"]
    let colors = [Color.pink, Color.blue, Color.purple, Color.yellow]
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("INSTRUMENTS")
                .font(.caption2)
                .fontWeight(.bold)
                .foregroundColor(.white)
            
            HStack(spacing: 8) {
                ForEach(0..<4) { index in
                    Button(action: {
                        UIImpactFeedbackGenerator(style: .light).impactOccurred()
                    }) {
                        VStack(spacing: 3) {
                            Text(instruments[index])
                                .font(.caption2)
                                .fontWeight(.bold)
                            
                            Circle()
                                .fill(colors[index])
                                .frame(width: 6, height: 6)
                        }
                        .frame(maxWidth: .infinity, minHeight: 35)
                        .background(
                            RoundedRectangle(cornerRadius: 8)
                                .fill(Color.white.opacity(0.15))
                        )
                    }
                    .buttonStyle(ScaleButtonStyle())
                }
            }
        }
        .padding(12)
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(Color.black.opacity(0.15))
        )
    }
}

// MARK: - Compact Waveform Selector
struct CompactWaveformSelectorView: View {
    @EnvironmentObject var synthEngine: SynthEngine
    let waveforms = ["Sine", "Saw", "Square", "Triangle"]
    let waveformIcons = ["∿", "⩙", "⊓", "△"]
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("WAVEFORM")
                .font(.caption2)
                .fontWeight(.bold)
                .foregroundColor(.white)
            
            HStack(spacing: 8) {
                ForEach(0..<4) { index in
                    Button(action: {
                        synthEngine.selectedWaveform = index
                        synthEngine.updateWaveform()
                        UIImpactFeedbackGenerator(style: .light).impactOccurred()
                    }) {
                        VStack(spacing: 2) {
                            Text(waveformIcons[index])
                                .font(.system(size: 16))
                            
                            Text(waveforms[index])
                                .font(.caption2)
                                .fontWeight(.medium)
                        }
                        .frame(maxWidth: .infinity, minHeight: 35)
                        .foregroundColor(synthEngine.selectedWaveform == index ? .black : .white)
                        .background(
                            RoundedRectangle(cornerRadius: 8)
                                .fill(synthEngine.selectedWaveform == index ? Color.white : Color.white.opacity(0.15))
                        )
                    }
                    .buttonStyle(ScaleButtonStyle())
                }
            }
        }
        .padding(12)
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(Color.black.opacity(0.15))
        )
    }
}

// MARK: - Compact ADSR
struct CompactADSRView: View {
    @EnvironmentObject var synthEngine: SynthEngine
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("ENVELOPE")
                .font(.caption2)
                .fontWeight(.bold)
                .foregroundColor(.white)
            
            VStack(spacing: 8) {
                CompactADSRSlider(label: "A", value: $synthEngine.attack, range: 0...2) {
                    synthEngine.updateADSR()
                }
                
                CompactADSRSlider(label: "D", value: $synthEngine.decay, range: 0...2) {
                    synthEngine.updateADSR()
                }
                
                CompactADSRSlider(label: "S", value: $synthEngine.sustain, range: 0...1) {
                    synthEngine.updateADSR()
                }
                
                CompactADSRSlider(label: "R", value: $synthEngine.release, range: 0...5) {
                    synthEngine.updateADSR()
                }
            }
        }
        .padding(12)
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(Color.black.opacity(0.15))
        )
    }
}

struct CompactADSRSlider: View {
    let label: String
    @Binding var value: Double
    let range: ClosedRange<Double>
    let onChanged: () -> Void
    
    var body: some View {
        HStack(spacing: 8) {
            Text(label)
                .font(.caption)
                .fontWeight(.bold)
                .foregroundColor(.white)
                .frame(width: 15)
            
            Slider(value: $value, in: range) { _ in
                onChanged()
            }
            .accentColor(.pink)
            
            Text(String(format: "%.2f", value))
                .font(.caption2)
                .foregroundColor(.white)
                .frame(width: 30)
        }
    }
}

// MARK: - Compact Effects
struct CompactEffectsView: View {
    @EnvironmentObject var synthEngine: SynthEngine
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("EFFECTS")
                .font(.caption2)
                .fontWeight(.bold)
                .foregroundColor(.white)
            
            VStack(spacing: 6) {
                CompactEffectSlider(label: "Delay", value: $synthEngine.delayMix, range: 0...1) {
                    synthEngine.updateEffects()
                }
                
                CompactEffectSlider(label: "Reverb", value: $synthEngine.reverbMix, range: 0...1) {
                    synthEngine.updateEffects()
                }
                
                CompactEffectSlider(label: "Saturation", value: $synthEngine.distortionAmount, range: 0...1) {
                    synthEngine.updateEffects()
                }
                
                CompactEffectSlider(label: "Filter", value: $synthEngine.filterCutoff, range: 100...20000, displayFormat: "%.0f") {
                    synthEngine.updateEffects()
                }
            }
        }
        .padding(12)
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(Color.black.opacity(0.15))
        )
    }
}

struct CompactEffectSlider: View {
    let label: String
    @Binding var value: Double
    let range: ClosedRange<Double>
    var displayFormat: String = "%.2f"
    let onChanged: () -> Void
    
    var body: some View {
        HStack(spacing: 8) {
            Text(label)
                .font(.caption2)
                .foregroundColor(.white)
                .frame(width: 55, alignment: .leading)
            
            Slider(value: $value, in: range) { _ in
                onChanged()
            }
            .accentColor(.blue)
            
            Text(String(format: displayFormat, value))
                .font(.caption2)
                .foregroundColor(.white)
                .frame(width: 35, alignment: .trailing)
        }
    }
}

// MARK: - Compact Sequencer
struct CompactSequencerView: View {
    let geometry: GeometryProxy
    @EnvironmentObject var synthEngine: SynthEngine
    
    let noteLabels = ["C5", "B4", "A4", "G4", "F4", "E4", "D4", "C4"]
    let gridColors: [Color] = [.pink, .orange, .yellow, .green, .cyan, .blue, .purple, .red]
    
    var body: some View {
        VStack(spacing: 8) {
            // Step numbers
            HStack(spacing: 1) {
                Text("")
                    .frame(width: 25)
                
                ForEach(0..<16) { step in
                    Text("\(step + 1)")
                        .font(.caption2)
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                }
            }
            .padding(.horizontal, 8)
            
            // Grid
            ScrollView {
                VStack(spacing: 1) {
                    ForEach(0..<8) { row in
                        HStack(spacing: 1) {
                            // Note label
                            Text(noteLabels[row])
                                .font(.caption2)
                                .fontWeight(.bold)
                                .foregroundColor(.white)
                                .frame(width: 25)
                            
                            // Step buttons
                            ForEach(0..<16) { col in
                                CompactSequencerCell(
                                    isActive: synthEngine.pattern[row][col],
                                    isPlaying: synthEngine.isPlaying && synthEngine.currentStep == col,
                                    color: gridColors[row]
                                ) {
                                    synthEngine.toggleCell(row: row, col: col)
                                    UIImpactFeedbackGenerator(style: .light).impactOccurred()
                                }
                            }
                        }
                    }
                }
                .padding(.horizontal, 8)
            }
        }
        .padding(.vertical, 8)
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(Color.black.opacity(0.2))
        )
        .padding(.horizontal, 12)
    }
}

struct CompactSequencerCell: View {
    let isActive: Bool
    let isPlaying: Bool
    let color: Color
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            RoundedRectangle(cornerRadius: 2)
                .fill(isActive ? color : Color.white.opacity(0.15))
                .overlay(
                    RoundedRectangle(cornerRadius: 2)
                        .stroke(isPlaying ? Color.white : Color.clear, lineWidth: 1)
                )
                .scaleEffect(isPlaying ? 1.05 : 1.0)
                .animation(.easeInOut(duration: 0.1), value: isPlaying)
        }
        .frame(height: 20)
    }
}

// MARK: - Compact Piano
struct CompactPianoView: View {
    let geometry: GeometryProxy
    @EnvironmentObject var synthEngine: SynthEngine
    
    var body: some View {
        VStack(spacing: 8) {
            // Current note display
            HStack {
                Text("Touch keyboard to play notes")
                    .font(.caption)
                    .foregroundColor(.white.opacity(0.7))
                
                Spacer()
                
                if !synthEngine.activeNotes.isEmpty {
                    Text("Playing: \(synthEngine.activeNotes.count) notes")
                        .font(.caption)
                        .foregroundColor(.white)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(Color.green.opacity(0.3))
                        .cornerRadius(8)
                }
            }
            .padding(.horizontal, 16)
            
            // Piano keyboard - optimized for iPhone
            CompactPianoKeyboard()
                .frame(height: geometry.size.height * 0.6)
                .padding(.horizontal, 8)
        }
    }
}

struct CompactPianoKeyboard: View {
    @EnvironmentObject var synthEngine: SynthEngine
    @State private var touchedKeys: Set<Int> = []
    
    var body: some View {
        GeometryReader { geometry in
            ZStack(alignment: .bottom) {
                // White keys
                HStack(spacing: 1) {
                    ForEach(0..<8) { index in
                        CompactWhiteKey(
                            noteIndex: index,
                            isPressed: synthEngine.activeNotes.contains(index) || touchedKeys.contains(index),
                            onPress: { 
                                touchedKeys.insert(index)
                                synthEngine.playNote(index) 
                            },
                            onRelease: { 
                                touchedKeys.remove(index)
                                synthEngine.stopNote(index) 
                            }
                        )
                    }
                }
                
                // Black keys - simplified for iPhone
                HStack(spacing: 0) {
                    let blackKeyWidth = (geometry.size.width / 8) * 0.6
                    let whiteKeyWidth = geometry.size.width / 8
                    
                    ForEach([1, 3, 6, 8], id: \.self) { position in
                        Spacer()
                            .frame(width: whiteKeyWidth * 0.7)
                        
                        CompactBlackKey(
                            noteIndex: position + 10, // Offset for black keys
                            isPressed: false,
                            onPress: { },
                            onRelease: { }
                        )
                        .frame(width: blackKeyWidth)
                        
                        if position != 8 {
                            Spacer()
                                .frame(width: whiteKeyWidth * (position == 3 ? 1.3 : 0.3))
                        }
                    }
                }
                .frame(height: geometry.size.height * 0.6)
                .offset(y: -geometry.size.height * 0.2)
            }
        }
        .background(
            RoundedRectangle(cornerRadius: 8)
                .fill(Color.black.opacity(0.2))
        )
    }
}

struct CompactWhiteKey: View {
    let noteIndex: Int
    let isPressed: Bool
    let onPress: () -> Void
    let onRelease: () -> Void
    
    @State private var isTouched = false
    
    var body: some View {
        Rectangle()
            .fill(isTouched || isPressed ? Color.pink.opacity(0.8) : Color.white)
            .overlay(
                Rectangle()
                    .stroke(Color.gray.opacity(0.3), lineWidth: 0.5)
            )
            .cornerRadius(4, corners: [.bottomLeft, .bottomRight])
            .scaleEffect(isTouched || isPressed ? 0.95 : 1.0)
            .animation(.easeInOut(duration: 0.1), value: isTouched || isPressed)
            .onLongPressGesture(minimumDuration: 0, maximumDistance: .infinity) {
                
            } onPressingChanged: { pressing in
                isTouched = pressing
                if pressing {
                    onPress()
                } else {
                    onRelease()
                }
            }
    }
}

struct CompactBlackKey: View {
    let noteIndex: Int
    let isPressed: Bool
    let onPress: () -> Void
    let onRelease: () -> Void
    
    @State private var isTouched = false
    
    var body: some View {
        Rectangle()
            .fill(isTouched || isPressed ? Color.gray : Color.black)
            .cornerRadius(3, corners: [.bottomLeft, .bottomRight])
            .scaleEffect(isTouched || isPressed ? 0.95 : 1.0)
            .animation(.easeInOut(duration: 0.1), value: isTouched || isPressed)
            .onLongPressGesture(minimumDuration: 0, maximumDistance: .infinity) {
                
            } onPressingChanged: { pressing in
                isTouched = pressing
                if pressing {
                    onPress()
                } else {
                    onRelease()
                }
            }
    }
}

// MARK: - Ultra Compact Components for iPhone All-in-One View

struct UltraCompactInstrumentSelector: View {
    @EnvironmentObject var synthEngine: SynthEngine
    let instruments = ["1", "2", "3", "4"]
    let colors = [Color.pink, Color.blue, Color.purple, Color.yellow]
    
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text("INSTRUMENTS")
                .font(.caption2)
                .fontWeight(.bold)
                .foregroundColor(.white)
            
            VStack(spacing: 3) {
                ForEach(0..<4) { index in
                    Button(action: {
                        UIImpactFeedbackGenerator(style: .light).impactOccurred()
                    }) {
                        HStack(spacing: 6) {
                            Circle()
                                .fill(colors[index])
                                .frame(width: 8, height: 8)
                            
                            Text(instruments[index])
                                .font(.caption2)
                                .fontWeight(.bold)
                                .foregroundColor(.white)
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(.horizontal, 6)
                        .padding(.vertical, 3)
                        .background(
                            RoundedRectangle(cornerRadius: 4)
                                .fill(Color.white.opacity(0.15))
                        )
                    }
                }
            }
        }
        .padding(6)
        .background(
            RoundedRectangle(cornerRadius: 8)
                .fill(Color.black.opacity(0.15))
        )
    }
}

struct UltraCompactWaveformSelector: View {
    @EnvironmentObject var synthEngine: SynthEngine
    let waveforms = ["∿", "⩙", "⊓", "△"]
    
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text("WAVEFORM")
                .font(.caption2)
                .fontWeight(.bold)
                .foregroundColor(.white)
            
            HStack(spacing: 2) {
                ForEach(0..<4) { index in
                    Button(action: {
                        synthEngine.selectedWaveform = index
                        synthEngine.updateWaveform()
                        UIImpactFeedbackGenerator(style: .light).impactOccurred()
                    }) {
                        Text(waveforms[index])
                            .font(.caption)
                            .foregroundColor(synthEngine.selectedWaveform == index ? .black : .white)
                            .frame(maxWidth: .infinity, minHeight: 20)
                            .background(
                                RoundedRectangle(cornerRadius: 3)
                                    .fill(synthEngine.selectedWaveform == index ? Color.white : Color.white.opacity(0.15))
                            )
                    }
                }
            }
        }
        .padding(6)
        .background(
            RoundedRectangle(cornerRadius: 8)
                .fill(Color.black.opacity(0.15))
        )
    }
}

struct UltraCompactADSR: View {
    @EnvironmentObject var synthEngine: SynthEngine
    
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text("ENVELOPE")
                .font(.caption2)
                .fontWeight(.bold)
                .foregroundColor(.white)
            
            VStack(spacing: 3) {
                UltraCompactSlider(label: "A", value: $synthEngine.attack, range: 0...2) {
                    synthEngine.updateADSR()
                }
                UltraCompactSlider(label: "D", value: $synthEngine.decay, range: 0...2) {
                    synthEngine.updateADSR()
                }
                UltraCompactSlider(label: "S", value: $synthEngine.sustain, range: 0...1) {
                    synthEngine.updateADSR()
                }
                UltraCompactSlider(label: "R", value: $synthEngine.release, range: 0...5) {
                    synthEngine.updateADSR()
                }
            }
        }
        .padding(6)
        .background(
            RoundedRectangle(cornerRadius: 8)
                .fill(Color.black.opacity(0.15))
        )
    }
}

struct UltraCompactEffects: View {
    @EnvironmentObject var synthEngine: SynthEngine
    
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text("EFFECTS")
                .font(.caption2)
                .fontWeight(.bold)
                .foregroundColor(.white)
            
            VStack(spacing: 2) {
                UltraCompactSlider(label: "DLY", value: $synthEngine.delayMix, range: 0...1) {
                    synthEngine.updateEffects()
                }
                UltraCompactSlider(label: "REV", value: $synthEngine.reverbMix, range: 0...1) {
                    synthEngine.updateEffects()
                }
                UltraCompactSlider(label: "SAT", value: $synthEngine.distortionAmount, range: 0...1) {
                    synthEngine.updateEffects()
                }
                UltraCompactSlider(label: "FLT", value: $synthEngine.filterCutoff, range: 100...20000, displayFormat: "%.0f") {
                    synthEngine.updateEffects()
                }
            }
        }
        .padding(6)
        .background(
            RoundedRectangle(cornerRadius: 8)
                .fill(Color.black.opacity(0.15))
        )
    }
}

struct UltraCompactSlider: View {
    let label: String
    @Binding var value: Double
    let range: ClosedRange<Double>
    var displayFormat: String = "%.1f"
    let onChanged: () -> Void
    
    var body: some View {
        HStack(spacing: 4) {
            Text(label)
                .font(.caption2)
                .foregroundColor(.white)
                .frame(width: 20, alignment: .leading)
            
            Slider(value: $value, in: range) { _ in
                onChanged()
            }
            .accentColor(.pink)
            
            Text(String(format: displayFormat, value))
                .font(.caption2)
                .foregroundColor(.white)
                .frame(width: 25, alignment: .trailing)
        }
    }
}

struct CompactSequencerGrid: View {
    @EnvironmentObject var synthEngine: SynthEngine
    
    let noteLabels = ["C5", "B4", "A4", "G4", "F4", "E4", "D4", "C4"]
    let gridColors: [Color] = [.pink, .orange, .yellow, .green, .cyan, .blue, .purple, .red]
    
    var body: some View {
        VStack(spacing: 1) {
            // Step numbers
            HStack(spacing: 1) {
                Text("")
                    .frame(width: 20)
                
                ForEach(0..<16) { step in
                    Text("\(step + 1)")
                        .font(.caption2)
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                }
            }
            
            // Grid rows
            ForEach(0..<8) { row in
                HStack(spacing: 1) {
                    Text(noteLabels[row])
                        .font(.caption2)
                        .fontWeight(.bold)
                        .foregroundColor(.white)
                        .frame(width: 20)
                    
                    ForEach(0..<16) { col in
                        Button(action: {
                            synthEngine.toggleCell(row: row, col: col)
                            UIImpactFeedbackGenerator(style: .light).impactOccurred()
                        }) {
                            RoundedRectangle(cornerRadius: 1)
                                .fill(synthEngine.pattern[row][col] ? gridColors[row] : Color.white.opacity(0.15))
                                .overlay(
                                    RoundedRectangle(cornerRadius: 1)
                                        .stroke(synthEngine.isPlaying && synthEngine.currentStep == col ? Color.white : Color.clear, lineWidth: 1)
                                )
                        }
                        .frame(height: 16)
                    }
                }
            }
        }
        .padding(6)
        .background(
            RoundedRectangle(cornerRadius: 8)
                .fill(Color.black.opacity(0.2))
        )
    }
}

struct UltraCompactPiano: View {
    @EnvironmentObject var synthEngine: SynthEngine
    @State private var touchedKeys: Set<Int> = []
    
    var body: some View {
        GeometryReader { geometry in
            ZStack(alignment: .bottom) {
                // White keys
                HStack(spacing: 1) {
                    ForEach(0..<8) { index in
                        Button(action: {}) {
                            Rectangle()
                                .fill(synthEngine.activeNotes.contains(index) || touchedKeys.contains(index) ? Color.pink.opacity(0.8) : Color.white)
                                .overlay(
                                    Rectangle()
                                        .stroke(Color.gray.opacity(0.3), lineWidth: 0.5)
                                )
                        }
                        .onLongPressGesture(minimumDuration: 0, maximumDistance: .infinity) {
                            
                        } onPressingChanged: { pressing in
                            if pressing {
                                touchedKeys.insert(index)
                                synthEngine.playNote(index)
                            } else {
                                touchedKeys.remove(index)
                                synthEngine.stopNote(index)
                            }
                        }
                    }
                }
                
                // Black keys - simplified
                HStack(spacing: 0) {
                    let blackKeyWidth = (geometry.size.width / 8) * 0.6
                    let whiteKeyWidth = geometry.size.width / 8
                    
                    ForEach([0, 1, 3, 4, 5], id: \.self) { position in
                        Spacer()
                            .frame(width: whiteKeyWidth * 0.7)
                        
                        if position != 2 && position != 6 { // No black key between E-F and B-C
                            Button(action: {}) {
                                Rectangle()
                                    .fill(Color.black)
                            }
                            .frame(width: blackKeyWidth, height: geometry.size.height * 0.6)
                            .onLongPressGesture(minimumDuration: 0, maximumDistance: .infinity) {
                                
                            } onPressingChanged: { pressing in
                                // Add black key logic here
                            }
                        }
                        
                        if position < 4 {
                            Spacer()
                                .frame(width: whiteKeyWidth * (position == 1 || position == 4 ? 1.3 : 0.3))
                        }
                    }
                }
                .offset(y: -geometry.size.height * 0.2)
            }
        }
        .background(
            RoundedRectangle(cornerRadius: 6)
                .fill(Color.black.opacity(0.2))
        )
    }
}