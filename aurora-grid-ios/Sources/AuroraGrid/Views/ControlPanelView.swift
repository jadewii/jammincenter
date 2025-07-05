import SwiftUI

struct ControlPanelView: View {
    @EnvironmentObject var engine: SequencerEngine
    
    var body: some View {
        HStack(spacing: 16) {
            PatternControlsView()
                .frame(maxWidth: .infinity)
            
            EffectsControlsView()
                .frame(maxWidth: .infinity)
            
            SoundControlsView()
                .frame(maxWidth: .infinity)
        }
    }
}

struct PatternControlsView: View {
    @EnvironmentObject var engine: SequencerEngine
    
    var body: some View {
        VStack(spacing: 12) {
            HStack(spacing: 8) {
                ForEach(0..<4) { index in
                    PatternButton(index: index, isActive: engine.currentPattern == index)
                }
            }
            
            HStack(spacing: 12) {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Swing")
                        .font(.system(size: 10, weight: .medium))
                        .foregroundColor(.gray)
                    
                    HStack {
                        Slider(value: $engine.swing, in: 0...100)
                            .frame(width: 80)
                            .accentColor(Color(hex: "#e91e63"))
                        
                        Text("\(Int(engine.swing))%")
                            .font(.system(size: 11, weight: .medium, design: .monospaced))
                            .foregroundColor(.gray)
                            .frame(width: 30)
                    }
                }
                
                Button(action: {
                    engine.randomFill()
                }) {
                    VStack(spacing: 2) {
                        Image(systemName: "dice")
                            .font(.system(size: 16))
                        Text("Random")
                            .font(.system(size: 9))
                    }
                    .foregroundColor(.white)
                    .frame(width: 50, height: 40)
                    .background(Color(hex: "#4ecdc4"))
                    .cornerRadius(8)
                }
            }
        }
        .padding()
        .background(Color.white.opacity(0.95))
        .cornerRadius(16)
        .shadow(color: Color.black.opacity(0.1), radius: 5, x: 0, y: 2)
    }
}

struct PatternButton: View {
    let index: Int
    let isActive: Bool
    @EnvironmentObject var engine: SequencerEngine
    
    var body: some View {
        Button(action: {
            engine.switchPattern(to: index)
        }) {
            Text("\(index + 1)")
                .font(.system(size: 16, weight: .bold))
                .foregroundColor(isActive ? .white : .gray)
                .frame(width: 36, height: 36)
                .background(
                    Circle()
                        .fill(isActive ? Color(hex: "#e91e63") : Color.gray.opacity(0.2))
                )
        }
    }
}

struct EffectsControlsView: View {
    @EnvironmentObject var engine: SequencerEngine
    @State private var volume: Double = 0.7
    @State private var filter: Double = 1.0
    @State private var reverb: Double = 0.2
    @State private var delay: Double = 0.1
    @State private var drive: Double = 0.1
    @State private var compression: Double = 0.2
    
    let effects: [(String, EffectType, Binding<Double>)] = [
        ("Vol", .volume, .constant(0.7)),
        ("Filter", .filter, .constant(1.0)),
        ("Reverb", .reverb, .constant(0.2)),
        ("Delay", .delay, .constant(0.1)),
        ("Drive", .drive, .constant(0.1)),
        ("Comp", .compression, .constant(0.2))
    ]
    
    var body: some View {
        HStack(spacing: 12) {
            ForEach(Array(effects.enumerated()), id: \.offset) { index, effect in
                KnobView(
                    value: binding(for: effect.1),
                    label: effect.0,
                    color: Color(hex: "#45b7d1")
                ) { value in
                    engine.setEffectValue(effect.1, value: value)
                }
            }
        }
        .padding()
        .background(Color.white.opacity(0.95))
        .cornerRadius(16)
        .shadow(color: Color.black.opacity(0.1), radius: 5, x: 0, y: 2)
    }
    
    private func binding(for effect: EffectType) -> Binding<Double> {
        switch effect {
        case .volume: return $volume
        case .filter: return $filter
        case .reverb: return $reverb
        case .delay: return $delay
        case .drive: return $drive
        case .compression: return $compression
        }
    }
}

struct SoundControlsView: View {
    @State private var selectedTrack = 0
    @State private var pitch: Double = 0.5
    @State private var decay: Double = 0.5
    @State private var tone: Double = 0.5
    @State private var snap: Double = 0.5
    @State private var punch: Double = 0.5
    @State private var warm: Double = 0.5
    
    @EnvironmentObject var engine: SequencerEngine
    
    let parameters: [(String, SoundParameter)] = [
        ("Pitch", .pitch),
        ("Decay", .decay),
        ("Tone", .tone),
        ("Snap", .snap),
        ("Punch", .punch),
        ("Warm", .warm)
    ]
    
    var body: some View {
        HStack(spacing: 12) {
            ForEach(Array(parameters.enumerated()), id: \.offset) { index, param in
                KnobView(
                    value: binding(for: param.1),
                    label: param.0,
                    color: Color(hex: "#a55eea")
                ) { value in
                    engine.setSoundParameter(param.1, track: selectedTrack, value: value)
                }
            }
        }
        .padding()
        .background(Color.white.opacity(0.95))
        .cornerRadius(16)
        .shadow(color: Color.black.opacity(0.1), radius: 5, x: 0, y: 2)
    }
    
    private func binding(for param: SoundParameter) -> Binding<Double> {
        switch param {
        case .pitch: return $pitch
        case .decay: return $decay
        case .tone: return $tone
        case .snap: return $snap
        case .punch: return $punch
        case .warm: return $warm
        }
    }
}