/**
 * Audio Node Pool - Manages reusable audio nodes to reduce garbage collection
 * This significantly improves performance by reusing nodes instead of creating new ones
 * 
 * @module AudioNodePool
 */

export class AudioNodePool {
    constructor(audioContext, poolSize = 50) {
        this.audioContext = audioContext;
        this.poolSize = poolSize;
        
        // Initialize pools for different node types
        this.pools = {
            gain: {
                available: [],
                inUse: new Set(),
                factory: () => this.createGainNode()
            },
            filter: {
                available: [],
                inUse: new Set(),
                factory: () => this.createFilterNode()
            },
            oscillator: {
                available: [],
                inUse: new Set(),
                factory: () => this.createOscillatorNode()
            },
            bufferSource: {
                available: [],
                inUse: new Set(),
                factory: () => this.createBufferSourceNode()
            }
        };
        
        // Pre-populate pools
        this.initializePools();
        
        console.log('🏊 AudioNodePool initialized with pool size:', poolSize);
    }
    
    /**
     * Pre-populate all pools with nodes
     */
    initializePools() {
        console.log('🏊 Pre-populating audio node pools...');
        
        // Create initial gain nodes
        for (let i = 0; i < this.poolSize; i++) {
            this.pools.gain.available.push(this.createGainNode());
        }
        
        // Create initial filter nodes
        for (let i = 0; i < Math.floor(this.poolSize / 2); i++) {
            this.pools.filter.available.push(this.createFilterNode());
        }
        
        console.log('✅ Audio node pools initialized');
    }
    
    /**
     * Create a new gain node with default settings
     */
    createGainNode() {
        const node = this.audioContext.createGain();
        node.gain.value = 1.0;
        node._poolType = 'gain';
        node._isFromPool = true;
        return node;
    }
    
    /**
     * Create a new filter node with default settings
     */
    createFilterNode() {
        const node = this.audioContext.createBiquadFilter();
        node.type = 'lowpass';
        node.frequency.value = 22050; // Nyquist frequency
        node.Q.value = 1;
        node._poolType = 'filter';
        node._isFromPool = true;
        return node;
    }
    
    /**
     * Create a new oscillator node
     * Note: Oscillators can't be reused after stopping, so we create fresh ones
     */
    createOscillatorNode() {
        const node = this.audioContext.createOscillator();
        node.type = 'sine';
        node.frequency.value = 440;
        node._poolType = 'oscillator';
        node._isFromPool = true;
        return node;
    }
    
    /**
     * Create a new buffer source node
     * Note: Buffer sources can't be reused after stopping, so we create fresh ones
     */
    createBufferSourceNode() {
        const node = this.audioContext.createBufferSource();
        node._poolType = 'bufferSource';
        node._isFromPool = true;
        return node;
    }
    
    /**
     * Get a node from the pool
     * @param {string} type - Type of node (gain, filter, oscillator, bufferSource)
     * @returns {AudioNode} The requested node
     */
    acquire(type) {
        const pool = this.pools[type];
        if (!pool) {
            console.error(`❌ Unknown node type: ${type}`);
            return null;
        }
        
        let node;
        
        // For reusable nodes (gain, filter), try to get from pool
        if (type === 'gain' || type === 'filter') {
            if (pool.available.length > 0) {
                node = pool.available.pop();
                console.log(`♻️ Reusing ${type} node from pool (${pool.available.length} remaining)`);
            } else {
                // Pool is empty, create a new one
                node = pool.factory();
                console.warn(`⚠️ ${type} pool exhausted, creating new node`);
            }
            
            // Reset node to default state
            this.resetNode(node, type);
            pool.inUse.add(node);
        } else {
            // For one-time use nodes (oscillator, bufferSource), always create new
            node = pool.factory();
            pool.inUse.add(node);
        }
        
        return node;
    }
    
    /**
     * Return a node to the pool for reuse
     * @param {AudioNode} node - The node to return
     */
    release(node) {
        if (!node || !node._isFromPool) {
            return;
        }
        
        const type = node._poolType;
        const pool = this.pools[type];
        
        if (!pool || !pool.inUse.has(node)) {
            return;
        }
        
        pool.inUse.delete(node);
        
        // Only reusable nodes go back to the pool
        if (type === 'gain' || type === 'filter') {
            // Disconnect all connections
            try {
                node.disconnect();
            } catch (e) {
                // Node might already be disconnected
            }
            
            // Reset and return to pool if under limit
            if (pool.available.length < this.poolSize) {
                this.resetNode(node, type);
                pool.available.push(node);
                console.log(`♻️ Returned ${type} node to pool (${pool.available.length} available)`);
            }
        }
    }
    
    /**
     * Reset a node to its default state
     */
    resetNode(node, type) {
        switch (type) {
            case 'gain':
                node.gain.cancelScheduledValues(this.audioContext.currentTime);
                node.gain.value = 1.0;
                break;
                
            case 'filter':
                node.frequency.cancelScheduledValues(this.audioContext.currentTime);
                node.Q.cancelScheduledValues(this.audioContext.currentTime);
                node.gain.cancelScheduledValues(this.audioContext.currentTime);
                node.detune.cancelScheduledValues(this.audioContext.currentTime);
                
                node.type = 'lowpass';
                node.frequency.value = 22050;
                node.Q.value = 1;
                node.gain.value = 0;
                node.detune.value = 0;
                break;
        }
    }
    
    /**
     * Get pool statistics for debugging
     */
    getStats() {
        const stats = {};
        for (const [type, pool] of Object.entries(this.pools)) {
            stats[type] = {
                available: pool.available.length,
                inUse: pool.inUse.size,
                total: pool.available.length + pool.inUse.size
            };
        }
        return stats;
    }
    
    /**
     * Clean up all pools
     */
    cleanup() {
        console.log('🧹 Cleaning up audio node pools...');
        
        for (const [type, pool] of Object.entries(this.pools)) {
            // Disconnect all nodes
            [...pool.available, ...pool.inUse].forEach(node => {
                try {
                    node.disconnect();
                } catch (e) {
                    // Ignore disconnect errors
                }
            });
            
            // Clear pools
            pool.available = [];
            pool.inUse.clear();
        }
        
        console.log('✅ Audio node pools cleaned up');
    }
}

// Singleton instance
let nodePoolInstance = null;

/**
 * Get or create the node pool instance
 * @param {AudioContext} audioContext - The audio context to use
 * @returns {AudioNodePool} The node pool instance
 */
export function getNodePool(audioContext) {
    if (!nodePoolInstance && audioContext) {
        nodePoolInstance = new AudioNodePool(audioContext);
    }
    return nodePoolInstance;
}

/**
 * Helper function to acquire a gain node
 */
export function acquireGainNode(audioContext) {
    const pool = getNodePool(audioContext);
    return pool ? pool.acquire('gain') : audioContext.createGain();
}

/**
 * Helper function to acquire a filter node
 */
export function acquireFilterNode(audioContext) {
    const pool = getNodePool(audioContext);
    return pool ? pool.acquire('filter') : audioContext.createBiquadFilter();
}

/**
 * Helper function to release any pooled node
 */
export function releaseNode(node) {
    if (nodePoolInstance) {
        nodePoolInstance.release(node);
    }
}