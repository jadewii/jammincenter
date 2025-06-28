// New module for visual updates in the sequencer
class VisualUpdater {
    constructor(sequencer) {
        this.sequencer = sequencer;
    }
    
    updateVisuals(column) {
        if (!this.sequencer.sequencerRunning) return;
        // Highlight current column
        requestAnimationFrame(() => {
            this.sequencer.grid.highlightPlayingColumn(column);
        });
    }
    
    clearPlayingHighlights() {
        // Just delegate to the grid's method
        this.sequencer.grid.clearPlayingHighlights();
    }
}

export default VisualUpdater;