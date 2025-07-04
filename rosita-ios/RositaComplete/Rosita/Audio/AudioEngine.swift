import Foundation
import AudioKit
import AVFoundation

class AudioEngine: ObservableObject {
    // Audio engine
    private let engine = AudioKit.AudioEngine()
    
    // Instruments
    private var oscillators: [Oscillator] = []
    private var envelopes: [AmplitudeEnvelope] = []
    
    // Effects
    private var delays: [Delay] = []
    private var reverbs: [Reverb] = []
    private var distortions: [Distortion] = []
    private var choruses: [Chorus] = []
    
    // Mixer
    private let mainMixer = Mixer()
    
    // Published properties
    @Published var currentInstrument = 0
    @Published var attack: Float = 0.01
    @Published var decay: Float = 0.1
    @Published var sustain: Float = 0.8
    @Published var release: Float = 0.5
    @Published var tempo: Double = 120.0
    @Published var currentPattern = 0
    
    // Effects parameters
    @Published var delayAmount: Float = 0.0
    @Published var reverbAmount: Float = 0.0
    @Published var saturationAmount: Float = 0.0
    @Published var chorusAmount: Float = 0.0
    
    // Sequencer
    private var sequencerTimer: Timer?
    private var currentStep = 0
    @Published var sequencerData: [[Bool]] = Array(repeating: Array(repeating: false, count: 16), count: 4)
    
    // Instrument colors
    let instrumentColors: [Color] = [
        Color(red: 1.0, green: 0.71, blue: 0.76), // Pink
        Color(red: 0.54, green: 0.81, blue: 0.94), // Blue  
        Color(red: 0.87, green: 0.63, blue: 0.87), // Purple
        Color(red: 1.0, green: 0.84, blue: 0.0)    // Gold
    ]
    
    init() {
        setupAudio()
    }
    
    private func setupAudio() {
        // Create 4 instruments
        for i in 0..<4 {
            let oscillator = Oscillator()
            oscillator.amplitude = 0
            
            if i == 0 {
                oscillator.waveform = .sawtooth
            } else if i == 1 {
                oscillator.waveform = .square
            } else if i == 2 {
                oscillator.waveform = .sine
            } else {
                oscillator.waveform = .triangle
            }
            
            let envelope = AmplitudeEnvelope(oscillator)
            envelope.attackDuration = 0.01
            envelope.decayDuration = 0.1
            envelope.sustainLevel = 0.8
            envelope.releaseDuration = 0.5
            
            // Effects chain
            let delay = Delay(envelope)
            delay.time = 0.375
            delay.feedback = 0.5
            delay.dryWetMix = 0.0
            
            let reverb = Reverb(delay)
            reverb.dryWetMix = 0.0
            
            let distortion = Distortion(reverb)
            distortion.decimation = 0.5
            distortion.rounding = 0.0
            distortion.inputGain = 1.0
            
            let chorus = Chorus(distortion)
            chorus.frequency = 1.0
            chorus.depth = 0.0
            chorus.feedback = 0.0
            chorus.dryWetMix = 0.0
            
            oscillators.append(oscillator)
            envelopes.append(envelope)
            delays.append(delay)
            reverbs.append(reverb)
            distortions.append(distortion)
            choruses.append(chorus)
            
            mainMixer.addInput(chorus)
        }
        
        engine.output = mainMixer
    }
    
    func start() {
        do {
            try engine.start()
        } catch {
            print("AudioKit failed to start: \(error)")
        }
    }
    
    func playNote(pitch: Float, velocity: Float = 0.8) {
        let osc = oscillators[currentInstrument]
        let env = envelopes[currentInstrument]
        
        osc.frequency = pitch
        osc.amplitude = velocity
        
        env.attackDuration = Double(attack)
        env.decayDuration = Double(decay)
        env.sustainLevel = Double(sustain)
        env.releaseDuration = Double(release)
        
        // Update effects
        delays[currentInstrument].dryWetMix = Double(delayAmount)
        reverbs[currentInstrument].dryWetMix = Double(reverbAmount)
        distortions[currentInstrument].inputGain = Double(1 + saturationAmount * 4)
        choruses[currentInstrument].dryWetMix = Double(chorusAmount)
        
        DispatchQueue.main.async {
            env.start()
        }
    }
    
    func stopNote() {
        let env = envelopes[currentInstrument]
        DispatchQueue.main.async {
            env.stop()
        }
    }
    
    func startSequencer() {
        sequencerTimer?.invalidate()
        currentStep = 0
        
        let interval = 60.0 / tempo / 4.0 // 16th notes
        
        sequencerTimer = Timer.scheduledTimer(withTimeInterval: interval, repeats: true) { _ in
            self.playStep()
            self.currentStep = (self.currentStep + 1) % 16
        }
    }
    
    func stopSequencer() {
        sequencerTimer?.invalidate()
        sequencerTimer = nil
    }
    
    private func playStep() {
        for instrument in 0..<4 {
            if sequencerData[instrument][currentStep] {
                let previousInstrument = currentInstrument
                currentInstrument = instrument
                
                if instrument == 3 {
                    // Drums
                    playDrumHit(currentStep % 4)
                } else {
                    // Melodic instruments
                    let note = 60 + (currentStep % 8) * 2
                    playNote(pitch: Float(note).midiNoteToFrequency(), velocity: 0.6)
                }
                
                currentInstrument = previousInstrument
            }
        }
    }
    
    private func playDrumHit(_ type: Int) {
        switch type {
        case 0: playNote(pitch: 60, velocity: 0.8) // Kick
        case 1: playNote(pitch: 200, velocity: 0.7) // Snare
        case 2: playNote(pitch: 1000, velocity: 0.5) // Hi-hat
        default: playNote(pitch: 500, velocity: 0.6) // Other
        }
    }
}

extension Float {
    func midiNoteToFrequency() -> Float {
        return 440.0 * pow(2.0, (self - 69.0) / 12.0)
    }
}

extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3:
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6:
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8:
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }
        self.init(.sRGB, red: Double(r) / 255, green: Double(g) / 255, blue: Double(b) / 255, opacity: Double(a) / 255)
    }
}
