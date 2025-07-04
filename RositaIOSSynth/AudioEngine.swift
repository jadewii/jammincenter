//
//  AudioEngine.swift
//  Rosita iOS Synth
//
//  AudioKit signal chain and audio processing
//

import AudioKit
import AVFoundation
import SwiftUI

class AudioEngine: ObservableObject {
    // Main audio engine
    private let engine = AudioKit.AudioEngine()
    
    // Oscillators
    private var oscillator: Oscillator
    private var testOscillator: Oscillator
    
    // Envelopes
    private var envelope: AmplitudeEnvelope
    private var testEnvelope: AmplitudeEnvelope
    
    // Effects
    private var delay: Delay
    private var reverb: Reverb
    private var distortion: Distortion
    private var chorus: Chorus
    
    // Final mixer
    private var finalMixer: Mixer
    
    // Published properties for UI binding
    @Published var delayTime: Float = 0.375 {
        didSet { updateDelay() }
    }
    
    @Published var delayFeedback: Float = 0.5 {
        didSet { updateDelay() }
    }
    
    @Published var delayMix: Float = 0.0 {
        didSet { updateDelay() }
    }
    
    @Published var reverbAmount: Float = 0.0 {
        didSet { updateReverb() }
    }
    
    @Published var distortionAmount: Float = 0.0 {
        didSet { updateDistortion() }
    }
    
    @Published var chorusDepth: Float = 0.0 {
        didSet { updateChorus() }
    }
    
    init() {
        // Initialize oscillators
        oscillator = Oscillator(waveform: Table(.sine))
        oscillator.amplitude = 0.5
        
        testOscillator = Oscillator(waveform: Table(.sine))
        testOscillator.frequency = 440
        testOscillator.amplitude = 0.3
        
        // Create envelopes
        envelope = AmplitudeEnvelope(oscillator)
        envelope.attackDuration = 0.01
        envelope.decayDuration = 0.1
        envelope.sustainLevel = 0.8
        envelope.releaseDuration = 0.3
        
        testEnvelope = AmplitudeEnvelope(testOscillator)
        testEnvelope.attackDuration = 0.1
        testEnvelope.decayDuration = 0.1
        testEnvelope.sustainLevel = 1.0
        testEnvelope.releaseDuration = 0.5
        
        // Create effects chain for main oscillator
        delay = Delay(envelope)
        delay.time = AUValue(delayTime)
        delay.feedback = AUValue(delayFeedback * 0.8) // Scale feedback to prevent runaway
        delay.dryWetMix = AUValue(delayMix)
        
        reverb = Reverb(delay)
        reverb.dryWetMix = AUValue(reverbAmount)
        
        distortion = Distortion(reverb)
        distortion.decimation = 0.5
        distortion.rounding = 0.0
        distortion.decimationMix = AUValue(distortionAmount)
        
        chorus = Chorus(distortion)
        chorus.depth = AUValue(chorusDepth)
        chorus.frequency = 1.0
        
        // Create separate effects chain for test oscillator
        let testDelay = Delay(testEnvelope)
        testDelay.time = AUValue(delayTime)
        testDelay.feedback = AUValue(delayFeedback * 0.8)
        testDelay.dryWetMix = AUValue(delayMix)
        
        let testReverb = Reverb(testDelay)
        testReverb.dryWetMix = AUValue(reverbAmount)
        
        let testDistortion = Distortion(testReverb)
        testDistortion.decimation = 0.5
        testDistortion.rounding = 0.0
        testDistortion.decimationMix = AUValue(distortionAmount)
        
        let testChorus = Chorus(testDistortion)
        testChorus.depth = AUValue(chorusDepth)
        testChorus.frequency = 1.0
        
        // Mix both chains
        finalMixer = Mixer([chorus, testChorus])
        
        // Set output
        engine.output = finalMixer
        
        // Configure audio session
        setupAudioSession()
    }
    
    private func setupAudioSession() {
        do {
            Settings.bufferLength = .short
            try AVAudioSession.sharedInstance().setCategory(.playback, mode: .default, options: [])
            try AVAudioSession.sharedInstance().setActive(true)
        } catch {
            print("Failed to setup audio session: \(error)")
        }
    }
    
    func start() {
        do {
            try engine.start()
            
            // Start oscillators but keep them silent initially
            oscillator.start()
            testOscillator.start()
            
            // Close envelopes to keep oscillators silent
            envelope.closeGate()
            testEnvelope.closeGate()
            
        } catch {
            print("Failed to start audio engine: \(error)")
        }
    }
    
    func stop() {
        envelope.closeGate()
        testEnvelope.closeGate()
        
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
            self.oscillator.stop()
            self.testOscillator.stop()
            self.engine.stop()
        }
    }
    
    // MARK: - Keyboard input
    
    func noteOn(pitch: Int) {
        let frequency = 440.0 * pow(2.0, Double(pitch - 69) / 12.0)
        oscillator.frequency = AUValue(frequency)
        envelope.openGate()
    }
    
    func noteOff() {
        envelope.closeGate()
    }
    
    // MARK: - Test tone
    
    func playTestTone() {
        testEnvelope.openGate()
    }
    
    func stopTestTone() {
        testEnvelope.closeGate()
    }
    
    // MARK: - Effect updates
    
    private func updateDelay() {
        delay.time = AUValue(delayTime)
        delay.feedback = AUValue(delayFeedback * 0.8)
        delay.dryWetMix = AUValue(delayMix)
        
        // Also update test oscillator's delay
        if let testDelay = (testEnvelope.connections.first { $0 is Delay }) as? Delay {
            testDelay.time = AUValue(delayTime)
            testDelay.feedback = AUValue(delayFeedback * 0.8)
            testDelay.dryWetMix = AUValue(delayMix)
        }
    }
    
    private func updateReverb() {
        reverb.dryWetMix = AUValue(reverbAmount)
        
        // Also update test oscillator's reverb
        if let node = findNodeInChain(from: testEnvelope, type: Reverb.self) {
            node.dryWetMix = AUValue(reverbAmount)
        }
    }
    
    private func updateDistortion() {
        distortion.decimationMix = AUValue(distortionAmount)
        
        // Also update test oscillator's distortion
        if let node = findNodeInChain(from: testEnvelope, type: Distortion.self) {
            node.decimationMix = AUValue(distortionAmount)
        }
    }
    
    private func updateChorus() {
        chorus.depth = AUValue(chorusDepth)
        
        // Also update test oscillator's chorus
        if let node = findNodeInChain(from: testEnvelope, type: Chorus.self) {
            node.depth = AUValue(chorusDepth)
        }
    }
    
    private func findNodeInChain<T: Node>(from startNode: Node, type: T.Type) -> T? {
        var currentNode: Node? = startNode
        
        while let node = currentNode {
            if let targetNode = node as? T {
                return targetNode
            }
            
            // Get next node in chain
            if node.connections.count > 0 {
                currentNode = node.connections[0]
            } else {
                break
            }
        }
        
        return nil
    }
}