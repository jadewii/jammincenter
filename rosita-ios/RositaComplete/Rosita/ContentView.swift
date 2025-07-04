import SwiftUI

struct ContentView: View {
    @EnvironmentObject var audioEngine: AudioEngine
    @State private var isPlaying = false
    
    var body: some View {
        GeometryReader { geometry in
            ZStack {
                // Pink gradient background
                LinearGradient(
                    gradient: Gradient(colors: [
                        Color(red: 1.0, green: 0.71, blue: 0.76),
                        Color(red: 0.9, green: 0.35, blue: 0.5)
                    ]),
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
                .ignoresSafeArea()
                
                VStack(spacing: 0) {
                    // Title
                    Text("ROSITA")
                        .font(.system(size: 36, weight: .bold, design: .rounded))
                        .foregroundColor(.white)
                        .shadow(color: .pink, radius: 10)
                        .padding(.top, 10)
                    
                    // Main content area
                    HStack(spacing: 20) {
                        // Left panel
                        VStack(spacing: 20) {
                            InstrumentSelectorView()
                            ADSRControlsView()
                            Spacer()
                        }
                        .frame(width: geometry.size.width * 0.2)
                        
                        // Center - Sequencer
                        VStack(spacing: 10) {
                            SequencerControlsView(isPlaying: $isPlaying)
                            SequencerGridView()
                        }
                        .frame(width: geometry.size.width * 0.5)
                        
                        // Right panel - Effects
                        EffectsControlsView()
                            .frame(width: geometry.size.width * 0.2)
                    }
                    .padding(.horizontal)
                    .frame(height: geometry.size.height * 0.6)
                    
                    // Piano keyboard at bottom
                    PianoKeyboardView()
                        .frame(height: geometry.size.height * 0.25)
                        .padding(.bottom, 20)
                }
            }
        }
        .onAppear {
            audioEngine.start()
        }
    }
}
