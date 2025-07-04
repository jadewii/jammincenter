// Rust Audio Bridge - Replaces Web Audio API with Rust backend
console.log('🎵 Initializing Rust Audio Bridge');

// Check if we're in Tauri environment
const isTauri = window.__TAURI__ !== undefined;

// Audio state
let isAudioInitialized = false;
let activeNotes = new Map();

// Initialize Rust audio backend
async function initRustAudio() {
    if (!isTauri) {
        console.warn('Not in Tauri environment - using mock audio');
        return true;
    }
    
    try {
        const result = await window.__TAURI__.invoke('init_audio');
        console.log('✅ Rust audio initialized:', result);
        isAudioInitialized = true;
        return true;
    } catch (error) {
        console.error('❌ Failed to initialize Rust audio:', error);
        return false;
    }
}

// Play a note using Rust backend
async function playNoteRust(frequency, instrument, volume = 0.8) {
    if (!isAudioInitialized && isTauri) {
        await initRustAudio();
    }
    
    const noteId = `${frequency}_${instrument}_${Date.now()}`;
    
    if (isTauri) {
        try {
            await window.__TAURI__.invoke('play_note', {
                noteId,
                frequency,
                instrument,
                volume
            });
            activeNotes.set(noteId, { frequency, instrument });
            console.log(`🎵 Playing note: ${frequency}Hz on instrument ${instrument}`);
        } catch (error) {
            console.error('Failed to play note:', error);
        }
    } else {
        // Fallback for development
        console.log(`🎵 [Mock] Playing note: ${frequency}Hz on instrument ${instrument}`);
    }
    
    return noteId;
}

// Stop a note
async function stopNoteRust(noteId) {
    if (!noteId || !activeNotes.has(noteId)) return;
    
    if (isTauri) {
        try {
            await window.__TAURI__.invoke('stop_note', { noteId });
            activeNotes.delete(noteId);
        } catch (error) {
            console.error('Failed to stop note:', error);
        }
    } else {
        console.log(`🔇 [Mock] Stopping note: ${noteId}`);
        activeNotes.delete(noteId);
    }
}

// Stop all notes
async function stopAllNotesRust() {
    if (isTauri) {
        try {
            await window.__TAURI__.invoke('stop_all_notes');
            activeNotes.clear();
        } catch (error) {
            console.error('Failed to stop all notes:', error);
        }
    } else {
        console.log('🔇 [Mock] Stopping all notes');
        activeNotes.clear();
    }
}

// Set effect parameter
async function setEffectParam(effect, value) {
    if (!isTauri) {
        console.log(`🎛️ [Mock] Setting ${effect} to ${value}`);
        return;
    }
    
    try {
        await window.__TAURI__.invoke('set_effect_param', { effect, value });
        console.log(`🎛️ Set ${effect} to ${value}`);
    } catch (error) {
        console.error(`Failed to set ${effect}:`, error);
    }
}

// Override the existing audio functions
window.rustAudio = {
    init: initRustAudio,
    playNote: playNoteRust,
    stopNote: stopNoteRust,
    stopAllNotes: stopAllNotesRust,
    isInitialized: () => isAudioInitialized,
    setEffectParam: setEffectParam
};

// Auto-initialize on load
if (isTauri) {
    window.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            initRustAudio();
        }, 100);
    });
}

console.log('✅ Rust Audio Bridge loaded');