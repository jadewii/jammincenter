import SwiftUI

struct ContentView: View {
    @State private var grid = Array(repeating: Array(repeating: false, count: 16), count: 6)
    @State private var isPlaying = false
    
    let trackNames = ["Kick", "Snare", "Hi-Hat", "Open Hat", "Crash", "Bass"]
    let trackColors = [Color.pink, Color.blue, Color.green, Color.yellow, Color.orange, Color.purple]
    
    var body: some View {
        ZStack {
            // Pretty gradient background
            LinearGradient(
                colors: [
                    Color(red: 0.96, green: 0.76, blue: 0.78),
                    Color(red: 0.82, green: 0.93, blue: 0.95),
                    Color(red: 0.89, green: 0.89, blue: 1.0)
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()
            
            VStack(spacing: 20) {
                // Title
                Text("🌸 Aurora Grid")
                    .font(.title)
                    .fontWeight(.bold)
                    .foregroundColor(Color(red: 0.91, green: 0.12, blue: 0.39))
                
                // Simple play button
                Button(action: {
                    isPlaying.toggle()
                }) {
                    Text(isPlaying ? "Stop" : "Play")
                        .foregroundColor(.white)
                        .font(.title2)
                        .frame(width: 100, height: 50)
                        .background(isPlaying ? Color.red : Color.green)
                        .cornerRadius(25)
                }
                
                // Grid
                VStack(spacing: 8) {
                    ForEach(0..<6) { track in
                        HStack(spacing: 4) {
                            // Track name
                            Text(trackNames[track])
                                .font(.caption)
                                .frame(width: 60)
                                .padding(.vertical, 4)
                                .background(trackColors[track].opacity(0.3))
                                .cornerRadius(4)
                            
                            // Steps
                            HStack(spacing: 2) {
                                ForEach(0..<16) { step in
                                    Button(action: {
                                        grid[track][step].toggle()
                                    }) {
                                        Text("\(step + 1)")
                                            .font(.caption2)
                                            .foregroundColor(grid[track][step] ? .white : .black)
                                            .frame(width: 24, height: 24)
                                            .background(grid[track][step] ? Color(red: 0.91, green: 0.12, blue: 0.39) : Color.white.opacity(0.7))
                                            .cornerRadius(4)
                                    }
                                }
                            }
                        }
                    }
                }
                .padding()
                .background(Color.white.opacity(0.9))
                .cornerRadius(15)
                
                Text("Tap the steps to activate them!")
                    .font(.caption)
                    .foregroundColor(.gray)
            }
            .padding()
        }
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