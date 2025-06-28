// New module for sequencer playback control
class PlaybackController {
    constructor(sequencer, audioScheduler, visualUpdater) {
        this.sequencer = sequencer;
        this.audioScheduler = audioScheduler;
        this.visualUpdater = visualUpdater;
        this.loopTimeout = null;
        this.lastUpdateTime = 0;
        
        // Mobile-specific timing adjustments
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        this.audioSchedulingBuffer = this.isMobile ? 0.15 : 0.1; // Larger buffer for mobile
        this.lookahead = this.isMobile ? 40 : 25; // More lookahead for mobile
        
        this.pausedTime = null;
        this.pausedStep = null;
        this.pausedLastUpdateTime = null;
    }

    startSequencer() {
        if (this.sequencer.sequencerRunning) return;

        // Make sure AudioContext is running with mobile-specific handling
        if (this.sequencer.synthEngine.audioContext.state !== 'running') {
            this.sequencer.synthEngine.resumeAudioContext();
            
            // On mobile, wait a bit longer for audio context to be ready
            if (this.isMobile) {
                setTimeout(() => {
                    if (this.sequencer.synthEngine.audioContext.state === 'running') {
                        this.actuallyStartSequencer();
                    } else {
                        console.warn('Audio context not ready on mobile, retrying...');
                        setTimeout(() => this.actuallyStartSequencer(), 200);
                    }
                }, 100);
                return;
            }
        }

        this.actuallyStartSequencer();
    }
    
    actuallyStartSequencer() {
        this.sequencer.sequencerRunning = true;
        this.sequencer.playButton.classList.add('active');
        this.sequencer.currentStep = 0; // Reset to first step ONLY when starting from stopped state

        // Reset the last update time with a small negative offset to ensure first step plays
        this.lastUpdateTime = this.sequencer.synthEngine.audioContext.currentTime - (this.isMobile ? 0.1 : 0.05);

        this.sequencerLoop();
    }

    sequencerLoop() {
        if (!this.sequencer.sequencerRunning) return;

        try {
            const stepsPerBeat = 2; 
            const secondsPerBeat = 60 / this.sequencer.tempo;
            const secondsPerStep = secondsPerBeat / stepsPerBeat;

            const currentTime = this.sequencer.synthEngine.audioContext.currentTime;

            // Ensure audio context is running
            if (this.sequencer.synthEngine.audioContext.state !== 'running') {
                this.sequencer.synthEngine.resumeAudioContext();
                
                // On mobile, reschedule the loop if context isn't ready
                if (this.isMobile && this.sequencer.synthEngine.audioContext.state !== 'running') {
                    this.loopTimeout = setTimeout(() => this.sequencerLoop(), 100);
                    return;
                }
            }

            // Schedule notes with improved precision and mobile adjustments
            const scheduleAheadTime = this.audioSchedulingBuffer; // Use mobile-adjusted buffer

            while (this.lastUpdateTime <= currentTime + scheduleAheadTime) {
                // Validate timing to prevent scheduling in the past with mobile tolerance
                const driftTolerance = this.isMobile ? 0.15 : 0.1;
                if (this.lastUpdateTime < currentTime - driftTolerance) {
                    console.warn('Timing drift detected, correcting...');
                    this.lastUpdateTime = currentTime + 0.01; // Small positive offset
                }
                
                // Calculate which column we're on (0-7)
                const column = this.sequencer.currentStep % 8;

                // Schedule visual update with precise timing
                const visualDelay = Math.max(0, (this.lastUpdateTime - currentTime) * 1000);
                setTimeout(() => {
                    if (this.sequencer.sequencerRunning) {
                        this.visualUpdater.updateVisuals(column);
                    }
                }, visualDelay);

                // Play notes for active cells in ALL instruments with exact timing
                this.audioScheduler.playStepNotes(column, this.lastUpdateTime);

                // Advance to next step
                this.sequencer.currentStep = (this.sequencer.currentStep + 1) % 8;
                this.lastUpdateTime += secondsPerStep;
            }

            // Schedule the next loop iteration with stable timing, adjusted for mobile
            const nextLoopDelay = Math.max(this.isMobile ? 10 : 5, this.lookahead / 2);
            this.loopTimeout = setTimeout(() => this.sequencerLoop(), nextLoopDelay);
        } catch (error) {
            console.error("Error in sequencer loop:", error);
            // Reset timing on error to prevent drift
            this.lastUpdateTime = this.sequencer.synthEngine.audioContext.currentTime + 0.01;
            // Try to restart the loop with longer delay on mobile
            const retryDelay = this.isMobile ? 100 : 50;
            this.loopTimeout = setTimeout(() => this.sequencerLoop(), retryDelay);
        }
    }

    pauseSequencer() {
        // Set flag before any operations to prevent race conditions
        this.sequencer.sequencerRunning = false;
        this.sequencer.playButton.classList.remove('active');

        try {
            // Clear the main loop timeout first to prevent multiple loops
            if (this.loopTimeout) {
                clearTimeout(this.loopTimeout);
                this.loopTimeout = null;
            }

            // Save the current audio time and step for smoother resuming
            this.pausedTime = this.sequencer.synthEngine.audioContext.currentTime;
            this.pausedStep = this.sequencer.currentStep;
            this.pausedLastUpdateTime = this.lastUpdateTime;

            // Fade out active notes instead of stopping abruptly
            this.audioScheduler.fadeOutActiveSources();
        } catch (error) {
            console.error("Error pausing sequencer:", error);
            // Ensure critical cleanup even on error
            this.sequencer.sequencerRunning = false;
            this.loopTimeout = null;
        }
    }

    resumeSequencer(isPatternChange = false) {
        if (this.sequencer.sequencerRunning) return;

        try {
            // Make sure AudioContext is running
            if (this.sequencer.synthEngine.audioContext.state !== 'running') {
                this.sequencer.synthEngine.resumeAudioContext();
            }

            this.sequencer.sequencerRunning = true;
            this.sequencer.playButton.classList.add('active');

            const currentTime = this.sequencer.synthEngine.audioContext.currentTime;

            // If this is a pattern change, maintain timing context
            if (isPatternChange && this.pausedTime && this.pausedLastUpdateTime) {
                // Calculate how much time has passed since pausing
                const elapsedTime = currentTime - this.pausedTime;

                // Adjust lastUpdateTime to maintain precise timing
                this.lastUpdateTime = this.pausedLastUpdateTime + elapsedTime;
            } else {
                // Normal resume - reset timing to current
                this.lastUpdateTime = currentTime;
            }

            // Continue from current position without resetting
            this.sequencerLoop();
        } catch (error) {
            console.error("Error resuming sequencer:", error);
            // Reset state to prevent stuck UI
            this.sequencer.sequencerRunning = false;
            this.sequencer.playButton.classList.remove('active');
        }
    }

    stopSequencer() {
        this.sequencer.sequencerRunning = false;
        this.sequencer.playButton.classList.remove('active');

        try {
            // Clear the main loop timeout first
            if (this.loopTimeout) {
                clearTimeout(this.loopTimeout);
                this.loopTimeout = null;
            }

            // Stop all audio sources
            this.audioScheduler.stopAllAudioSources();

            // Remove playing indicators
            this.visualUpdater.clearPlayingHighlights();

            // Reset to first step
            this.sequencer.currentStep = 0;
            
            // Reset timing
            this.lastUpdateTime = 0;
            this.pausedTime = null;
            this.pausedStep = null;
            this.pausedLastUpdateTime = null;
        } catch (error) {
            console.error("Error stopping sequencer:", error);
            // Force cleanup on error
            this.sequencer.sequencerRunning = false;
            this.loopTimeout = null;
            this.sequencer.currentStep = 0;
        }
    }
}

export default PlaybackController;