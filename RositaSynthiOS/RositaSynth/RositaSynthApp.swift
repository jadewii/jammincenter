import SwiftUI

@main
struct RositaSynthApp: App {
    @StateObject private var audioEngine = AudioEngine()
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(audioEngine)
                .preferredColorScheme(.dark)
                .statusBar(hidden: true)
        }
    }
}