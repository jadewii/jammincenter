import SwiftUI

struct WaveformSelectorView: View {
    @EnvironmentObject var synthEngine: SynthEngine
    let waveforms = ["Sine", "Saw", "Square", "Triangle"]
    let waveformIcons = ["∿", "⩙", "⊓", "△"]
    
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("WAVEFORM")
                .font(.caption)
                .fontWeight(.bold)
                .foregroundColor(.white)
            
            HStack(spacing: 10) {
                ForEach(0..<4) { index in
                    Button(action: {
                        synthEngine.selectedWaveform = index
                        synthEngine.updateWaveform()
                        UIImpactFeedbackGenerator(style: .light).impactOccurred()
                    }) {
                        VStack(spacing: 5) {
                            Text(waveformIcons[index])
                                .font(.title2)
                            
                            Text(waveforms[index])
                                .font(.caption2)
                                .fontWeight(.medium)
                        }
                        .frame(width: 60, height: 50)
                        .foregroundColor(synthEngine.selectedWaveform == index ? .black : .white)
                        .background(
                            RoundedRectangle(cornerRadius: 10)
                                .fill(synthEngine.selectedWaveform == index ? Color.white : Color.white.opacity(0.2))
                        )
                    }
                    .buttonStyle(ScaleButtonStyle())
                }
            }
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 15)
                .fill(Color.black.opacity(0.2))
        )
    }
}