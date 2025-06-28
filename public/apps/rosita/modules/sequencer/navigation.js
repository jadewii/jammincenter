// New module for keyboard navigation and selection
class SequencerNavigation {
    constructor(sequencer) {
        this.sequencer = sequencer;
    }

    setupKeyboardNavigation() {
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault(); // Prevent page scrolling
                
                // Toggle sequencer on/off with spacebar
                if (this.sequencer.sequencerRunning) {
                    this.sequencer.stopSequencer();
                } else {
                    this.sequencer.startSequencer();
                }
            } else if (this.sequencer.selectedCellIndex >= 0) {
                // Handle arrow key navigation when a cell is selected
                if (e.code === 'ArrowUp') {
                    e.preventDefault();
                    this.moveSelectionVertical(-1); // Move up
                } else if (e.code === 'ArrowDown') {
                    e.preventDefault();
                    this.moveSelectionVertical(1); // Move down
                } else if (e.code === 'ArrowLeft') {
                    e.preventDefault();
                    this.moveSelectionHorizontal(-1); // Move left
                } else if (e.code === 'ArrowRight') {
                    e.preventDefault();
                    this.moveSelectionHorizontal(1); // Move right
                } else if (e.code === 'Enter') {
                    e.preventDefault();
                    this.sequencer.toggleSequencerStep(this.sequencer.selectedCellIndex);
                }
            }
        });
    }

    moveSelectionVertical(direction) {
        // Remove selection movement functionality
        return;
    }

    moveSelectionHorizontal(direction) {
        // Remove selection movement functionality
        return;
    }
}

export default SequencerNavigation;