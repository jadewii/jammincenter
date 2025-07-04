//
//  AudioEngine.swift
//  Rosita
//
//  Core audio engine with synth and effects
//

import AudioKit
import AVFoundation
import SwiftUI

class AudioEngine: ObservableObject {
    // MARK: - Audio Components
    private let engine = AudioKit.AudioEngine()
    
    // Oscillators for 4 instruments
    private var oscillators: [Oscillator] = []
    private var envelopes: [AmplitudeEnvelope] = []
    
    // Effects chain
    private var delays: [Delay] = []
    private var reverbs: [Reverb] = []
    private var distortions: [Distortion] = []
    private var choruses: [Chorus] = []
    
    // Mixers
    private var instrumentMixer: Mixer!
    private var effectsMixer: DryWetMixer!
    private var finalMixer: Mixer!
    
    // MARK: - Published Properties
    @Published var instrumentVolumes = [1: 0.8, 2: 0.8, 3: 0.8, 4: 0.8]
    @Published var instrumentPans = [1: 0.0, 2: 0.0, 3: 0.0, 4: 0.0]
    
    // ADSR per instrument
    @Published var attack: [Int: Double] = [1: 0.1, 2: 0.1, 3: 0.1, 4: 0.01]
    @Published var decay: [Int: Double] = [1: 0.2, 2: 0.2, 3: 0.2, 4: 0.1]
    @Published var sustain: [Int: Double] = [1: 0.5, 2: 0.5, 3: 0.5, 4: 0.0]
    @Published var release: [Int: Double] = [1: 0.5, 2: 0.5, 3: 0.5, 4: 0.1]
    
    // Effects parameters
    @Published var delayTime: Double = 0.375
    @Published var delayFeedback: Double = 0.5
    @Published var delayMix: Double = 0.0
    
    @Published var reverbAmount: Double = 0.0
    @Published var distortionAmount: Double = 0.0
    @Published var chorusDepth: Double = 0.0
    
    // Sequencer properties
    @Published var isPlaying = false
    @Published var currentStep = 0
    @Published var tempo: Double = 120
    
    // Pattern storage (8 patterns x 4 instruments x 8 tracks x 16 steps)
    @Published var patterns: [[[[Bool]]]] = []
    @Published var currentPattern = 0
    
    init() {
        setupAudio()
        initializePatterns()
        
        // TODO: Load user's saved presets if premium subscriber
        // if SubscriptionManager.shared.isPremium {
        //     loadUserPresets()
        // }
    }
    
    private func setupAudio() {
        do {
            Settings.bufferLength = .short
            try AVAudioSession.sharedInstance().setCategory(.playback, mode: .default, options: [])
            try AVAudioSession.sharedInstance().setActive(true)
        } catch {
            print("Audio Session error: \(error)")
        }
        
        // Create 4 instruments
        for i in 0..<4 {
            let oscillator = Oscillator(waveform: Table(.sine))
            oscillator.amplitude = 0.0
            oscillators.append(oscillator)
            
            let envelope = AmplitudeEnvelope(oscillator)
            envelope.attackDuration = attack[i + 1] ?? 0.1
            envelope.decayDuration = decay[i + 1] ?? 0.2
            envelope.sustainLevel = sustain[i + 1] ?? 0.5
            envelope.releaseDuration = release[i + 1] ?? 0.5
            envelopes.append(envelope)
            
            // Create effects chain for each instrument
            let delay = Delay(envelope)
            delay.time = AUValue(delayTime)
            delay.feedback = AUValue(delayFeedback * 0.8)
            delay.dryWetMix = AUValue(delayMix)
            delays.append(delay)
            
            let reverb = Reverb(delay)
            reverb.dryWetMix = AUValue(reverbAmount)
            reverbs.append(reverb)
            
            let distortion = Distortion(reverb)
            distortion.decimation = 0.5
            distortion.decimationMix = AUValue(distortionAmount)
            distortions.append(distortion)
            
            let chorus = Chorus(distortion)
            chorus.depth = AUValue(chorusDepth)
            chorus.frequency = 1.0
            choruses.append(chorus)
        }
        
        // Mix all instruments
        instrumentMixer = Mixer(choruses)
        
        // Final output
        engine.output = instrumentMixer
    }
    
    private func initializePatterns() {
        // Initialize 8 patterns
        for _ in 0..<8 {
            var pattern: [[[Bool]]] = []
            // 4 instruments
            for _ in 0..<4 {
                var instrument: [[Bool]] = []
                // 8 tracks per instrument
                for _ in 0..<8 {
                    // 16 steps per track
                    instrument.append(Array(repeating: false, count: 16))
                }
                pattern.append(instrument)
            }
            patterns.append(pattern)
        }
    }
    
    // MARK: - Public Methods
    
    func start() {
        do {
            try engine.start()
            oscillators.forEach { $0.start() }
        } catch {
            print("Could not start engine: \(error)")
        }
    }
    
    func stop() {
        oscillators.forEach { $0.stop() }
        engine.stop()
    }
    
    func playNote(instrument: Int, frequency: Double, velocity: Double = 0.8) {
        guard instrument > 0 && instrument <= 4 else { return }
        let index = instrument - 1
        
        oscillators[index].frequency = AUValue(frequency)
        oscillators[index].amplitude = AUValue(velocity * instrumentVolumes[instrument]!)
        envelopes[index].openGate()
        
        // Visual feedback
        DispatchQueue.main.async {
            NotificationCenter.default.post(
                name: .notePlayedNotification,
                object: nil,
                userInfo: ["instrument": instrument, "frequency": frequency]
            )
        }
    }
    
    func stopNote(instrument: Int) {
        guard instrument > 0 && instrument <= 4 else { return }
        envelopes[instrument - 1].closeGate()
    }
    
    func toggleStep(instrument: Int, track: Int, step: Int) {
        guard instrument > 0 && instrument <= 4,
              track >= 0 && track < 8,
              step >= 0 && step < 16 else { return }
        
        patterns[currentPattern][instrument - 1][track][step].toggle()
        
        // TODO: Auto-save pattern for premium users
        // if SubscriptionManager.shared.isPremium {
        //     savePattern(currentPattern)
        // }
    }
    
    func updateADSR(instrument: Int) {
        guard instrument > 0 && instrument <= 4 else { return }
        let index = instrument - 1
        
        envelopes[index].attackDuration = attack[instrument] ?? 0.1
        envelopes[index].decayDuration = decay[instrument] ?? 0.2
        envelopes[index].sustainLevel = sustain[instrument] ?? 0.5
        envelopes[index].releaseDuration = release[instrument] ?? 0.5
    }
    
    func updateEffects() {
        for i in 0..<4 {
            delays[i].time = AUValue(delayTime)
            delays[i].feedback = AUValue(delayFeedback * 0.8)
            delays[i].dryWetMix = AUValue(delayMix)
            
            reverbs[i].dryWetMix = AUValue(reverbAmount)
            distortions[i].decimationMix = AUValue(distortionAmount)
            choruses[i].depth = AUValue(chorusDepth)
        }
    }
    
    // MARK: - Sequencer
    
    func startSequencer() {
        isPlaying = true
        currentStep = 0
        
        Timer.scheduledTimer(withTimeInterval: 60.0 / tempo / 4.0, repeats: true) { timer in
            if !self.isPlaying {
                timer.invalidate()
                return
            }
            
            self.playCurrentStep()
            self.currentStep = (self.currentStep + 1) % 16
        }
    }
    
    func stopSequencer() {
        isPlaying = false
        currentStep = 0
    }
    
    private func playCurrentStep() {
        for instrument in 1...4 {
            for track in 0..<8 {
                if patterns[currentPattern][instrument - 1][track][currentStep] {
                    // Calculate frequency based on track (for melodic instruments)
                    if instrument < 4 {
                        let baseFreq = 261.63 // C4
                        let semitone = Double(track)
                        let frequency = baseFreq * pow(2.0, semitone / 12.0)
                        playNote(instrument: instrument, frequency: frequency)
                    } else {
                        // Drums - use different "frequencies" for different drum sounds
                        let drumFreqs = [60.0, 100.0, 200.0, 300.0, 400.0, 500.0, 600.0, 800.0]
                        playNote(instrument: 4, frequency: drumFreqs[track], velocity: 1.0)
                    }
                }
            }
        }
    }
}

// MARK: - Notifications
extension Notification.Name {
    static let notePlayedNotification = Notification.Name("notePlayedNotification")
}