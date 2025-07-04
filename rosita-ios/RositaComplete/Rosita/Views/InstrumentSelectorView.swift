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
