//
//  ContentView.swift
//  Rosita iOS Synth
//
//  Main UI layout
//

import SwiftUI

struct ContentView: View {
    @EnvironmentObject var audioEngine: AudioEngine
    @State private var isPlaying = false
    
    var body: some View {
        GeometryReader { geometry in
            ZStack {
                // Background gradient
                LinearGradient(
                    gradient: Gradient(colors: [
                        Color(red: 0.1, green: 0.0, blue: 0.2),
                        Color(red: 0.0, green: 0.0, blue: 0.1)
                    ]),
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
                .ignoresSafeArea()
                
                VStack(spacing: 0) {
                    // Top section with play button
                    HStack {
                        Spacer()
                        
                        // Play test tone button
                        Button(action: {
                            if isPlaying {
                                audioEngine.stopTestTone()
                            } else {
                                audioEngine.playTestTone()
                            }
                            isPlaying.toggle()
                        }) {
                            ZStack {
                                Circle()
                                    .fill(
                                        RadialGradient(
                                            gradient: Gradient(colors: [
                                                Color(red: 1.0, green: 0.0, blue: 0.5),
                                                Color(red: 0.5, green: 0.0, blue: 1.0)
                                            ]),
                                            center: .center,
                                            startRadius: 5,
                                            endRadius: 40
                                        )
                                    )
                                    .frame(width: 80, height: 80)
                                    .shadow(color: .pink, radius: isPlaying ? 20 : 10)
                                    .animation(.easeInOut(duration: 0.3), value: isPlaying)
                                
                                Image(systemName: isPlaying ? "stop.fill" : "play.fill")
                                    .font(.system(size: 30))
                                    .foregroundColor(.white)
                            }
                        }
                        .padding(.top, 50)
                        
                        Spacer()
                    }
                    
                    // Effects sliders
                    EffectsView()
                        .padding(.horizontal, 30)
                        .padding(.vertical, 20)
                    
                    Spacer()
                    
                    // Piano keyboard at bottom
                    KeyboardView()
                        .frame(height: geometry.size.height * 0.25)
                        .background(
                            LinearGradient(
                                gradient: Gradient(colors: [
                                    Color(red: 0.2, green: 0.0, blue: 0.3).opacity(0.8),
                                    Color.black.opacity(0.9)
                                ]),
                                startPoint: .top,
                                endPoint: .bottom
                            )
                        )
                }
            }
        }
        .ignoresSafeArea(.keyboard)
    }
}