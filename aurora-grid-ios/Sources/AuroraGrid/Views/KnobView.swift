import SwiftUI

struct KnobView: View {
    @Binding var value: Double
    let label: String
    let color: Color
    let onChange: (Double) -> Void
    
    @State private var isInteracting = false
    @State private var lastLocation: CGPoint = .zero
    
    var body: some View {
        VStack(spacing: 4) {
            ZStack {
                Circle()
                    .fill(Color.gray.opacity(0.1))
                    .frame(width: 44, height: 44)
                
                Circle()
                    .trim(from: 0, to: value)
                    .stroke(color, lineWidth: 3)
                    .frame(width: 40, height: 40)
                    .rotationEffect(.degrees(-90))
                
                Circle()
                    .fill(Color.white)
                    .frame(width: 28, height: 28)
                    .shadow(color: Color.black.opacity(0.1), radius: 2, x: 0, y: 1)
                    .overlay(
                        Circle()
                            .fill(color)
                            .frame(width: 8, height: 8)
                            .offset(y: -8)
                    )
                    .rotationEffect(.degrees(value * 270 - 135))
            }
            .scaleEffect(isInteracting ? 1.1 : 1.0)
            .animation(.easeInOut(duration: 0.1), value: isInteracting)
            .gesture(
                DragGesture()
                    .onChanged { gesture in
                        if !isInteracting {
                            isInteracting = true
                            lastLocation = gesture.location
                        }
                        
                        let delta = (lastLocation.y - gesture.location.y) / 100
                        let newValue = max(0, min(1, value + delta))
                        
                        if newValue != value {
                            value = newValue
                            onChange(newValue)
                            
                            let impact = UIImpactFeedbackGenerator(style: .light)
                            impact.impactOccurred()
                        }
                        
                        lastLocation = gesture.location
                    }
                    .onEnded { _ in
                        isInteracting = false
                    }
            )
            
            Text(label)
                .font(.system(size: 10, weight: .medium))
                .foregroundColor(.gray)
            
            Text("\(Int(value * 100))")
                .font(.system(size: 9, weight: .medium, design: .monospaced))
                .foregroundColor(.gray.opacity(0.7))
        }
    }
}