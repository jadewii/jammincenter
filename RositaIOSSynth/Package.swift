// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "RositaIOSSynth",
    platforms: [
        .iOS(.v15)
    ],
    products: [
        .library(
            name: "RositaIOSSynth",
            targets: ["RositaIOSSynth"]),
    ],
    dependencies: [
        .package(url: "https://github.com/AudioKit/AudioKit", from: "5.6.0")
    ],
    targets: [
        .target(
            name: "RositaIOSSynth",
            dependencies: ["AudioKit"],
            path: ".",
            sources: [
                "RositaApp.swift",
                "ContentView.swift",
                "AudioEngine.swift",
                "EffectsView.swift",
                "KeyboardView.swift"
            ]
        )
    ]
)