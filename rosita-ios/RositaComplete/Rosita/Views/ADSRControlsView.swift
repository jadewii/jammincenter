import SwiftUI

struct ADSRControlsView: View {
    @EnvironmentObject var audioEngine: AudioEngine
    
    var body: some View {
        VStack(spacing: 15) {
            Text("ADSR ENVELOPE")
                .font(.system(size: 14, weight: .bold))
                .foregroundColor(.white)
            
            VStack(spacing: 10) {
                SliderRow(label: "A", value: $audioEngine.attack, range: 0...1)
                SliderRow(label: "D", value: $audioEngine.decay, range: 0...1)
                SliderRow(label: "S", value: $audioEngine.sustain, range: 0...1)
                SliderRow(label: "R", value: $audioEngine.release, range: 0...2)
            }
            
            // Octave controls
            HStack {
                Text("OCTAVE")
                    .font(.system(size: 12, weight: .medium))
                    .foregroundColor(.white)
                
                Spacer()
                
                Button("-") {
                    // TODO: Implement octave down
                }
                .buttonStyle(OctaveButtonStyle())
                
                Button("+") {
                    // TODO: Implement octave up
                }
                .buttonStyle(OctaveButtonStyle())
            }
            .padding(.top, 10)
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 15)
                .fill(Color.black.opacity(0.3))
        )
    }
}

struct SliderRow: View {
    let label: String
    @Binding var value: Float
    let range: ClosedRange<Float>
    
    var body: some View {
        HStack {
            Text(label)
                .font(.system(size: 12, weight: .bold))
                .foregroundColor(.white)
                .frame(width: 20)
            
            Slider(value: $value, in: range)
                .accentColor(.cyan)
        }
    }
}

struct OctaveButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.system(size: 16, weight: .bold))
            .frame(width: 30, height: 30)
            .foregroundColor(.white)
            .background(
                RoundedRectangle(cornerRadius: 5)
                    .fill(configuration.isPressed ? Color.cyan : Color.white.opacity(0.2))
            )
            .overlay(
                RoundedRectangle(cornerRadius: 5)
                    .stroke(Color.cyan, lineWidth: 1)
            )
    }
}
