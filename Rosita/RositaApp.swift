//
//  RositaApp.swift
//  Rosita
//
//  Created for JAde Wii
//  Copyright © 2024. All rights reserved.
//

import SwiftUI

@main
struct RositaApp: App {
    @StateObject private var audioEngine = AudioEngine()
    
    init() {
        // Configure app for music production
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
                .onAppear {
                    audioEngine.start()
                }
                .onDisappear {
                    audioEngine.stop()
                }
        }
    }
}

// TODO: Add StoreKit 2 Scene for subscription management
// extension RositaApp {
//     var subscriptionScene: some Scene {
//         WindowGroup("Subscription", id: "subscription") {
//             SubscriptionView()
//         }
//     }
// }