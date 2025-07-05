import SwiftUI

struct InstrumentSelectorView: View {
    @EnvironmentObject var synthEngine: SynthEngine
    let instruments = ["Synth", "Bass", "Keys", "Kit"]
    let colors = [Color.pink, Color.blue, Color.purple, Color.yellow]
    
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("INSTRUMENTS")
                .font(.caption)
                .fontWeight(.bold)
                .foregroundColor(.white)
            
            HStack(spacing: 10) {
                ForEach(0..<4) { index in
                    Button(action: {
                        withAnimation(.spring(response: 0.3)) {
                            // Could switch between different synth presets here
                            UIImpactFeedbackGenerator(style: .light).impactOccurred()
                        }
                    }) {
                        VStack(spacing: 5) {
                            Text(instruments[index])
                                .font(.caption2)
                                .fontWeight(.bold)
                            
                            Circle()
                                .fill(colors[index])
                                .frame(width: 8, height: 8)
                        }
                        .frame(width: 60, height: 50)
                        .background(
                            RoundedRectangle(cornerRadius: 10)
                                .fill(Color.white.opacity(0.2))
                        )
                        .overlay(
                            RoundedRectangle(cornerRadius: 10)
                                .stroke(Color.white.opacity(0.3), lineWidth: 1)
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

struct ScaleButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .scaleEffect(configuration.isPressed ? 0.95 : 1.0)
            .animation(.easeInOut(duration: 0.1), value: configuration.isPressed)
    }
}