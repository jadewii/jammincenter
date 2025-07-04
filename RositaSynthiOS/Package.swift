// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "RositaSynthiOS",
    platforms: [
        .iOS(.v15)
    ],
    products: [
        .library(
            name: "RositaSynthiOS",
            targets: ["RositaSynthiOS"]
        ),
    ],
    dependencies: [
        .package(url: "https://github.com/AudioKit/AudioKit", from: "5.6.0")
    ],
    targets: [
        .target(
            name: "RositaSynthiOS",
            dependencies: ["AudioKit"]
        )
    ]
)