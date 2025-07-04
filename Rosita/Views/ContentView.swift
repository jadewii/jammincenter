//
//  ContentView.swift
//  Rosita
//
//  Main UI maintaining original Rosita design
//

import SwiftUI

struct ContentView: View {
    @EnvironmentObject var audioEngine: AudioEngine
    @State private var currentInstrument = 1
    @State private var isPlaying = false
    
    var body: some View {
        GeometryReader { geometry in
            ZStack {
                // Background - matching original pink gradient
                LinearGradient(
                    gradient: Gradient(colors: [
                        Color(red: 1.0, green: 0.71, blue: 0.76), // Light pink
                        Color(red: 0.9, green: 0.5, blue: 0.6)    // Darker pink
                    ]),
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
                .ignoresSafeArea()
                
                VStack(spacing: 0) {
                    // Top bar with Rosita logo
                    HStack {
                        Text("ROSITA")
                            .font(.system(size: 36, weight: .bold, design: .rounded))
                            .foregroundColor(.white)
                            .shadow(color: .pink, radius: 10)
                            .padding(.leading, 30)
                        
                        Spacer()
                        
                        // TODO: Add subscription status indicator here
                        // SubscriptionStatusView()
                    }
                    .frame(height: 60)
                    .background(Color.black.opacity(0.2))
                    
                    // Main control panel
                    HStack(spacing: 20) {
                        // Left side - Instrument & ADSR controls
                        VStack(spacing: 15) {
                            InstrumentSelectorView(currentInstrument: $currentInstrument)
                            ADSRControlsView()
                            
                            // TODO: Add preset selector for premium users
                            // if SubscriptionManager.shared.isPremium {
                            //     PresetSelectorView()
                            // }
                        }
                        .frame(width: geometry.size.width * 0.35)
                        .padding()
                        .background(Color.black.opacity(0.3))
                        .cornerRadius(20)
                        
                        // Right side - Sequencer grid
                        VStack(spacing: 10) {
                            SequencerControlsView(isPlaying: $isPlaying)
                            SequencerGridView()
                            
                            // Effects controls
                            EffectsControlsView()
                        }
                        .padding()
                        .background(Color.black.opacity(0.3))
                        .cornerRadius(20)
                    }
                    .padding(.horizontal, 20)
                    .frame(height: geometry.size.height * 0.55)
                    
                    Spacer()
                    
                    // Piano keyboard at bottom
                    PianoKeyboardView()
                        .frame(height: geometry.size.height * 0.25)
                        .background(Color.black.opacity(0.5))
                }
            }
        }
        .ignoresSafeArea(.keyboard)
    }
}