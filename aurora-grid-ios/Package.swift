// swift-tools-version: 5.7
import PackageDescription

let package = Package(
    name: "AuroraGrid",
    platforms: [
        .iOS(.v15)
    ],
    products: [
        .library(
            name: "AuroraGrid",
            targets: ["AuroraGrid"]),
    ],
    dependencies: [
        .package(url: "https://github.com/AudioKit/AudioKit.git", from: "5.6.0")
    ],
    targets: [
        .target(
            name: "AuroraGrid",
            dependencies: ["AudioKit"])
    ]
)