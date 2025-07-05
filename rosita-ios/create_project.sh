#!/bin/bash

# This script creates a working iOS project
echo "Creating Rosita iOS project..."

# Create the basic structure
mkdir -p RositaApp

cat > RositaApp/ContentView.swift << 'EOF'
import SwiftUI
import AVFoundation

struct ContentView: View {
    @StateObject private var audioEngine = SimpleAudioEngine()
    
    var body: some View {
        ZStack {
            LinearGradient(colors: [.pink.opacity(0.3), .purple.opacity(0.3)], 
                          startPoint: .topLeading, 
                          endPoint: .bottomTrailing)
                .ignoresSafeArea()
            
            VStack(spacing: 20) {
                Text("Rosita")
                    .font(.largeTitle)
                    .bold()
                
                // Simple buttons to make sounds
                HStack(spacing: 20) {
                    ForEach(0..<4) { note in
                        Button(action: {
                            audioEngine.playNote(note)
                        }) {
                            Text("Note \(note + 1)")
                                .foregroundColor(.white)
                                .frame(width: 80, height: 80)
                                .background(Color.pink)
                                .cornerRadius(10)
                        }
                    }
                }
            }
        }
    }
}

class SimpleAudioEngine: ObservableObject {
    private var audioPlayers: [AVAudioPlayer] = []
    
    init() {
        // Create simple tone generators
        do {
            try AVAudioSession.sharedInstance().setCategory(.playback)
            try AVAudioSession.sharedInstance().setActive(true)
        } catch {
            print("Audio session error: \(error)")
        }
    }
    
    func playNote(_ index: Int) {
        // For now, just play system sounds
        let systemSoundID: SystemSoundID = SystemSoundID(1000 + index)
        AudioServicesPlaySystemSound(systemSoundID)
    }
}

@main
struct RositaApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}
EOF

echo "Done! Now:"
echo "1. Open Xcode"
echo "2. Create new iOS App project called 'Rosita'"
echo "3. Replace ContentView.swift with the one created here"
echo "4. Run it!"