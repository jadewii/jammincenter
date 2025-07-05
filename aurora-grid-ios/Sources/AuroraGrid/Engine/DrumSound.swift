import AudioKit
import AVFoundation

enum DrumType: Int {
    case kick = 0
    case snare = 1
    case hiHat = 2
    case openHat = 3
    case crash = 4
    case bass = 5
}

class DrumSound {
    let output: Node
    private let oscillator: Node
    private let envelope: AmplitudeEnvelope
    private let type: DrumType
    
    private var pitch: Double = 1.0
    private var decay: Double = 0.1
    private var tone: Double = 0.5
    private var snap: Double = 0.5
    private var punch: Double = 0.5
    private var warm: Double = 0.5
    
    init(type: DrumType) {
        self.type = type
        
        switch type {
        case .kick:
            let osc = Oscillator(waveform: Table(.sine))
            osc.frequency = 60
            envelope = AmplitudeEnvelope(osc)
            envelope.attackDuration = 0.001
            envelope.decayDuration = 0.1
            envelope.sustainLevel = 0.1
            envelope.releaseDuration = 0.3
            oscillator = osc
            
        case .snare:
            let noise = WhiteNoise()
            let filter = HighPassFilter(noise)
            filter.cutoffFrequency = 200
            envelope = AmplitudeEnvelope(filter)
            envelope.attackDuration = 0.001
            envelope.decayDuration = 0.05
            envelope.sustainLevel = 0
            envelope.releaseDuration = 0.05
            oscillator = noise
            
        case .hiHat:
            let noise = WhiteNoise()
            let filter = HighPassFilter(noise)
            filter.cutoffFrequency = 8000
            envelope = AmplitudeEnvelope(filter)
            envelope.attackDuration = 0.001
            envelope.decayDuration = 0.02
            envelope.sustainLevel = 0
            envelope.releaseDuration = 0.02
            oscillator = noise
            
        case .openHat:
            let noise = WhiteNoise()
            let filter = HighPassFilter(noise)
            filter.cutoffFrequency = 5000
            envelope = AmplitudeEnvelope(filter)
            envelope.attackDuration = 0.001
            envelope.decayDuration = 0.2
            envelope.sustainLevel = 0.1
            envelope.releaseDuration = 0.3
            oscillator = noise
            
        case .crash:
            let noise = WhiteNoise()
            let filter = BandPassFilter(noise)
            filter.centerFrequency = 4000
            filter.bandwidth = 2000
            envelope = AmplitudeEnvelope(filter)
            envelope.attackDuration = 0.001
            envelope.decayDuration = 0.5
            envelope.sustainLevel = 0.2
            envelope.releaseDuration = 1.0
            oscillator = noise
            
        case .bass:
            let osc = Oscillator(waveform: Table(.triangle))
            osc.frequency = 80
            envelope = AmplitudeEnvelope(osc)
            envelope.attackDuration = 0.001
            envelope.decayDuration = 0.2
            envelope.sustainLevel = 0.3
            envelope.releaseDuration = 0.1
            oscillator = osc
        }
        
        output = envelope
    }
    
    func trigger() {
        updateParameters()
        
        if let osc = oscillator as? Oscillator {
            osc.start()
        } else if let noise = oscillator as? WhiteNoise {
            noise.start()
        }
        
        envelope.openGate()
        
        DispatchQueue.main.asyncAfter(deadline: .now() + envelope.attackDuration + envelope.decayDuration) { [weak self] in
            self?.envelope.closeGate()
        }
    }
    
    private func updateParameters() {
        envelope.decayDuration = decay * 0.5
        
        switch type {
        case .kick:
            if let osc = oscillator as? Oscillator {
                osc.frequency = 60 * pitch
            }
        case .snare:
            if let filter = (oscillator as? WhiteNoise).flatMap({ envelope.input as? HighPassFilter }) {
                filter.cutoffFrequency = 200 + tone * 1000
            }
        case .hiHat, .openHat:
            if let filter = (oscillator as? WhiteNoise).flatMap({ envelope.input as? HighPassFilter }) {
                filter.cutoffFrequency = 5000 + tone * 5000
            }
        case .crash:
            if let filter = (oscillator as? WhiteNoise).flatMap({ envelope.input as? BandPassFilter }) {
                filter.centerFrequency = 2000 + tone * 4000
            }
        case .bass:
            if let osc = oscillator as? Oscillator {
                osc.frequency = 80 * pitch
            }
        }
        
        envelope.attackDuration = 0.001 * (1 - punch + 0.1)
    }
    
    func setParameter(_ param: SoundParameter, value: Double) {
        switch param {
        case .pitch:
            pitch = 0.5 + value * 1.5
        case .decay:
            decay = value
        case .tone:
            tone = value
        case .snap:
            snap = value
        case .punch:
            punch = value
        case .warm:
            warm = value
        }
    }
}