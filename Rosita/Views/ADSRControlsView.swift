//
//  ADSRControlsView.swift
//  Rosita
//
//  ADSR envelope controls
//

import SwiftUI

struct ADSRControlsView: View {
    @EnvironmentObject var audioEngine: AudioEngine
    @State private var currentInstrument = 1
    
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("ADSR ENVELOPE")
                .font(.system(size: 16, weight: .bold))
                .foregroundColor(.white)
            
            // Attack
            HStack {
                Text("A:")
                    .frame(width: 25)
                    .foregroundColor(.white)
                Slider(
                    value: Binding(
                        get: { audioEngine.attack[currentInstrument] ?? 0.1 },
                        set: { 
                            audioEngine.attack[currentInstrument] = $0
                            audioEngine.updateADSR(instrument: currentInstrument)
                        }
                    ),
                    in: 0.01...2.0
                )
                .accentColor(.pink)
            }
            
            // Decay
            HStack {
                Text("D:")
                    .frame(width: 25)
                    .foregroundColor(.white)
                Slider(
                    value: Binding(
                        get: { audioEngine.decay[currentInstrument] ?? 0.2 },
                        set: { 
                            audioEngine.decay[currentInstrument] = $0
                            audioEngine.updateADSR(instrument: currentInstrument)
                        }
                    ),
                    in: 0.01...2.0
                )
                .accentColor(.orange)
            }
            
            // Sustain
            HStack {
                Text("S:")
                    .frame(width: 25)
                    .foregroundColor(.white)
                Slider(
                    value: Binding(
                        get: { audioEngine.sustain[currentInstrument] ?? 0.5 },
                        set: { 
                            audioEngine.sustain[currentInstrument] = $0
                            audioEngine.updateADSR(instrument: currentInstrument)
                        }
                    ),
                    in: 0.0...1.0
                )
                .accentColor(.yellow)
            }
            
            // Release
            HStack {
                Text("R:")
                    .frame(width: 25)
                    .foregroundColor(.white)
                Slider(
                    value: Binding(
                        get: { audioEngine.release[currentInstrument] ?? 0.5 },
                        set: { 
                            audioEngine.release[currentInstrument] = $0
                            audioEngine.updateADSR(instrument: currentInstrument)
                        }
                    ),
                    in: 0.01...5.0
                )
                .accentColor(.green)
            }
            
            // TODO: Add preset save button for premium users
            // if SubscriptionManager.shared.isPremium {
            //     Button("Save Preset") {
            //         saveCurrentPreset()
            //     }
            //     .buttonStyle(NeonButtonStyle())
            // }
        }
        .padding()
        .onReceive(NotificationCenter.default.publisher(for: .notePlayedNotification)) { notification in
            if let instrument = notification.userInfo?["instrument"] as? Int {
                currentInstrument = instrument
            }
        }
    }
}