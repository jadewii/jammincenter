import SwiftUI

struct GridView: View {
    @EnvironmentObject var engine: SequencerEngine
    
    var body: some View {
        VStack(spacing: 0) {
            ForEach(0..<6, id: \.self) { trackIndex in
                HStack(spacing: 0) {
                    TrackLabelView(track: engine.tracks[trackIndex])
                        .frame(width: 80)
                    
                    HStack(spacing: 2) {
                        ForEach(0..<16, id: \.self) { stepIndex in
                            StepButton(
                                trackIndex: trackIndex,
                                stepIndex: stepIndex,
                                isActive: engine.isStepActive(track: trackIndex, step: stepIndex),
                                isCurrentStep: engine.currentStep == stepIndex && engine.isPlaying,
                                trackColor: Color(hex: engine.tracks[trackIndex].color)
                            )
                        }
                    }
                    
                    MuteSoloView(trackIndex: trackIndex)
                        .frame(width: 60)
                }
                .padding(.vertical, 2)
            }
        }
        .padding()
        .background(Color.white.opacity(0.95))
        .cornerRadius(20)
        .shadow(color: Color.black.opacity(0.1), radius: 10, x: 0, y: 5)
    }
}

struct StepButton: View {
    let trackIndex: Int
    let stepIndex: Int
    let isActive: Bool
    let isCurrentStep: Bool
    let trackColor: Color
    @EnvironmentObject var engine: SequencerEngine
    
    var body: some View {
        Button(action: {
            engine.toggleStep(track: trackIndex, step: stepIndex)
        }) {
            RoundedRectangle(cornerRadius: 6)
                .fill(backgroundColor)
                .overlay(
                    RoundedRectangle(cornerRadius: 6)
                        .stroke(borderColor, lineWidth: isCurrentStep ? 2 : 1)
                )
                .scaleEffect(isCurrentStep ? 1.1 : 1.0)
                .animation(.easeInOut(duration: 0.1), value: isCurrentStep)
        }
        .frame(width: 32, height: 32)
    }
    
    private var backgroundColor: Color {
        if isActive {
            return Color(hex: "#e91e63")
        } else if stepIndex % 4 == 0 {
            return Color.gray.opacity(0.15)
        } else {
            return Color.gray.opacity(0.05)
        }
    }
    
    private var borderColor: Color {
        if isCurrentStep {
            return trackColor
        } else {
            return Color.gray.opacity(0.3)
        }
    }
}

struct TrackLabelView: View {
    let track: Track
    
    var body: some View {
        HStack {
            Circle()
                .fill(Color(hex: track.color))
                .frame(width: 12, height: 12)
            
            Text(track.name)
                .font(.system(size: 14, weight: .medium, design: .rounded))
                .foregroundColor(.gray)
        }
        .padding(.horizontal, 8)
    }
}

struct MuteSoloView: View {
    let trackIndex: Int
    @EnvironmentObject var engine: SequencerEngine
    
    var body: some View {
        HStack(spacing: 4) {
            Button(action: {
                engine.toggleMute(track: trackIndex)
            }) {
                Text("M")
                    .font(.system(size: 12, weight: .bold))
                    .foregroundColor(engine.tracks[trackIndex].isMuted ? .white : .gray)
                    .frame(width: 24, height: 24)
                    .background(
                        Circle()
                            .fill(engine.tracks[trackIndex].isMuted ? Color.red : Color.gray.opacity(0.2))
                    )
            }
            
            Button(action: {
                engine.toggleSolo(track: trackIndex)
            }) {
                Text("S")
                    .font(.system(size: 12, weight: .bold))
                    .foregroundColor(engine.tracks[trackIndex].isSolo ? .white : .gray)
                    .frame(width: 24, height: 24)
                    .background(
                        Circle()
                            .fill(engine.tracks[trackIndex].isSolo ? Color.yellow : Color.gray.opacity(0.2))
                    )
            }
        }
    }
}