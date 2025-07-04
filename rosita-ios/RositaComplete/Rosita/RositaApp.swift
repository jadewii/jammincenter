import SwiftUI
import AudioKit

@main
struct RositaApp: App {
    @StateObject private var audioEngine = AudioEngine()
    
    init() {
        // Keep screen on while app is active
        UIApplication.shared.isIdleTimerDisabled = true
        
        // TODO: Initialize StoreKit 2 subscription manager here
        // SubscriptionManager.shared.initialize()
    }
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(audioEngine)
                .preferredColorScheme(.dark)
                .statusBar(hidden: true)
        }
    }
}
