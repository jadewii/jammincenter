import SwiftUI

struct EffectsControlsView: View {
    @EnvironmentObject var audioEngine: AudioEngine
    
    var body: some View {
        VStack(spacing: 20) {
            Text("EFFECTS")
                .font(.system(size: 16, weight: .bold))
                .foregroundColor(.white)
            
            HStack(spacing: 30) {
                EffectSlider(
                    value: $audioEngine.delayAmount,
                    label: "DLY",
                    color: .cyan
                )
                
                EffectSlider(
                    value: $audioEngine.reverbAmount,
                    label: "REV",
                    color: .purple
                )
                
                EffectSlider(
                    value: $audioEngine.saturationAmount,
                    label: "SAT",
                    color: .orange
                )
                
                EffectSlider(
                    value: $audioEngine.chorusAmount,
                    label: "CHO",
                    color: .green
                )
            }
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 15)
                .fill(Color.black.opacity(0.3))
        )
    }
}

struct EffectSlider: View {
    @Binding var value: Float
    let label: String
    let color: Color
    
    var body: some View {
        VStack(spacing: 10) {
            GeometryReader { geometry in
                ZStack(alignment: .bottom) {
                    // Background
                    RoundedRectangle(cornerRadius: 10)
                        .fill(Color.white.opacity(0.1))
                    
                    // Fill
                    RoundedRectangle(cornerRadius: 10)
                        .fill(
                            LinearGradient(
                                gradient: Gradient(colors: [color.opacity(0.3), color]),
                                startPoint: .bottom,
                                endPoint: .top
                            )
                        )
                        .frame(height: geometry.size.height * CGFloat(value))
                        .animation(.easeInOut(duration: 0.1), value: value)
                    
                    // Glow effect
                    RoundedRectangle(cornerRadius: 10)
                        .stroke(color, lineWidth: 2)
                        .blur(radius: 3)
                        .opacity(Double(value))
                }
                .gesture(
                    DragGesture()
                        .onChanged { value in
                            let newValue = Float(1 - value.location.y / geometry.size.height)
                            self.value = max(0, min(1, newValue))
                        }
                )
            }
            .frame(width: 40, height: 200)
            
            Text(label)
                .font(.system(size: 12, weight: .bold))
                .foregroundColor(color)
        }
    }
}
