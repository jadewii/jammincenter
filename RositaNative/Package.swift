// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "Rosita",
    platforms: [
        .iOS(.v16)
    ],
    dependencies: [
        .package(url: "https://github.com/AudioKit/AudioKit", from: "5.6.0"),
        .package(url: "https://github.com/AudioKit/AudioKitEX", from: "5.6.0"),
        .package(url: "https://github.com/AudioKit/SoundpipeAudioKit", from: "5.6.0")
    ],
    targets: [
        .executableTarget(
            name: "Rosita",
            dependencies: [
                "AudioKit",
                "AudioKitEX",
                "SoundpipeAudioKit"
            ]
        )
    ]
)