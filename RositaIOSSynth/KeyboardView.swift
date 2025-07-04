//
//  KeyboardView.swift
//  Rosita iOS Synth
//
//  Piano keyboard component with touch handling
//

import SwiftUI

struct KeyboardView: View {
    @EnvironmentObject var audioEngine: AudioEngine
    
    let whiteKeyNotes = [60, 62, 64, 65, 67, 69, 71, 72, 74, 76, 77, 79, 81, 83] // C4 to B5
    let blackKeyPositions = [1, 2, 4, 5, 6, 8, 9, 11, 12, 13] // Positions where black keys appear
    let blackKeyNotes = [61, 63, 66, 68, 70, 73, 75, 78, 80, 82] // C#4 to A#5
    
    @State private var activeKeys = Set<Int>()
    
    var body: some View {
        GeometryReader { geometry in
            ZStack {
                // White keys
                HStack(spacing: 2) {
                    ForEach(0..<whiteKeyNotes.count, id: \.self) { index in
                        WhiteKey(
                            note: whiteKeyNotes[index],
                            isActive: activeKeys.contains(whiteKeyNotes[index]),
                            width: (geometry.size.width - CGFloat(whiteKeyNotes.count + 1) * 2) / CGFloat(whiteKeyNotes.count),
                            height: geometry.size.height,
                            onNoteOn: { noteOn($0) },
                            onNoteOff: { noteOff($0) }
                        )
                    }
                }
                .padding(.horizontal, 2)
                
                // Black keys
                HStack(spacing: 0) {
                    ForEach(0..<blackKeyPositions.count, id: \.self) { index in
                        if index < blackKeyNotes.count {
                            BlackKey(
                                note: blackKeyNotes[index],
                                isActive: activeKeys.contains(blackKeyNotes[index]),
                                width: (geometry.size.width - CGFloat(whiteKeyNotes.count + 1) * 2) / CGFloat(whiteKeyNotes.count) * 0.7,
                                height: geometry.size.height * 0.6,
                                position: blackKeyPositions[index],
                                totalWhiteKeys: whiteKeyNotes.count,
                                containerWidth: geometry.size.width,
                                onNoteOn: { noteOn($0) },
                                onNoteOff: { noteOff($0) }
                            )
                        }
                    }
                }
            }
        }
    }
    
    private func noteOn(_ note: Int) {
        activeKeys.insert(note)
        audioEngine.noteOn(pitch: note)
        
        // Haptic feedback
        UIImpactFeedbackGenerator(style: .light).impactOccurred()
    }
    
    private func noteOff(_ note: Int) {
        activeKeys.remove(note)
        audioEngine.noteOff()
    }
}

struct WhiteKey: View {
    let note: Int
    let isActive: Bool
    let width: CGFloat
    let height: CGFloat
    let onNoteOn: (Int) -> Void
    let onNoteOff: (Int) -> Void
    
    var body: some View {
        RoundedRectangle(cornerRadius: width * 0.1)
            .fill(
                isActive ?
                LinearGradient(
                    gradient: Gradient(colors: [.pink, .purple]),
                    startPoint: .top,
                    endPoint: .bottom
                ) :
                LinearGradient(
                    gradient: Gradient(colors: [.white, Color(white: 0.9)]),
                    startPoint: .top,
                    endPoint: .bottom
                )
            )
            .overlay(
                RoundedRectangle(cornerRadius: width * 0.1)
                    .stroke(Color.black.opacity(0.3), lineWidth: 1)
            )
            .shadow(color: isActive ? .pink : .black.opacity(0.2), radius: isActive ? 10 : 2)
            .frame(width: width, height: height)
            .scaleEffect(isActive ? 0.95 : 1.0)
            .animation(.spring(response: 0.1), value: isActive)
            .onTapGesture {
                // Handle as a quick tap
                onNoteOn(note)
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                    onNoteOff(note)
                }
            }
            .gesture(
                DragGesture(minimumDistance: 0)
                    .onChanged { _ in
                        if !isActive {
                            onNoteOn(note)
                        }
                    }
                    .onEnded { _ in
                        onNoteOff(note)
                    }
            )
    }
}

struct BlackKey: View {
    let note: Int
    let isActive: Bool
    let width: CGFloat
    let height: CGFloat
    let position: Int
    let totalWhiteKeys: Int
    let containerWidth: CGFloat
    let onNoteOn: (Int) -> Void
    let onNoteOff: (Int) -> Void
    
    private var xOffset: CGFloat {
        let whiteKeyWidth = (containerWidth - CGFloat(totalWhiteKeys + 1) * 2) / CGFloat(totalWhiteKeys)
        let baseOffset = CGFloat(position) * whiteKeyWidth - width / 2
        return baseOffset
    }
    
    var body: some View {
        RoundedRectangle(cornerRadius: width * 0.15)
            .fill(
                isActive ?
                LinearGradient(
                    gradient: Gradient(colors: [.cyan, .blue]),
                    startPoint: .top,
                    endPoint: .bottom
                ) :
                LinearGradient(
                    gradient: Gradient(colors: [.black, Color(white: 0.2)]),
                    startPoint: .top,
                    endPoint: .bottom
                )
            )
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
                // Handle as a quick tap
                onNoteOn(note)
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                    onNoteOff(note)
                }
            }
            .gesture(
                DragGesture(minimumDistance: 0)
                    .onChanged { _ in
                        if !isActive {
                            onNoteOn(note)
                        }
                    }
                    .onEnded { _ in
                        onNoteOff(note)
                    }
            )
    }
}