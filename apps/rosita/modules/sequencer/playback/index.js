// Index file to re-export the SequencerPlayer with modular components
import AudioScheduler from './audio-scheduler.js';
import VisualUpdater from './visual-updater.js';
import PlaybackController from './playback-controller.js';

class SequencerPlayer {
    constructor(sequencer) {
        this.sequencer = sequencer;
        
        // Initialize the component modules
        this.audioScheduler = new AudioScheduler(sequencer);
        this.visualUpdater = new VisualUpdater(sequencer);
        this.playbackController = new PlaybackController(sequencer, this.audioScheduler, this.visualUpdater);
    }

    // Delegate methods to appropriate components
    startSequencer() {
        this.playbackController.startSequencer();
    }
    
    pauseSequencer() {
        this.playbackController.pauseSequencer();
    }
    
    resumeSequencer(isPatternChange = false) {
        this.playbackController.resumeSequencer(isPatternChange);
    }
    
    stopSequencer() {
        this.playbackController.stopSequencer();
    }
}

export default SequencerPlayer;