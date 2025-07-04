/**
 * Audio Context Manager - Ensures single global AudioContext across iframe boundaries
 * Handles buffer size optimization and context lifecycle
 * 
 * @module AudioContextManager
 */

class AudioContextManager {
    constructor() {
        this.context = null;
        this.isInitialized = false;
        this.bufferSize = null;
        this.contextId = `rosita-audio-${Date.now()}`;
        
        // Check if we're in an iframe
        this.isIframe = window.self !== window.top;
        
        console.log(`🎵 AudioContextManager created (iframe: ${this.isIframe})`);
    }
    
    /**
     * Get or create the audio context with optimized settings
     * @param {Object} options - Configuration options
     * @returns {AudioContext} The audio context
     */
    getContext(options = {}) {
        // If we already have a context, return it
        if (this.context && this.context.state !== 'closed') {
            console.log('♻️ Reusing existing AudioContext');
            return this.context;
        }
        
        // Check for existing context in parent frame (if in iframe)
        if (this.isIframe) {
            try {
                // Try to get context from parent window
                if (window.parent.rositaAudioContext && 
                    window.parent.rositaAudioContext.state !== 'closed') {
                    console.log('♻️ Using parent frame AudioContext');
                    this.context = window.parent.rositaAudioContext;
                    this.isInitialized = true;
                    return this.context;
                }
            } catch (e) {
                console.warn('⚠️ Cannot access parent frame:', e);
            }
        }
        
        // Create new optimized context
        this.context = this.createOptimizedContext(options);
        
        // Store reference for iframe access
        if (this.isIframe) {
            try {
                window.parent.rositaAudioContext = this.context;
            } catch (e) {
                console.warn('⚠️ Cannot store context in parent frame:', e);
            }
        }
        
        // Also store locally
        window.rositaAudioContext = this.context;
        
        return this.context;
    }
    
    /**
     * Create an optimized audio context with best settings for low latency
     */
    createOptimizedContext(options = {}) {
        console.log('🔧 Creating optimized AudioContext...');
        
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        
        // Determine optimal buffer size based on platform
        const optimalBufferSize = this.getOptimalBufferSize();
        
        // Context options for low latency
        const contextOptions = {
            latencyHint: options.latencyHint || 'interactive',
            sampleRate: options.sampleRate || 44100,
            ...options
        };
        
        // Some browsers support setting the buffer size directly
        if (optimalBufferSize && !options.skipBufferOptimization) {
            contextOptions.latencyHint = optimalBufferSize / contextOptions.sampleRate;
        }
        
        try {
            this.context = new AudioContextClass(contextOptions);
            
            // Log actual values
            console.log('✅ AudioContext created:', {
                sampleRate: this.context.sampleRate,
                baseLatency: this.context.baseLatency,
                outputLatency: this.context.outputLatency,
                state: this.context.state,
                contextId: this.contextId
            });
            
            // Set up state change monitoring
            this.context.addEventListener('statechange', () => {
                console.log(`🔄 AudioContext state changed to: ${this.context.state}`);
                
                // Auto-resume if suspended
                if (this.context.state === 'suspended') {
                    console.log('🔄 Auto-resuming suspended context...');
                    this.resume();
                }
            });
            
            // Resume context immediately if needed
            if (this.context.state === 'suspended') {
                this.resume();
            }
            
            this.isInitialized = true;
            this.bufferSize = optimalBufferSize;
            
            return this.context;
            
        } catch (error) {
            console.error('❌ Failed to create AudioContext:', error);
            throw error;
        }
    }
    
    /**
     * Determine optimal buffer size based on platform and capabilities
     */
    getOptimalBufferSize() {
        // Check if we're on a mobile device
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        // Check system performance
        const cores = navigator.hardwareConcurrency || 4;
        const memory = navigator.deviceMemory || 4; // GB
        
        console.log(`📊 System info - Cores: ${cores}, Memory: ${memory}GB, Mobile: ${isMobile}`);
        
        // Buffer size recommendations:
        // - 256: Ultra-low latency, high CPU usage (good for powerful desktop)
        // - 512: Low latency, moderate CPU (good balance for most systems)
        // - 1024: Standard latency, low CPU (mobile or weak systems)
        // - 2048: High latency, minimal CPU (fallback for very weak systems)
        
        let bufferSize;
        
        if (isMobile) {
            // Mobile devices need larger buffers to prevent crackling
            bufferSize = memory >= 4 ? 1024 : 2048;
        } else {
            // Desktop can handle smaller buffers
            if (cores >= 8 && memory >= 8) {
                bufferSize = 256; // High-end system
            } else if (cores >= 4 && memory >= 4) {
                bufferSize = 512; // Mid-range system
            } else {
                bufferSize = 1024; // Low-end system
            }
        }
        
        console.log(`🎯 Optimal buffer size determined: ${bufferSize} samples`);
        return bufferSize;
    }
    
    /**
     * Resume the audio context if suspended
     */
    async resume() {
        if (!this.context) {
            console.warn('⚠️ No audio context to resume');
            return false;
        }
        
        if (this.context.state === 'running') {
            console.log('✅ Audio context already running');
            return true;
        }
        
        try {
            console.log('▶️ Resuming audio context...');
            await this.context.resume();
            console.log('✅ Audio context resumed successfully');
            return true;
        } catch (error) {
            console.error('❌ Failed to resume audio context:', error);
            return false;
        }
    }
    
    /**
     * Suspend the audio context to save resources
     */
    async suspend() {
        if (!this.context || this.context.state !== 'running') {
            return;
        }
        
        try {
            console.log('⏸️ Suspending audio context...');
            await this.context.suspend();
            console.log('✅ Audio context suspended');
        } catch (error) {
            console.error('❌ Failed to suspend audio context:', error);
        }
    }
    
    /**
     * Get current context statistics
     */
    getStats() {
        if (!this.context) {
            return null;
        }
        
        return {
            contextId: this.contextId,
            state: this.context.state,
            sampleRate: this.context.sampleRate,
            currentTime: this.context.currentTime,
            baseLatency: this.context.baseLatency || 'N/A',
            outputLatency: this.context.outputLatency || 'N/A',
            bufferSize: this.bufferSize,
            isIframe: this.isIframe
        };
    }
    
    /**
     * Close and cleanup the audio context
     */
    async close() {
        if (!this.context) {
            return;
        }
        
        try {
            console.log('🔚 Closing audio context...');
            await this.context.close();
            this.context = null;
            this.isInitialized = false;
            
            // Clear references
            if (window.rositaAudioContext) {
                delete window.rositaAudioContext;
            }
            if (this.isIframe && window.parent.rositaAudioContext) {
                try {
                    delete window.parent.rositaAudioContext;
                } catch (e) {
                    // Ignore cross-origin errors
                }
            }
            
            console.log('✅ Audio context closed');
        } catch (error) {
            console.error('❌ Failed to close audio context:', error);
        }
    }
}

// Singleton instance
let contextManager = null;

/**
 * Get the audio context manager instance
 */
export function getContextManager() {
    if (!contextManager) {
        contextManager = new AudioContextManager();
    }
    return contextManager;
}

/**
 * Get the optimized audio context
 */
export function getAudioContext(options = {}) {
    const manager = getContextManager();
    return manager.getContext(options);
}

/**
 * Resume audio context (useful for user interaction requirements)
 */
export async function resumeAudioContext() {
    const manager = getContextManager();
    return manager.resume();
}

/**
 * Get context statistics for debugging
 */
export function getContextStats() {
    const manager = getContextManager();
    return manager.getStats();
}

// Auto-resume on user interaction
if (typeof document !== 'undefined') {
    ['click', 'touchstart', 'keydown'].forEach(eventType => {
        document.addEventListener(eventType, async () => {
            const manager = getContextManager();
            if (manager.context && manager.context.state === 'suspended') {
                await manager.resume();
            }
        }, { once: true });
    });
}