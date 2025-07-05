import Foundation

struct Track: Identifiable {
    let id: Int
    let name: String
    let color: String
    var isMuted: Bool
    var isSolo: Bool
}

struct Pattern: Identifiable {
    let id = UUID()
    let trackId: Int
    var steps: [Bool]
}

enum EffectType {
    case volume
    case filter
    case reverb
    case delay
    case drive
    case compression
}

enum SoundParameter {
    case pitch
    case decay
    case tone
    case snap
    case punch
    case warm
}