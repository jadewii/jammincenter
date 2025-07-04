//
//  InstrumentSelectorView.swift
//  Rosita
//
//  Instrument selector matching original design
//

import SwiftUI

struct InstrumentSelectorView: View {
    @Binding var currentInstrument: Int
    @EnvironmentObject var audioEngine: AudioEngine
    
    let instrumentColors: [Color] = [
        Color(red: 1.0, green: 0.71, blue: 0.76),     // Pink
        Color(red: 0.53, green: 0.81, blue: 0.92),    // Blue
        Color(red: 0.87, green: 0.63, blue: 0.87),    // Purple
        Color(red: 1.0, green: 0.84, blue: 0.0)       // Gold
    ]
    
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("INSTRUMENT")
                .font(.system(size: 16, weight: .bold))
                .foregroundColor(.white)
            
            HStack(spacing: 15) {
                ForEach(1...4, id: \.self) { instrument in
                    Button(action: {
                        currentInstrument = instrument
                        
                        // Play a test note when switching
                        let testFreq = 440.0 * pow(2.0, Double(instrument - 1) / 12.0)
                        audioEngine.playNote(instrument: instrument, frequency: testFreq, velocity: 0.5)
                        
                        UIImpactFeedbackGenerator(style: .medium).impactOccurred()
                    }) {
                        Text("\(instrument)")
                            .font(.system(size: 20, weight: .bold))
                            .frame(width: 50, height: 50)
                            .foregroundColor(currentInstrument == instrument ? .black : .white)
                            .background(
                                RoundedRectangle(cornerRadius: 10)
                                    .fill(currentInstrument == instrument ? 
                                          instrumentColors[instrument - 1] : 
                                          Color.gray.opacity(0.3))
                            )
                            .overlay(
                                RoundedRectangle(cornerRadius: 10)
                                    .stroke(instrumentColors[instrument - 1], lineWidth: 2)
                            )
                            .shadow(
                                color: currentInstrument == instrument ? 
                                       instrumentColors[instrument - 1] : .clear,
                                radius: 10
                            )
                    }
                }
            }
            
            // Octave controls
            HStack {
                Text("OCTAVE")
                    .font(.system(size: 12))
                    .foregroundColor(.white)
                
                HStack(spacing: 10) {
                    Button("-") {
                        // Decrease octave
                    }
                    .buttonStyle(SmallNeonButton())
                    
                    Button("+") {
                        // Increase octave
                    }
                    .buttonStyle(SmallNeonButton())
                }
            }
            
            // TODO: Add sound selector for premium users
            // if SubscriptionManager.shared.isPremium {
            //     SoundSelectorView(instrument: currentInstrument)
            // }
        }
        .padding()
    }
}

struct SmallNeonButton: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.system(size: 16, weight: .bold))
            .frame(width: 30, height: 30)
            .foregroundColor(.white)
            .background(
                RoundedRectangle(cornerRadius: 5)
                    .fill(Color.gray.opacity(configuration.isPressed ? 0.5 : 0.3))
            )
            .overlay(
                RoundedRectangle(cornerRadius: 5)
                    .stroke(Color.cyan, lineWidth: 1)
            )
            .scaleEffect(configuration.isPressed ? 0.95 : 1.0)
    }
}