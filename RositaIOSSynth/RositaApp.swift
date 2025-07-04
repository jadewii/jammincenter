//
//  RositaApp.swift
//  Rosita iOS Synth
//
//  Entry point for the Rosita synthesizer app
//

import SwiftUI

@main
struct RositaApp: App {
    @StateObject private var audioEngine = AudioEngine()
    
    init() {
        // Configure app appearance
        UIApplication.shared.isIdleTimerDisabled = true // Keep screen on
    }
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(audioEngine)
                .preferredColorScheme(.dark)
                .statusBar(hidden: true)
                .onAppear {
                    audioEngine.start()
                }
                .onDisappear {
                    audioEngine.stop()
                }
        }
    }
}