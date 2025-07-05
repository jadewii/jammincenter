import SwiftUI
import AudioKit

@main
struct AuroraGridApp: App {
    @StateObject private var sequencerEngine = SequencerEngine()
    
    init() {
        configureAudioSession()
    }
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(sequencerEngine)
                .preferredColorScheme(.light)
                .supportedInterfaceOrientations(.landscape)
        }
    }
    
    private func configureAudioSession() {
        #if os(iOS)
        do {
            Settings.bufferLength = .short
            try Settings.setSession(
                category: .playback,
                with: [.mixWithOthers]
            )
        } catch {
            print("Could not set audio session: \(error)")
        }
        #endif
    }
}

extension View {
    func supportedInterfaceOrientations(_ orientations: UIInterfaceOrientationMask) -> some View {
        self
    }
}