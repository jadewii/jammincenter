# Rosita iOS App - Build Instructions

## 🎯 Overview
Rosita is a professional synthesizer app for iOS with real-time audio synthesis, effects processing, and a beautiful neon-styled interface.

## 📱 Requirements
- Xcode 15.0 or later
- iOS 15.0+ deployment target
- macOS Ventura or later
- Apple Developer account (for device testing)
- AudioKit 5.6.0+

## 🚀 Setting Up the Project

### 1. Create New Xcode Project
1. Open Xcode
2. File → New → Project
3. Choose **"App"** template
4. Configure:
   - Product Name: **Rosita**
   - Team: Select your development team
   - Organization Identifier: **com.jadewii**
   - Bundle Identifier: **com.jadewii.rosita**
   - Interface: **SwiftUI**
   - Language: **Swift**
   - Use Core Data: **No**
   - Include Tests: **Yes** (optional)

### 2. Configure Project Settings
1. Select the Rosita project in navigator
2. Select the Rosita target
3. **General** tab:
   - Deployment Info → iOS 15.0
   - Device Orientation: Uncheck Portrait, check only Landscape Left & Right
   - Status Bar Style: Hide status bar
   - Requires full screen: ✓

4. **Signing & Capabilities**:
   - Enable Automatic signing
   - Select your team
   - Add capability: **Background Modes**
     - Check "Audio, AirPlay, and Picture in Picture"

### 3. Add AudioKit Package
1. File → Add Package Dependencies
2. Enter URL: `https://github.com/AudioKit/AudioKit`
3. Dependency Rule: Up to Next Major Version → 5.6.0
4. Add to Target: Rosita

### 4. Add Project Files
1. Delete the default `ContentView.swift`
2. Drag all files from the Rosita folder into Xcode:
   - `RositaApp.swift`
   - `Views/` folder (all view files)
   - `Audio/AudioEngine.swift`
   - `Info.plist` (replace the existing one)

3. Make sure to:
   - Check "Copy items if needed"
   - Add to target: Rosita

### 5. Configure Info.plist
Replace the auto-generated Info.plist with the provided one, or ensure these keys are set:
- `UIRequiresFullScreen`: YES
- `UIStatusBarHidden`: YES
- `UISupportedInterfaceOrientations`: Landscape only
- `NSMicrophoneUsageDescription`: Required text
- `UIBackgroundModes`: audio

## 🏃 Running the App

### In Simulator
1. Select an iPad or iPhone simulator (Landscape devices work best)
2. Product → Run (⌘R)
3. The app should launch in landscape mode

### On Physical Device
1. Connect your iOS device
2. Select your device from the scheme dropdown
3. You may need to trust your development certificate on the device:
   - Settings → General → VPN & Device Management
4. Product → Run (⌘R)

## 📦 Archiving for TestFlight

### 1. Prepare for Release
1. Select "Any iOS Device" as the destination
2. Product → Archive
3. Wait for the archive to complete

### 2. Upload to App Store Connect
1. In the Organizer window that appears:
   - Select your archive
   - Click "Distribute App"
   - Choose "App Store Connect"
   - Choose "Upload"
   - Use automatic signing
   - Review and Upload

### 3. Configure in App Store Connect
1. Log in to [App Store Connect](https://appstoreconnect.apple.com)
2. Select your app
3. Go to TestFlight tab
4. Once processing is complete:
   - Add internal or external testers
   - Submit for external testing review if needed

### 4. TestFlight Testing
- Internal Testing: Available immediately for up to 100 testers
- External Testing: Requires Apple review (usually 24-48 hours)
- Testers install via TestFlight app using email invitation

## 💰 StoreKit 2 Integration (Future)

The code includes TODO comments for StoreKit 2 integration:

1. **In RositaApp.swift**:
   ```swift
   // TODO: Initialize StoreKit 2 subscription manager here
   // SubscriptionManager.shared.initialize()
   ```

2. **Premium Features Placeholders**:
   - Additional sound presets
   - Pattern save/load
   - Advanced effects
   - Cloud sync

3. **Implementation Steps**:
   - Create `SubscriptionManager` class
   - Add StoreKit 2 capability
   - Configure products in App Store Connect
   - Implement purchase flows

## 🐛 Troubleshooting

### Common Issues

1. **"No such module 'AudioKit'"**
   - Ensure AudioKit package is properly added
   - Clean build folder: Product → Clean Build Folder (⇧⌘K)
   - Reset package caches: File → Packages → Reset Package Caches

2. **Audio not working in simulator**
   - Some audio features work better on physical devices
   - Check simulator audio output settings

3. **Landscape orientation issues**
   - Verify Info.plist orientation settings
   - Check project target orientation settings

4. **Archive not appearing**
   - Ensure you're using a valid development team
   - Check code signing settings
   - Verify bundle identifier matches App Store Connect

## 📱 App Store Submission Checklist

- [ ] App icon (1024x1024)
- [ ] Screenshots for all device sizes
- [ ] App description and keywords
- [ ] Privacy policy URL
- [ ] Support URL
- [ ] Age rating questionnaire
- [ ] Export compliance (usually no for music apps)

## 🎨 Customization

The app uses a neon aesthetic with these primary colors:
- Pink: `#FFB6C1`
- Blue: `#87CEEB`
- Purple: `#DDA0DD`
- Gold: `#FFD700`

To modify the theme, update the color values in the various View files.

## 📞 Support

For issues or questions:
- Check AudioKit documentation: https://audiokit.github.io/AudioKit/
- Review SwiftUI documentation
- Test on physical devices for best audio performance

Happy music making! 🎵