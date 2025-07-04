// New module for grid creation and management
class SequencerGrid {
    constructor(sequencer) {
        this.sequencer = sequencer;
        this.currentHighlightedColumn = -1;
        this.gridCells = [];
        
        // FIX: Pre-bind event handlers to avoid creating new functions on every createGrid call
        this.boundHandleCellClick = this.handleCellClick.bind(this);
        this.boundHandleCellTouch = this.handleCellTouch.bind(this);
    }

    createGrid() {
        const sequencerGrid = document.getElementById('sequencer-grid');
        sequencerGrid.innerHTML = ''; // Clear any existing grid
        
        console.log('🔧 Creating grid for instrument:', this.sequencer.currentInstrument);
        
        // Remove all mixer-related classes AND drum kit classes that cause color bleeding
        sequencerGrid.classList.remove('mixer-grid');
        sequencerGrid.classList.remove('mixer-grid-vertical');
        sequencerGrid.classList.remove('kit-1', 'kit-2', 'kit-3', 'kit-4');
        
        // Only add drum kit class if we're currently on drums
        if (this.sequencer.currentInstrument === 'drums') {
            sequencerGrid.classList.add('kit-1'); // Default to kit 1
        }
        
        this.gridCells = []; // Reset the grid cells cache
        
        // No special handling needed - just create regular grid
        
        // Create a document fragment to batch DOM operations
        const fragment = document.createDocumentFragment();
        
        // Create 96 cells (12x8 grid) for regular instruments
        for (let i = 0; i < 96; i++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.dataset.index = i;
            
            // Special handling for drums - add row-based classes
            if (this.sequencer.currentInstrument === 'drums') {
                const row = Math.floor(i / 8);
                cell.classList.add('drum-track');
                cell.classList.add(`drum-row-${row}`);
            }
            
            // Show active state for current instrument
            if (this.sequencer.sequencerTracks[this.sequencer.currentInstrument][i]) {
                cell.classList.add('active');
                cell.classList.add(this.sequencer.currentInstrument);
            }
            
            // No need to force colors here - CSS will handle it
            
            // Display active cells for other instruments with lower opacity
            for (const instrument of Object.keys(this.sequencer.sequencerTracks)) {
                if (instrument !== this.sequencer.currentInstrument && this.sequencer.sequencerTracks[instrument][i]) {
                    // Only add instrument class for background instruments if we're not currently on drums
                    // This prevents drum classes from bleeding into other track views
                    if (this.sequencer.currentInstrument !== 'drums' || instrument !== 'drums') {
                        cell.classList.add(`${instrument}`);
                        
                        // Only add drum-specific classes if we're currently viewing drums
                        if (instrument === 'drums' && this.sequencer.currentInstrument === 'drums') {
                            const row = Math.floor(i / 8);
                            cell.classList.add('drum-track');
                            cell.classList.add(`drum-row-${row}`);
                        }
                    }
                }
            }
            
            // Use event delegation instead of adding listeners to each cell
            this.gridCells[i] = cell;
            fragment.appendChild(cell);
        }
        
        // Clear any existing listeners to prevent duplicates
        sequencerGrid.removeEventListener('click', this.boundHandleCellClick);
        sequencerGrid.removeEventListener('touchstart', this.boundHandleCellTouch);
        
        // Attach event listeners to the container using event delegation
        // FIX: Use pre-bound methods
        sequencerGrid.addEventListener('click', this.boundHandleCellClick);
        sequencerGrid.addEventListener('touchstart', this.boundHandleCellTouch, { passive: false });
        
        // Append all cells at once
        sequencerGrid.appendChild(fragment);
        
    }
    
    handleCellClick(e) {
        const cell = e.target.closest('.grid-cell');
        if (!cell) return;
        
        const index = parseInt(cell.dataset.index);
        this.sequencer.selectedCellIndex = index;
        this.sequencer.toggleSequencerStep(index);
        
        // No additional styling needed here - grid refresh will handle it
    }
    
    handleCellTouch(e) {
        e.preventDefault();
        const cell = e.target.closest('.grid-cell');
        if (!cell) return;
        
        const index = parseInt(cell.dataset.index);
        this.sequencer.selectedCellIndex = index;
        this.sequencer.toggleSequencerStep(index);
    }

    highlightPlayingColumn(column) {
        // Only update if the column changed to avoid unnecessary DOM updates
        if (column === this.currentHighlightedColumn) return;
        
        // Clear previous playing cells
        if (this.currentHighlightedColumn >= 0) {
            const cells = document.querySelectorAll('.grid-cell.playing');
            cells.forEach(cell => cell.classList.remove('playing'));
        }
        
        this.currentHighlightedColumn = column;
        
        // Use efficient DOM selection to add playing class
        for (let row = 0; row < 12; row++) {
            const cellIndex = row * 8 + column;
            const cell = this.gridCells[cellIndex];
            if (cell) cell.classList.add('playing');
        }
    }

    clearPlayingHighlights() {
        if (this.currentHighlightedColumn >= 0) {
            const cells = document.querySelectorAll('.grid-cell.playing');
            cells.forEach(cell => cell.classList.remove('playing'));
            this.currentHighlightedColumn = -1;
        }
    }
}

export default SequencerGrid;