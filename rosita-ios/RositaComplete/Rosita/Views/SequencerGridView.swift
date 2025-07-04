import SwiftUI

struct SequencerGridView: View {
    @EnvironmentObject var audioEngine: AudioEngine
    let rows = 4
    let columns = 16
    
    var body: some View {
        VStack(spacing: 5) {
            ForEach(0..<rows, id: \.self) { row in
                HStack(spacing: 5) {
                    ForEach(0..<columns, id: \.self) { column in
                        SequencerCell(
                            isActive: audioEngine.sequencerData[row][column],
                            color: audioEngine.instrumentColors[row],
                            action: {
                                audioEngine.sequencerData[row][column].toggle()
                                UIImpactFeedbackGenerator(style: .light).impactOccurred()
                            }
                        )
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
    let color: Color
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            RoundedRectangle(cornerRadius: 4)
                .fill(isActive ? color : Color.white.opacity(0.2))
                .overlay(
                    RoundedRectangle(cornerRadius: 4)
                        .stroke(color.opacity(0.5), lineWidth: 1)
                )
                .frame(width: 30, height: 30)
                .shadow(color: isActive ? color : .clear, radius: 5)
        }
    }
}
