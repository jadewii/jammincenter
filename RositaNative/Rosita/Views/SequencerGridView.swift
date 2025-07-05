import SwiftUI

struct SequencerGridView: View {
    @EnvironmentObject var synthEngine: SynthEngine
    let noteLabels = ["C5", "B4", "A4", "G4", "F4", "E4", "D4", "C4"]
    let gridColors: [Color] = [.pink, .orange, .yellow, .green, .cyan, .blue, .purple, .red]
    
    var body: some View {
        VStack(spacing: 0) {
            // Step numbers
            HStack(spacing: 2) {
                Text("")
                    .frame(width: 40)
                
                ForEach(0..<16) { step in
                    Text("\(step + 1)")
                        .font(.caption2)
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                }
            }
            .padding(.bottom, 5)
            
            // Grid
            ForEach(0..<8) { row in
                HStack(spacing: 2) {
                    // Note label
                    Text(noteLabels[row])
                        .font(.caption)
                        .fontWeight(.bold)
                        .foregroundColor(.white)
                        .frame(width: 40)
                    
                    // Step buttons
                    ForEach(0..<16) { col in
                        SequencerCell(
                            isActive: synthEngine.pattern[row][col],
                            isPlaying: synthEngine.isPlaying && synthEngine.currentStep == col,
                            color: gridColors[row]
                        ) {
                            synthEngine.toggleCell(row: row, col: col)
                            UIImpactFeedbackGenerator(style: .light).impactOccurred()
                        }
                    }
                }
            }
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 15)
                .fill(Color.black.opacity(0.3))
        )
    }
}

struct SequencerCell: View {
    let isActive: Bool
    let isPlaying: Bool
    let color: Color
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            RoundedRectangle(cornerRadius: 4)
                .fill(isActive ? color : Color.white.opacity(0.2))
                .overlay(
                    RoundedRectangle(cornerRadius: 4)
                        .stroke(isPlaying ? Color.white : Color.clear, lineWidth: 2)
                )
                .scaleEffect(isPlaying ? 1.1 : 1.0)
                .animation(.easeInOut(duration: 0.1), value: isPlaying)
        }
        .frame(height: 30)
    }
}