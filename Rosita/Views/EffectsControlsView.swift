//
//  EffectsControlsView.swift
//  Rosita
//
//  Effects sliders with neon styling
//

import SwiftUI

struct EffectsControlsView: View {
    @EnvironmentObject var audioEngine: AudioEngine
    
    var body: some View {
        VStack(spacing: 15) {
            Text("EFFECTS")
                .font(.system(size: 20, weight: .bold))
                .foregroundColor(.white)
                .shadow(color: .cyan, radius: 10)
            
            HStack(spacing: 30) {
                // Delay
                VStack {
                    Text("DELAY")
                        .font(.system(size: 12, weight: .bold))
                        .foregroundColor(.pink)
                    
                    VerticalSlider(
                        value: $audioEngine.delayMix,
                        color: .pink,
                        height: 120
                    )
                    .onChange(of: audioEngine.delayMix) { _ in
                        audioEngine.updateEffects()
                    }
                    
                    Text("\(Int(audioEngine.delayMix * 100))%")
                        .font(.system(size: 10, design: .monospaced))
                        .foregroundColor(.pink)
                }
                
                // Reverb
                VStack {
                    Text("REVERB")
                        .font(.system(size: 12, weight: .bold))
                        .foregroundColor(.blue)
                    
                    VerticalSlider(
                        value: $audioEngine.reverbAmount,
                        color: .blue,
                        height: 120
                    )
                    .onChange(of: audioEngine.reverbAmount) { _ in
                        audioEngine.updateEffects()
                    }
                    
                    Text("\(Int(audioEngine.reverbAmount * 100))%")
                        .font(.system(size: 10, design: .monospaced))
                        .foregroundColor(.blue)
                }
                
                // Saturation
                VStack {
                    Text("SATURATION")
                        .font(.system(size: 12, weight: .bold))
                        .foregroundColor(.orange)
                    
                    VerticalSlider(
                        value: $audioEngine.distortionAmount,
                        color: .orange,
                        height: 120
                    )
                    .onChange(of: audioEngine.distortionAmount) { _ in
                        audioEngine.updateEffects()
                    }
                    
                    Text("\(Int(audioEngine.distortionAmount * 100))%")
                        .font(.system(size: 10, design: .monospaced))
                        .foregroundColor(.orange)
                }
                
                // Chorus
                VStack {
                    Text("CHORUS")
                        .font(.system(size: 12, weight: .bold))
                        .foregroundColor(.purple)
                    
                    VerticalSlider(
                        value: $audioEngine.chorusDepth,
                        color: .purple,
                        height: 120
                    )
                    .onChange(of: audioEngine.chorusDepth) { _ in
                        audioEngine.updateEffects()
                    }
                    
                    Text("\(Int(audioEngine.chorusDepth * 100))%")
                        .font(.system(size: 10, design: .monospaced))
                        .foregroundColor(.purple)
                }
                
                // TODO: Add more effects for premium users
                // if SubscriptionManager.shared.isPremium {
                //     PremiumEffectsView()
                // }
            }
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 20)
                .fill(Color.black.opacity(0.5))
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

struct VerticalSlider: View {
    @Binding var value: Double
    let color: Color
    let height: CGFloat
    
    var body: some View {
        GeometryReader { geometry in
            ZStack(alignment: .bottom) {
                // Track
                RoundedRectangle(cornerRadius: 10)
                    .fill(Color.gray.opacity(0.3))
                    .frame(width: 40)
                
                // Fill
                RoundedRectangle(cornerRadius: 10)
                    .fill(
                        LinearGradient(
                            gradient: Gradient(colors: [color, color.opacity(0.5)]),
                            startPoint: .bottom,
                            endPoint: .top
                        )
                    )
                    .frame(width: 40, height: geometry.size.height * CGFloat(value))
                
                // Glow effect
                RoundedRectangle(cornerRadius: 10)
                    .fill(color)
                    .frame(width: 40, height: geometry.size.height * CGFloat(value))
                    .blur(radius: 10)
                    .opacity(0.5)
            }
            .frame(width: 40)
            .gesture(
                DragGesture()
                    .onChanged { gesture in
                        let newValue = 1.0 - Double(gesture.location.y / geometry.size.height)
                        value = max(0, min(1, newValue))
                    }
            )
            .onTapGesture { location in
                let newValue = 1.0 - Double(location.y / geometry.size.height)
                value = max(0, min(1, newValue))
            }
        }
        .frame(width: 40, height: height)
    }
}