import SwiftUI

struct ADSRControlsView: View {
    @EnvironmentObject var synthEngine: SynthEngine
    
    var body: some View {
        VStack(alignment: .leading, spacing: 15) {
            Text("ENVELOPE")
                .font(.caption)
                .fontWeight(.bold)
                .foregroundColor(.white)
            
            VStack(spacing: 12) {
                ADSRSlider(label: "A", value: $synthEngine.attack, range: 0...2) {
                    synthEngine.updateADSR()
                }
                
                ADSRSlider(label: "D", value: $synthEngine.decay, range: 0...2) {
                    synthEngine.updateADSR()
                }
                
                ADSRSlider(label: "S", value: $synthEngine.sustain, range: 0...1) {
                    synthEngine.updateADSR()
                }
                
                ADSRSlider(label: "R", value: $synthEngine.release, range: 0...5) {
                    synthEngine.updateADSR()
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

struct ADSRSlider: View {
    let label: String
    @Binding var value: Double
    let range: ClosedRange<Double>
    let onChanged: () -> Void
    
    var body: some View {
        HStack(spacing: 12) {
            Text(label)
                .font(.system(size: 14, weight: .bold))
                .foregroundColor(.white)
                .frame(width: 20)
            
            Slider(value: $value, in: range) { _ in
                onChanged()
            }
            .accentColor(.pink)
            
            Text(String(format: "%.2f", value))
                .font(.caption2)
                .foregroundColor(.white)
                .frame(width: 35)
        }
    }
}