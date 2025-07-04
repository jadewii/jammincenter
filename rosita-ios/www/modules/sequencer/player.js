// TOMBSTONE: This file has been refactored into smaller modules:
// - modules/sequencer/playback/audio-scheduler.js: Handles audio scheduling logic
// - modules/sequencer/playback/visual-updater.js: Manages visual updates
// - modules/sequencer/playback/playback-controller.js: Controls playback state
// - modules/sequencer/playback/index.js: Main SequencerPlayer class that delegates to components

// This file now just re-exports the refactored SequencerPlayer
import SequencerPlayer from './playback/index.js';
export default SequencerPlayer;