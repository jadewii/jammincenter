//
//  EffectsView.swift
//  Rosita iOS Synth
//
//  Vertical sliders for live audio effects control
//

import SwiftUI

struct EffectsView: View {
    @EnvironmentObject var audioEngine: AudioEngine
    
    var body: some View {
        VStack(spacing: 20) {
            Text("EFFECTS")
                .font(.system(size: 24, weight: .bold, design: .rounded))
                .foregroundColor(.white)
                .shadow(color: .cyan, radius: 10)
            
            HStack(spacing: 30) {
                // Delay slider
                EffectSlider(
                    value: $audioEngine.delayMix,
                    label: "DELAY",
                    color: .pink
                )
                
                // Reverb slider
                EffectSlider(
                    value: $audioEngine.reverbMix,
                    label: "REVERB",
                    color: .blue
                )
                
                // Saturation slider
                EffectSlider(
                    value: $audioEngine.distortionAmount,
                    label: "SATURATION",
                    color: .orange
                )
                
                // Chorus slider
                EffectSlider(
                    value: $audioEngine.chorusDepth,
                    label: "CHORUS",
                    color: .purple
                )
            }
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 20)
                .fill(Color.black.opacity(0.3))
                .overlay(
                    RoundedRectangle(cornerRadius: 20)
                        .stroke(
                            LinearGradient(
                                gradient: Gradient(colors: [.cyan, .purple]),
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            ),
                            lineWidth: 2
                        )
                )
        )
    }
}

struct EffectSlider: View {
    @Binding var value: Float
    let label: String
    let color: Color
    
    var body: some View {
        VStack(spacing: 10) {
            // Custom vertical slider
            GeometryReader { geometry in
                ZStack(alignment: .bottom) {
                    // Track
                    RoundedRectangle(cornerRadius: 10)
                        .fill(Color.gray.opacity(0.3))
                        .frame(width: 60)
                    
                    // Fill
                    RoundedRectangle(cornerRadius: 10)
                        .fill(
                            LinearGradient(
                                gradient: Gradient(colors: [color, color.opacity(0.5)]),
                                startPoint: .bottom,
                                endPoint: .top
                            )
                        )
                        .frame(width: 60, height: geometry.size.height * CGFloat(value))
                        .animation(.spring(response: 0.3), value: value)
                    
                    // Glow effect
                    RoundedRectangle(cornerRadius: 10)
                        .fill(color)
                        .frame(width: 60, height: geometry.size.height * CGFloat(value))
                        .blur(radius: 20)
                        .opacity(0.5)
                }
                .frame(width: 60)
                .gesture(
                    DragGesture()
                        .onChanged { gesture in
                            let newValue = 1.0 - Float(gesture.location.y / geometry.size.height)
                            value = max(0, min(1, newValue))
                        }
                )
                .onTapGesture { location in
                    let newValue = 1.0 - Float(location.y / geometry.size.height)
                    value = max(0, min(1, newValue))
                }
            }
            .frame(width: 60, height: 200)
            
            // Label
            Text(label)
                .font(.system(size: 12, weight: .bold, design: .rounded))
                .foregroundColor(.white)
                .shadow(color: color, radius: 5)
            
            // Value display
            Text(String(format: "%.0f%%", value * 100))
                .font(.system(size: 10, weight: .medium, design: .monospaced))
                .foregroundColor(color)
        }
    }
}