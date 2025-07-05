import SwiftUI

struct TransportControlsView: View {
    @EnvironmentObject var synthEngine: SynthEngine
    
    var body: some View {
        HStack(spacing: 20) {
            // Play/Stop button
            Button(action: {
                synthEngine.togglePlayback()
                UIImpactFeedbackGenerator(style: .medium).impactOccurred()
            }) {
                Image(systemName: synthEngine.isPlaying ? "stop.fill" : "play.fill")
                    .font(.title)
                    .foregroundColor(.white)
                    .frame(width: 60, height: 60)
                    .background(
                        Circle()
                            .fill(synthEngine.isPlaying ? Color.red : Color.green)
                    )
            }
            .buttonStyle(ScaleButtonStyle())
            
            // Pattern controls
            HStack(spacing: 15) {
                Button(action: {
                    synthEngine.clearPattern()
                    UIImpactFeedbackGenerator(style: .medium).impactOccurred()
                }) {
                    Text("Clear")
                        .font(.caption)
                        .fontWeight(.bold)
                        .foregroundColor(.white)
                        .padding(.horizontal, 20)
                        .padding(.vertical, 10)
                        .background(
                            RoundedRectangle(cornerRadius: 20)
                                .fill(Color.blue)
                        )
                }
                
                Button(action: {
                    synthEngine.randomizePattern()
                    UIImpactFeedbackGenerator(style: .medium).impactOccurred()
                }) {
                    Text("Random")
                        .font(.caption)
                        .fontWeight(.bold)
                        .foregroundColor(.white)
                        .padding(.horizontal, 20)
                        .padding(.vertical, 10)
                        .background(
                            RoundedRectangle(cornerRadius: 20)
                                .fill(Color.orange)
                        )
                }
            }
            
            Spacer()
            
            // BPM control
            VStack(spacing: 5) {
                Text("BPM")
                    .font(.caption2)
                    .foregroundColor(.white)
                
                HStack(spacing: 10) {
                    Button(action: {
                        synthEngine.bpm = max(60, synthEngine.bpm - 5)
                        UIImpactFeedbackGenerator(style: .light).impactOccurred()
                    }) {
                        Image(systemName: "minus.circle.fill")
                            .font(.title2)
                            .foregroundColor(.white)
                    }
                    
                    Text("\(Int(synthEngine.bpm))")
                        .font(.title2)
                        .fontWeight(.bold)
                        .foregroundColor(.white)
                        .frame(width: 60)
                    
                    Button(action: {
                        synthEngine.bpm = min(200, synthEngine.bpm + 5)
                        UIImpactFeedbackGenerator(style: .light).impactOccurred()
                    }) {
                        Image(systemName: "plus.circle.fill")
                            .font(.title2)
                            .foregroundColor(.white)
                    }
                }
            }
            
            // Master volume
            VStack(spacing: 5) {
                Text("Volume")
                    .font(.caption2)
                    .foregroundColor(.white)
                
                Slider(value: $synthEngine.volume, in: 0...1) { _ in
                    synthEngine.updateEffects()
                }
                .frame(width: 100)
                .accentColor(.white)
            }
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 15)
                .fill(Color.black.opacity(0.2))
        )
    }
}