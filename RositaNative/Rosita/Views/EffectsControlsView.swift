import SwiftUI

struct EffectsControlsView: View {
    @EnvironmentObject var synthEngine: SynthEngine
    
    var body: some View {
        VStack(alignment: .leading, spacing: 15) {
            Text("EFFECTS")
                .font(.caption)
                .fontWeight(.bold)
                .foregroundColor(.white)
            
            VStack(spacing: 12) {
                // Delay controls
                EffectSection(title: "Delay") {
                    EffectSlider(label: "Time", value: $synthEngine.delayTime, range: 0.05...1.0) {
                        synthEngine.updateEffects()
                    }
                    EffectSlider(label: "Fbk", value: $synthEngine.delayFeedback, range: 0...0.9) {
                        synthEngine.updateEffects()
                    }
                    EffectSlider(label: "Mix", value: $synthEngine.delayMix, range: 0...1) {
                        synthEngine.updateEffects()
                    }
                }
                
                // Reverb
                EffectSlider(label: "Reverb", value: $synthEngine.reverbMix, range: 0...1) {
                    synthEngine.updateEffects()
                }
                
                // Distortion
                EffectSlider(label: "Saturation", value: $synthEngine.distortionAmount, range: 0...1) {
                    synthEngine.updateEffects()
                }
                
                // Filter
                EffectSection(title: "Filter") {
                    EffectSlider(label: "Cutoff", value: $synthEngine.filterCutoff, range: 100...20000, displayFormat: "%.0f") {
                        synthEngine.updateEffects()
                    }
                    EffectSlider(label: "Res", value: $synthEngine.filterResonance, range: 0...1) {
                        synthEngine.updateEffects()
                    }
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

struct EffectSection<Content: View>: View {
    let title: String
    @ViewBuilder let content: () -> Content
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title)
                .font(.caption2)
                .foregroundColor(.white.opacity(0.7))
            content()
        }
    }
}

struct EffectSlider: View {
    let label: String
    @Binding var value: Double
    let range: ClosedRange<Double>
    var displayFormat: String = "%.2f"
    let onChanged: () -> Void
    
    var body: some View {
        HStack(spacing: 8) {
            Text(label)
                .font(.caption2)
                .foregroundColor(.white)
                .frame(width: 45, alignment: .leading)
            
            Slider(value: $value, in: range) { _ in
                onChanged()
            }
            .accentColor(.blue)
            
            Text(String(format: displayFormat, value))
                .font(.caption2)
                .foregroundColor(.white)
                .frame(width: 40, alignment: .trailing)
        }
    }
}