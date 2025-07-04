//
//  SequencerGridView.swift
//  Rosita
//
//  8x16 sequencer grid
//

import SwiftUI

struct SequencerGridView: View {
    @EnvironmentObject var audioEngine: AudioEngine
    @State private var currentInstrument = 1
    
    let rows = 8
    let columns = 16
    
    var body: some View {
        VStack(spacing: 2) {
            ForEach(0..<rows, id: \.self) { row in
                HStack(spacing: 2) {
                    ForEach(0..<columns, id: \.self) { column in
                        SequencerCell(
                            isActive: audioEngine.patterns[audioEngine.currentPattern][currentInstrument - 1][row][column],
                            isCurrentStep: audioEngine.currentStep == column && audioEngine.isPlaying,
                            instrument: currentInstrument,
                            row: row,
                            column: column,
                            onTap: {
                                audioEngine.toggleStep(instrument: currentInstrument, track: row, step: column)
                                UIImpactFeedbackGenerator(style: .light).impactOccurred()
                            }
                        )
                    }
                }
            }
        }
        .padding(10)
        .background(
            RoundedRectangle(cornerRadius: 10)
                .fill(instrumentBackgroundColor)
        )
        .onReceive(NotificationCenter.default.publisher(for: .notePlayedNotification)) { notification in
            if let instrument = notification.userInfo?["instrument"] as? Int {
                currentInstrument = instrument
            }
        }
    }
    
    private var instrumentBackgroundColor: Color {
        switch currentInstrument {
        case 1: return Color(red: 1.0, green: 0.71, blue: 0.76).opacity(0.3)    // Pink
        case 2: return Color(red: 0.53, green: 0.81, blue: 0.92).opacity(0.3)   // Blue
        case 3: return Color(red: 0.87, green: 0.63, blue: 0.87).opacity(0.3)   // Purple
        case 4: return Color(red: 1.0, green: 0.84, blue: 0.0).opacity(0.3)     // Gold
        default: return Color.gray.opacity(0.3)
        }
    }
}

struct SequencerCell: View {
    let isActive: Bool
    let isCurrentStep: Bool
    let instrument: Int
    let row: Int
    let column: Int
    let onTap: () -> Void
    
    private var cellColor: Color {
        if isCurrentStep {
            return .white
        }
        
        if isActive {
            switch instrument {
            case 1: return Color(red: 1.0, green: 0.71, blue: 0.76)    // Pink
            case 2: return Color(red: 0.53, green: 0.81, blue: 0.92)   // Blue
            case 3: return Color(red: 0.87, green: 0.63, blue: 0.87)   // Purple
            case 4: 
                // Different colors for drum tracks
                switch row {
                case 0: return .orange  // Kick
                case 1: return .blue    // Snare
                case 2: return .green   // Hi-hat
                case 3: return .purple  // Percussion
                default: return Color(red: 1.0, green: 0.84, blue: 0.0) // Gold
                }
            default: return .gray
            }
        }
        
        return Color.white.opacity(0.2)
    }
    
    var body: some View {
        RoundedRectangle(cornerRadius: 4)
            .fill(cellColor)
            .overlay(
                RoundedRectangle(cornerRadius: 4)
                    .stroke(column % 4 == 0 ? Color.white.opacity(0.5) : Color.white.opacity(0.2), lineWidth: 1)
            )
            .frame(width: 30, height: 25)
            .scaleEffect(isCurrentStep ? 1.1 : (isActive ? 0.95 : 1.0))
            .animation(.spring(response: 0.1), value: isActive)
            .animation(.easeOut(duration: 0.1), value: isCurrentStep)
            .onTapGesture {
                onTap()
            }
    }
}