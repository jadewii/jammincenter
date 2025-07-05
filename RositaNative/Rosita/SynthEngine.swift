import SwiftUI
import AudioKit
import AudioKitEX
import SoundpipeAudioKit

class SynthEngine: ObservableObject {
    // Audio nodes
    private let engine = AudioEngine()
    private var oscillator: Oscillator!
    private var envelope: AmplitudeEnvelope!
    private var delay: Delay!
    private var reverb: Reverb!
    private var distortion: TanhDistortion!
    private var filter: LowPassFilter!
    private var mixer: Mixer!
    
    // Sequencer
    private var sequencerTimer: Timer?
    @Published var currentStep = 0
    
    // Published properties
    @Published var isPlaying = false
    @Published var bpm: Double = 120
    @Published var selectedWaveform = 0
    @Published var volume: Float = 0.7
    
    // ADSR
    @Published var attack: Double = 0.01
    @Published var decay: Double = 0.1
    @Published var sustain: Double = 0.8
    @Published var release: Double = 0.3
    
    // Effects
    @Published var delayTime: Double = 0.25
    @Published var delayFeedback: Double = 0.3
    @Published var delayMix: Double = 0.3
    @Published var reverbMix: Double = 0.3
    @Published var distortionAmount: Double = 0.1
    @Published var filterCutoff: Double = 10000
    @Published var filterResonance: Double = 0.5
    
    // Sequencer pattern (16 steps x 8 notes)
    @Published var pattern: [[Bool]] = Array(repeating: Array(repeating: false, count: 16), count: 8)
    @Published var activeNotes: Set<Int> = []
    
    let noteFrequencies: [Double] = [
        261.63, // C4
        293.66, // D4
        329.63, // E4
        349.23, // F4
        392.00, // G4
        440.00, // A4
        493.88, // B4
        523.25  // C5
    ]
    
    init() {
        setupAudio()
    }
    
    private func setupAudio() {
        // Create oscillator
        oscillator = Oscillator()
        oscillator.amplitude = 0
        
        // Create envelope
        envelope = AmplitudeEnvelope(oscillator)
        updateADSR()
        
        // Create effects chain
        delay = Delay(envelope)
        delay.time = AUValue(delayTime)
        delay.feedback = AUValue(delayFeedback)
        delay.dryWetMix = AUValue(delayMix)
        
        reverb = Reverb(delay)
        reverb.loadFactoryPreset(.largeHall)
        reverb.dryWetMix = AUValue(reverbMix)
        
        distortion = TanhDistortion(reverb)
        distortion.pregain = AUValue(distortionAmount * 10)
        
        filter = LowPassFilter(distortion)
        filter.cutoffFrequency = AUValue(filterCutoff)
        filter.resonance = AUValue(filterResonance)
        
        // Final mixer
        mixer = Mixer(filter)
        mixer.volume = AUValue(volume)
        
        engine.output = mixer
        
        do {
            try engine.start()
            oscillator.start()
        } catch {
            print("AudioKit failed to start: \(error)")
        }
    }
    
    // MARK: - Waveform Control
    
    func updateWaveform() {
        let waveforms: [AudioKit.Table] = [
            AudioKit.Table(.sine),
            AudioKit.Table(.sawtooth),
            AudioKit.Table(.square),
            AudioKit.Table(.triangle)
        ]
        // Note: Modern AudioKit uses different API for waveform setting
        // We'll set amplitude to 0 then restart with new waveform
        oscillator.amplitude = 0
        oscillator.stop()
        oscillator = Oscillator(waveform: waveforms[selectedWaveform])
        oscillator.amplitude = 0
        oscillator.start()
        // Reconnect to envelope
        envelope = AmplitudeEnvelope(oscillator)
        updateADSR()
    }
    
    // MARK: - ADSR Control
    
    func updateADSR() {
        envelope.attackDuration = AUValue(attack)
        envelope.decayDuration = AUValue(decay)
        envelope.sustainLevel = AUValue(sustain)
        envelope.releaseDuration = AUValue(release)
    }
    
    // MARK: - Effects Control
    
    func updateEffects() {
        delay.time = AUValue(delayTime)
        delay.feedback = AUValue(delayFeedback)
        delay.dryWetMix = AUValue(delayMix)
        
        reverb.dryWetMix = AUValue(reverbMix)
        
        distortion.pregain = AUValue(distortionAmount * 10)
        
        filter.cutoffFrequency = AUValue(filterCutoff)
        filter.resonance = AUValue(filterResonance)
        
        mixer.volume = AUValue(volume)
    }
    
    // MARK: - Note Playing
    
    func playNote(_ noteIndex: Int) {
        guard noteIndex < noteFrequencies.count else { return }
        
        activeNotes.insert(noteIndex)
        oscillator.frequency = AUValue(noteFrequencies[noteIndex])
        oscillator.amplitude = 0.5
        envelope.openGate()
    }
    
    func stopNote(_ noteIndex: Int) {
        activeNotes.remove(noteIndex)
        if activeNotes.isEmpty {
            envelope.closeGate()
        }
    }
    
    // MARK: - Sequencer Control
    
    func togglePlayback() {
        if isPlaying {
            stop()
        } else {
            play()
        }
    }
    
    func play() {
        isPlaying = true
        currentStep = 0
        startSequencer()
    }
    
    func stop() {
        isPlaying = false
        sequencerTimer?.invalidate()
        sequencerTimer = nil
        envelope.closeGate()
    }
    
    private func startSequencer() {
        let interval = 60.0 / bpm / 4.0 // 16th notes
        sequencerTimer = Timer.scheduledTimer(withTimeInterval: interval, repeats: true) { _ in
            self.processStep()
        }
    }
    
    private func processStep() {
        // Check if any notes are active in current step
        var noteToPlay: Int? = nil
        
        for row in 0..<8 {
            if pattern[row][currentStep] {
                noteToPlay = row
                break // Play only the first active note in the column
            }
        }
        
        if let note = noteToPlay {
            oscillator.frequency = AUValue(noteFrequencies[note])
            oscillator.amplitude = 0.5
            envelope.openGate()
            
            // Schedule note off
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                self.envelope.closeGate()
            }
        }
        
        currentStep = (currentStep + 1) % 16
    }
    
    // MARK: - Pattern Management
    
    func toggleCell(row: Int, col: Int) {
        pattern[row][col].toggle()
    }
    
    func clearPattern() {
        pattern = Array(repeating: Array(repeating: false, count: 16), count: 8)
    }
    
    func randomizePattern() {
        for row in 0..<8 {
            for col in 0..<16 {
                pattern[row][col] = Bool.random()
            }
        }
    }
    
    deinit {
        engine.stop()
    }
}