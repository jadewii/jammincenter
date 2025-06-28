# JAMMINCENTER - PROJECT CONTEXT

## PROJECT OVERVIEW
JamminCenter (formerly Wiistruments Center) is a modular music app platform that hosts multiple synthesizer applications in a unified interface.

## QUICK ACCESS
- **Location**: `/Users/jade/Wiistrument-Development/01-Active-Projects/Rosita-Project/source-code/wiistruments-center-clean/`
- **GitHub**: https://github.com/jadewii/jammincenter
- **Current Status**: ✅ Working 100% with Rosita integrated

## KEY FEATURES
- ✅ Modular architecture with iframe-based app loading
- ✅ Beautiful Rosita synth with all features working
- ✅ Pink gradient UI design
- ✅ Dynamic title bar showing current app name
- ✅ No duplicate title bars (fixed)
- ✅ Correct instrument colors (1=pink, 2=blue, 3=purple, 4=yellow)

## BUILD COMMANDS
```bash
# Navigate to project
cd /Users/jade/Wiistrument-Development/01-Active-Projects/Rosita-Project/source-code/wiistruments-center-clean/

# Build the app
npm run build

# Build Tauri app
npm run tauri:build

# Quick rebuild and run
cp -R src-tauri/target/release/bundle/macos/JamminCenter.app . && open JamminCenter.app

# Development mode
npm run tauri:dev

# Git operations
git status
git add -A && git commit -m "Your message" && git push
```

## PROJECT STRUCTURE
```
jammincenter/
├── src/                    # React TypeScript source
│   └── App.tsx            # Main app with iframe integration
├── src-tauri/             # Tauri backend
├── public/apps/           # Modular apps directory
│   └── rosita/           # Full Rosita app (HTML/CSS/JS)
└── dist/                  # Build output
```

## CURRENT STATE (Last worked: June 28, 2025)
- Successfully renamed from Wiistruments Center to JamminCenter
- Rosita integrated and working perfectly in iframe
- All UI fixes completed (no duplicate title bar, correct colors)
- GitHub repository created and pushed
- Ready for adding more apps (Arturito, Okinori, etc.)

## NEXT STEPS
1. Add Arturito to the apps directory
2. Fix Arturito's window dragging using Rosita's solution
3. Add more apps to the platform
4. Create app store/marketplace functionality
5. Add Studio Pro features for multi-app synchronization

## TROUBLESHOOTING
- If app doesn't launch: Check that all dependencies are installed with `npm install`
- If Rosita doesn't load: Ensure the iframe src path is correct in App.tsx
- For build errors: Clean with `rm -rf dist src-tauri/target` and rebuild

## IMPORTANT NOTES
- Apps run in iframes within the main JamminCenter window
- Each app maintains its own state and functionality
- The main app provides the window chrome and navigation
- All apps should have their title bars removed to avoid duplication