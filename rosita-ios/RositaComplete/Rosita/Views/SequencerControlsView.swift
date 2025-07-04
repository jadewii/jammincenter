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
