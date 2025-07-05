import Foundation
import AudioKit
import Combine

class SequencerEngine: ObservableObject {
    @Published var isPlaying = false
    @Published var currentStep = 0
    @Published var bpm: Double = 120 {
        didSet { updateTempo() }
    }
    @Published var swing: Double = 0.0
    @Published var currentPattern = 0
    
    @Published var tracks: [Track] = []
    @Published var patterns: [[Pattern]] = []
    
    private let engine = AudioEngine()
    private var sequencerTimer: Timer?
    private var drumSounds: [DrumSound] = []
    private var mixer: Mixer!
    private var reverb: Reverb!
    private var delay: Delay!
    private var distortion: Distortion!
    private var compressor: Compressor!
    private var filter: LowPassFilter!
    
    let trackNames = ["Kick", "Snare", "Hi-Hat", "Open Hat", "Crash", "Bass"]
    let trackColors = ["#ff6b9d", "#4ecdc4", "#45b7d1", "#f9ca24", "#f0932b", "#a55eea"]
    
    init() {
        setupAudioEngine()
        setupTracks()
        setupPatterns()
    }
    
    private func setupAudioEngine() {
        do {
            mixer = Mixer()
            
            for i in 0..<6 {
                let drumSound = DrumSound(type: DrumType(rawValue: i) ?? .kick)
                drumSounds.append(drumSound)
                mixer.addInput(drumSound.output)
            }
            
            filter = LowPassFilter(mixer)
            filter.cutoffFrequency = 20000
            filter.resonance = 0
            
            reverb = Reverb(filter)
            reverb.dryWetMix = 0.2
            
            delay = Delay(reverb)
            delay.time = 0.25
            delay.feedback = 0.3
            delay.dryWetMix = 0.1
            
            distortion = Distortion(delay)
            distortion.delay = 0.1
            distortion.decay = 0.1
            distortion.delayMix = 0.5
            
            compressor = Compressor(distortion)
            compressor.threshold = -10
            compressor.ratio = 4
            compressor.attackTime = 0.001
            compressor.releaseTime = 0.1
            
            engine.output = compressor
            try engine.start()
        } catch {
            print("AudioKit engine failed to start: \(error)")
        }
    }
    
    private func setupTracks() {
        for i in 0..<6 {
            let track = Track(
                id: i,
                name: trackNames[i],
                color: trackColors[i],
                isMuted: false,
                isSolo: false
            )
            tracks.append(track)
        }
    }
    
    private func setupPatterns() {
        for _ in 0..<4 {
            var patternSet: [Pattern] = []
            for trackId in 0..<6 {
                let pattern = Pattern(trackId: trackId, steps: Array(repeating: false, count: 16))
                patternSet.append(pattern)
            }
            patterns.append(patternSet)
        }
    }
    
    func toggleStep(track: Int, step: Int) {
        patterns[currentPattern][track].steps[step].toggle()
    }
    
    func isStepActive(track: Int, step: Int) -> Bool {
        patterns[currentPattern][track].steps[step]
    }
    
    func togglePlayback() {
        if isPlaying {
            stop()
        } else {
            play()
        }
    }
    
    private func play() {
        isPlaying = true
        currentStep = 0
        scheduleNextStep()
    }
    
    private func stop() {
        isPlaying = false
        sequencerTimer?.invalidate()
        sequencerTimer = nil
        currentStep = 0
    }
    
    private func scheduleNextStep() {
        guard isPlaying else { return }
        
        let stepDuration = 60.0 / bpm / 4.0
        var delay = stepDuration
        
        if currentStep % 2 == 1 && swing > 0 {
            delay = delay * (1 + swing / 100.0 * 0.67)
        } else if currentStep % 2 == 0 && swing > 0 {
            delay = delay * (1 - swing / 100.0 * 0.33)
        }
        
        sequencerTimer?.invalidate()
        sequencerTimer = Timer.scheduledTimer(withTimeInterval: delay, repeats: false) { [weak self] _ in
            self?.playCurrentStep()
            self?.advanceStep()
            self?.scheduleNextStep()
        }
    }
    
    private func playCurrentStep() {
        for (trackIndex, track) in tracks.enumerated() {
            if patterns[currentPattern][trackIndex].steps[currentStep] {
                if !track.isMuted && (!hasSoloTrack() || track.isSolo) {
                    drumSounds[trackIndex].trigger()
                }
            }
        }
    }
    
    private func advanceStep() {
        currentStep = (currentStep + 1) % 16
    }
    
    private func updateTempo() {
        if isPlaying {
            sequencerTimer?.invalidate()
            scheduleNextStep()
        }
    }
    
    func clearPattern() {
        for i in 0..<patterns[currentPattern].count {
            patterns[currentPattern][i].steps = Array(repeating: false, count: 16)
        }
    }
    
    func randomFill(density: Double = 0.3) {
        for trackIndex in 0..<6 {
            for stepIndex in 0..<16 {
                patterns[currentPattern][trackIndex].steps[stepIndex] = Double.random(in: 0...1) < density
            }
        }
    }
    
    func toggleMute(track: Int) {
        tracks[track].isMuted.toggle()
    }
    
    func toggleSolo(track: Int) {
        tracks[track].isSolo.toggle()
    }
    
    private func hasSoloTrack() -> Bool {
        tracks.contains { $0.isSolo }
    }
    
    func switchPattern(to index: Int) {
        currentPattern = index
    }
    
    func setEffectValue(_ effect: EffectType, value: Double) {
        switch effect {
        case .volume:
            mixer.volume = value
        case .filter:
            filter.cutoffFrequency = value * 20000
        case .reverb:
            reverb.dryWetMix = value
        case .delay:
            delay.dryWetMix = value
        case .drive:
            distortion.delayMix = value
        case .compression:
            compressor.ratio = 1 + value * 19
        }
    }
    
    func setSoundParameter(_ param: SoundParameter, track: Int, value: Double) {
        drumSounds[track].setParameter(param, value: value)
    }
}