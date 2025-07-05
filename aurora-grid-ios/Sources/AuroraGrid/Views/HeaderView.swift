import SwiftUI

struct HeaderView: View {
    @EnvironmentObject var engine: SequencerEngine
    
    var body: some View {
        HStack(spacing: 20) {
            Text("Aurora Grid")
                .font(.system(size: 28, weight: .bold, design: .rounded))
                .foregroundColor(.white)
            
            Spacer()
            
            HStack(spacing: 12) {
                Button(action: {
                    engine.togglePlayback()
                }) {
                    Image(systemName: engine.isPlaying ? "stop.fill" : "play.fill")
                        .font(.system(size: 20))
                        .foregroundColor(.white)
                        .frame(width: 44, height: 44)
                        .background(Color(hex: "#e91e63"))
                        .clipShape(Circle())
                        .shadow(color: Color.black.opacity(0.2), radius: 4, x: 0, y: 2)
                }
                
                Button(action: {
                    engine.clearPattern()
                }) {
                    Image(systemName: "trash")
                        .font(.system(size: 18))
                        .foregroundColor(.white)
                        .frame(width: 44, height: 44)
                        .background(Color.gray)
                        .clipShape(Circle())
                        .shadow(color: Color.black.opacity(0.2), radius: 4, x: 0, y: 2)
                }
            }
            
            Divider()
                .frame(height: 40)
                .background(Color.white.opacity(0.3))
            
            VStack(alignment: .leading, spacing: 4) {
                Text("BPM")
                    .font(.system(size: 12, weight: .medium))
                    .foregroundColor(.white.opacity(0.7))
                
                HStack {
                    Text("\(Int(engine.bpm))")
                        .font(.system(size: 20, weight: .bold, design: .monospaced))
                        .foregroundColor(.white)
                        .frame(width: 50)
                    
                    Slider(value: $engine.bpm, in: 60...200, step: 1)
                        .frame(width: 120)
                        .accentColor(Color(hex: "#e91e63"))
                }
            }
        }
        .padding(.horizontal, 24)
        .padding(.vertical, 12)
        .background(
            Color.black.opacity(0.1)
                .background(.ultraThinMaterial)
        )
        .cornerRadius(16)
    }
}