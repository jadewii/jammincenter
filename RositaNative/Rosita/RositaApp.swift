import SwiftUI
import AVFoundation

@main
struct RositaApp: App {
    init() {
        // Configure audio session for low latency
        do {
            let session = AVAudioSession.sharedInstance()
            try session.setCategory(.playAndRecord, 
                                   mode: .default, 
                                   options: [.defaultToSpeaker, .mixWithOthers])
            try session.setPreferredIOBufferDuration(0.005) // 5ms latency
            try session.setActive(true)
        } catch {
            print("Audio Session error: \(error)")
        }
    }
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .preferredColorScheme(.dark)
                .statusBar(hidden: true)
        }
    }
}