import SwiftUI

struct PianoKeyboardView: View {
    @EnvironmentObject var synthEngine: SynthEngine
    @State private var touchedKeys: Set<Int> = []
    
    let whiteKeys = [0, 2, 4, 5, 7, 9, 11] // C, D, E, F, G, A, B
    let blackKeys = [1, 3, 6, 8, 10] // C#, D#, F#, G#, A#
    let blackKeyPositions = [0.5, 1.5, 3.5, 4.5, 5.5] // Positions relative to white keys
    
    var body: some View {
        GeometryReader { geometry in
            ZStack(alignment: .bottom) {
                // White keys
                HStack(spacing: 2) {
                    ForEach(0..<8) { index in
                        WhiteKey(
                            noteIndex: index,
                            isPressed: synthEngine.activeNotes.contains(index),
                            onPress: { synthEngine.playNote(index) },
                            onRelease: { synthEngine.stopNote(index) }
                        )
                    }
                }
                
                // Black keys
                HStack(spacing: 0) {
                    ForEach(0..<7) { position in
                        if shouldShowBlackKey(at: position) {
                            Spacer()
                                .frame(width: (geometry.size.width / 8) * 0.3)
                            
                            BlackKey(
                                noteIndex: getBlackKeyNote(at: position),
                                isPressed: false,
                                onPress: { },
                                onRelease: { }
                            )
                            .frame(width: (geometry.size.width / 8) * 0.6)
                            
                            if position < 6 {
                                Spacer()
                                    .frame(width: (geometry.size.width / 8) * (position == 1 || position == 4 ? 1.4 : 0.4))
                            }
                        }
                    }
                }
                .frame(height: 80)
                .offset(y: -40)
            }
        }
        .frame(height: 120)
        .background(
            RoundedRectangle(cornerRadius: 15)
                .fill(Color.black.opacity(0.3))
        )
    }
    
    func shouldShowBlackKey(at position: Int) -> Bool {
        return position != 2 && position != 6 // No black key between E-F and B-C
    }
    
    func getBlackKeyNote(at position: Int) -> Int {
        let mapping = [1, 3, 0, 6, 8, 10, 0] // Maps position to MIDI note offset
        return mapping[position]
    }
}

struct WhiteKey: View {
    let noteIndex: Int
    let isPressed: Bool
    let onPress: () -> Void
    let onRelease: () -> Void
    
    @State private var isTouched = false
    
    var body: some View {
        Rectangle()
            .fill(isTouched || isPressed ? Color.pink.opacity(0.8) : Color.white)
            .overlay(
                Rectangle()
                    .stroke(Color.gray.opacity(0.3), lineWidth: 1)
            )
            .cornerRadius(5, corners: [.bottomLeft, .bottomRight])
            .scaleEffect(isTouched || isPressed ? 0.95 : 1.0)
            .animation(.easeInOut(duration: 0.1), value: isTouched || isPressed)
            .onLongPressGesture(minimumDuration: 0, maximumDistance: .infinity) {
                
            } onPressingChanged: { pressing in
                isTouched = pressing
                if pressing {
                    onPress()
                } else {
                    onRelease()
                }
            }
    }
}

struct BlackKey: View {
    let noteIndex: Int
    let isPressed: Bool
    let onPress: () -> Void
    let onRelease: () -> Void
    
    @State private var isTouched = false
    
    var body: some View {
        Rectangle()
            .fill(isTouched || isPressed ? Color.gray : Color.black)
            .cornerRadius(3, corners: [.bottomLeft, .bottomRight])
            .scaleEffect(isTouched || isPressed ? 0.95 : 1.0)
            .animation(.easeInOut(duration: 0.1), value: isTouched || isPressed)
            .onLongPressGesture(minimumDuration: 0, maximumDistance: .infinity) {
                
            } onPressingChanged: { pressing in
                isTouched = pressing
                if pressing {
                    onPress()
                } else {
                    onRelease()
                }
            }
    }
}

// Helper for rounded corners
extension View {
    func cornerRadius(_ radius: CGFloat, corners: UIRectCorner) -> some View {
        clipShape(RoundedCorner(radius: radius, corners: corners))
    }
}

struct RoundedCorner: Shape {
    var radius: CGFloat = .infinity
    var corners: UIRectCorner = .allCorners
    
    func path(in rect: CGRect) -> Path {
        let path = UIBezierPath(
            roundedRect: rect,
            byRoundingCorners: corners,
            cornerRadii: CGSize(width: radius, height: radius)
        )
        return Path(path.cgPath)
    }
}