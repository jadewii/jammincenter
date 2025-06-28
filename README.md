# 🎵 JamminCenter

Central hub for Jammin music apps - a beautiful modular synthesizer platform.

## Features

✨ **Modular Architecture** - Run multiple music apps in one unified interface  
🎹 **Rosita Synth** - Beautiful melodic synthesizer with sequencer and drum machine  
🎨 **Beautiful UI** - Pink gradient design with smooth animations  
🚀 **High Performance** - Native desktop app built with Tauri  
📱 **Iframe Integration** - Apps run seamlessly within the main interface  

## Current Apps

### Rosita
- 4-track synthesizer (Synth, Bass, Keys, Drums)
- 8x16 step sequencer with beautiful drum colors
- ADSR envelope controls
- Effects: Delay, Reverb, Saturation, Chorus
- Arpeggiator with visual LEDs
- Pattern memory (8 slots)
- Tetris-style mixer mode

## Getting Started

### Installation
```bash
# Install remaining dependencies
npm install

# Build the app
npm run tauri:build

# Or run in development
npm run tauri:dev
```

### Running the App
```bash
# Development mode
npm run tauri:dev

# Production build
npm run tauri:build
```

## Architecture

### Frontend (React)
- `src/App.tsx` - Main app component
- `src/styles.css` - Tailwind styles
- Pink title bar with traffic lights
- Dark theme optimized for development

### Backend (Rust/Tauri)
- `src-tauri/` - Tauri backend
- `public/apps/` - Modular apps directory
- `dist/` - Build output

### Adding New Apps

1. Create a new directory in `public/apps/`
2. Add your app files (HTML, CSS, JS)
3. Register in `public/apps.json`
4. Launch from JamminCenter

## Development

Apps are loaded via iframes and have access to:
- Web Audio API
- MIDI support
- Local storage
- Full DOM access

## GitHub Repository

https://github.com/jadewii/jammincenter

## License

MIT License - feel free to use this in your own projects!

---

Built with ❤️ by JAde Wii