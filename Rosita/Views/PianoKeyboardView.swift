//
//  PianoKeyboardView.swift
//  Rosita
//
//  Piano keyboard matching original Rosita design
//

import SwiftUI

struct PianoKeyboardView: View {
    @EnvironmentObject var audioEngine: AudioEngine
    @State private var activeKeys = Set<Int>()
    @State private var currentInstrument = 1
    
    let whiteKeyNotes = [
        (note: "C", midi: 60), (note: "D", midi: 62), (note: "E", midi: 64),
        (note: "F", midi: 65), (note: "G", midi: 67), (note: "A", midi: 69),
        (note: "B", midi: 71), (note: "C", midi: 72), (note: "D", midi: 74),
        (note: "E", midi: 76), (note: "F", midi: 77), (note: "G", midi: 79),
        (note: "A", midi: 81), (note: "B", midi: 83)
    ]
    
    let blackKeyPositions = [
        (position: 0.5, midi: 61), (position: 1.5, midi: 63),
        (position: 3.5, midi: 66), (position: 4.5, midi: 68), (position: 5.5, midi: 70),
        (position: 7.5, midi: 73), (position: 8.5, midi: 75),
        (position: 10.5, midi: 78), (position: 11.5, midi: 80), (position: 12.5, midi: 82)
    ]
    
    var body: some View {
        GeometryReader { geometry in
            ZStack {
                // Background
                LinearGradient(
                    gradient: Gradient(colors: [
                        Color.black.opacity(0.8),
                        Color(red: 0.2, green: 0.0, blue: 0.3).opacity(0.8)
                    ]),
                    startPoint: .top,
                    endPoint: .bottom
                )
                
                // White keys
                HStack(spacing: 2) {
                    ForEach(Array(whiteKeyNotes.enumerated()), id: \.offset) { index, noteInfo in
                        WhiteKeyView(
                            note: noteInfo.note,
                            midiNote: noteInfo.midi,
                            isActive: activeKeys.contains(noteInfo.midi),
                            currentInstrument: currentInstrument,
                            width: (geometry.size.width - CGFloat(whiteKeyNotes.count + 1) * 2) / CGFloat(whiteKeyNotes.count),
                            height: geometry.size.height * 0.9,
                            onPress: { midi in
                                playNote(midi)
                            },
                            onRelease: { midi in
                                stopNote(midi)
                            }
                        )
                    }
                }
                .padding(.horizontal, 5)
                
                // Black keys
                HStack(spacing: 0) {
                    ForEach(blackKeyPositions, id: \.midi) { keyInfo in
                        BlackKeyView(
                            midiNote: keyInfo.midi,
                            isActive: activeKeys.contains(keyInfo.midi),
                            position: keyInfo.position,
                            totalWhiteKeys: whiteKeyNotes.count,
                            width: (geometry.size.width - CGFloat(whiteKeyNotes.count + 1) * 2) / CGFloat(whiteKeyNotes.count) * 0.6,
                            height: geometry.size.height * 0.55,
                            containerWidth: geometry.size.width,
                            onPress: { midi in
                                playNote(midi)
                            },
                            onRelease: { midi in
                                stopNote(midi)
                            }
                        )
                    }
                }
            }
        }
        .onReceive(NotificationCenter.default.publisher(for: .notePlayedNotification)) { notification in
            if let instrument = notification.userInfo?["instrument"] as? Int {
                currentInstrument = instrument
            }
        }
    }
    
    private func playNote(_ midiNote: Int) {
        activeKeys.insert(midiNote)
        let frequency = 440.0 * pow(2.0, Double(midiNote - 69) / 12.0)
        audioEngine.playNote(instrument: currentInstrument, frequency: frequency)
        
        // Haptic feedback
        UIImpactFeedbackGenerator(style: .light).impactOccurred()
    }
    
    private func stopNote(_ midiNote: Int) {
        activeKeys.remove(midiNote)
        audioEngine.stopNote(instrument: currentInstrument)
    }
}

struct WhiteKeyView: View {
    let note: String
    let midiNote: Int
    let isActive: Bool
    let currentInstrument: Int
    let width: CGFloat
    let height: CGFloat
    let onPress: (Int) -> Void
    let onRelease: (Int) -> Void
    
    private var keyColor: Color {
        if isActive {
            switch currentInstrument {
            case 1: return Color(red: 1.0, green: 0.71, blue: 0.76) // Pink
            case 2: return Color(red: 0.53, green: 0.81, blue: 0.92) // Blue
            case 3: return Color(red: 0.87, green: 0.63, blue: 0.87) // Purple
            case 4: return Color(red: 1.0, green: 0.84, blue: 0.0) // Gold
            default: return .white
            }
        }
        return .white
    }
    
    var body: some View {
        RoundedRectangle(cornerRadius: width * 0.1)
            .fill(keyColor)
            .overlay(
                RoundedRectangle(cornerRadius: width * 0.1)
                    .stroke(Color.black.opacity(0.3), lineWidth: 1)
            )
            .overlay(
                Text(note)
                    .font(.system(size: 10, weight: .medium))
                    .foregroundColor(.black.opacity(0.5))
                    .offset(y: height * 0.35)
            )
            .shadow(color: isActive ? keyColor : .black.opacity(0.2), radius: isActive ? 10 : 2)
            .frame(width: width, height: height)
            .scaleEffect(isActive ? 0.95 : 1.0)
            .animation(.spring(response: 0.1), value: isActive)
            .onTapGesture {
                onPress(midiNote)
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                    onRelease(midiNote)
                }
            }
            .gesture(
                DragGesture(minimumDistance: 0)
                    .onChanged { _ in
                        if !isActive {
                            onPress(midiNote)
                        }
                    }
                    .onEnded { _ in
                        onRelease(midiNote)
                    }
            )
    }
}

struct BlackKeyView: View {
    let midiNote: Int
    let isActive: Bool
    let position: Double
    let totalWhiteKeys: Int
    let width: CGFloat
    let height: CGFloat
    let containerWidth: CGFloat
    let onPress: (Int) -> Void
    let onRelease: (Int) -> Void
    
    private var xOffset: CGFloat {
        let whiteKeyWidth = (containerWidth - CGFloat(totalWhiteKeys + 1) * 2) / CGFloat(totalWhiteKeys)
        return CGFloat(position) * whiteKeyWidth + 5 - width / 2
    }
    
    var body: some View {
        RoundedRectangle(cornerRadius: width * 0.15)
            .fill(isActive ? Color(red: 0.0, green: 1.0, blue: 1.0) : Color.black)
            .overlay(
                RoundedRectangle(cornerRadius: width * 0.15)
                    .stroke(Color.white.opacity(0.1), lineWidth: 1)
            )
            .shadow(color: isActive ? .cyan : .black, radius: isActive ? 8 : 4)
            .frame(width: width, height: height)
            .offset(x: xOffset, y: 0)
            .scaleEffect(isActive ? 0.9 : 1.0)
            .animation(.spring(response: 0.1), value: isActive)
            .onTapGesture {
                onPress(midiNote)
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                    onRelease(midiNote)
                }
            }
            .gesture(
                DragGesture(minimumDistance: 0)
                    .onChanged { _ in
                        if !isActive {
                            onPress(midiNote)
                        }
                    }
                    .onEnded { _ in
                        onRelease(midiNote)
                    }
            )
    }
}