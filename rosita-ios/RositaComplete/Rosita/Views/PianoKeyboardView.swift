import SwiftUI

struct PianoKeyboardView: View {
    @EnvironmentObject var audioEngine: AudioEngine
    @State private var activeKeys: Set<Int> = []
    
    let whiteKeyNotes = [60, 62, 64, 65, 67, 69, 71, 72, 74, 76, 77, 79, 81, 83, 84, 86, 88, 89, 91, 93, 95, 96]
    let blackKeyNotes = [61, 63, 0, 66, 68, 70, 0, 73, 75, 0, 78, 80, 82, 0, 85, 87, 0, 90, 92, 94]
    
    var body: some View {
        GeometryReader { geometry in
            ZStack(alignment: .topLeading) {
                // White keys
                HStack(spacing: 2) {
                    ForEach(0..<whiteKeyNotes.count, id: \.self) { index in
                        WhiteKey(
                            note: whiteKeyNotes[index],
                            isActive: activeKeys.contains(whiteKeyNotes[index]),
                            color: audioEngine.instrumentColors[audioEngine.currentInstrument],
                            playNote: { note in
                                playNote(note)
                            },
                            stopNote: {
                                stopNote()
                            }
                        )
                    }
                }
                
                // Black keys
                HStack(spacing: 2) {
                    ForEach(0..<blackKeyNotes.count, id: \.self) { index in
                        if blackKeyNotes[index] != 0 {
                            BlackKey(
                                note: blackKeyNotes[index],
                                isActive: activeKeys.contains(blackKeyNotes[index]),
                                color: audioEngine.instrumentColors[audioEngine.currentInstrument],
                                playNote: { note in
                                    playNote(note)
                                },
                                stopNote: {
                                    stopNote()
                                }
                            )
                            .offset(x: CGFloat(index) * (geometry.size.width / CGFloat(whiteKeyNotes.count)) - 
                                   CGFloat(index) * 2)
                        } else {
                            Color.clear
                                .frame(width: 0)
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
    
    private func playNote(_ note: Int) {
        activeKeys.insert(note)
        let frequency = Float(note).midiNoteToFrequency()
        audioEngine.playNote(pitch: frequency)
        UIImpactFeedbackGenerator(style: .light).impactOccurred()
    }
    
    private func stopNote() {
        activeKeys.removeAll()
        audioEngine.stopNote()
    }
}

struct WhiteKey: View {
    let note: Int
    let isActive: Bool
    let color: Color
    let playNote: (Int) -> Void
    let stopNote: () -> Void
    
    var body: some View {
        RoundedRectangle(cornerRadius: 0)
            .fill(isActive ? color : Color.white)
            .overlay(
                RoundedRectangle(cornerRadius: 0)
                    .stroke(Color.gray, lineWidth: 1)
            )
            .shadow(color: isActive ? color : .clear, radius: 10)
            .onTapGesture {
                // For tap, play and immediately stop
                playNote(note)
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
                    stopNote()
                }
            }
    }
}

struct BlackKey: View {
    let note: Int
    let isActive: Bool
    let color: Color
    let playNote: (Int) -> Void
    let stopNote: () -> Void
    
    var body: some View {
        RoundedRectangle(cornerRadius: 0)
            .fill(isActive ? color : Color.black)
            .frame(width: 25, height: 80)
            .overlay(
                RoundedRectangle(cornerRadius: 0)
                    .stroke(Color.gray, lineWidth: 1)
            )
            .shadow(color: isActive ? color : .clear, radius: 10)
            .onTapGesture {
                playNote(note)
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
                    stopNote()
                }
            }
    }
}
