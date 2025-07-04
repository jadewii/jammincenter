/**
 * Performance Monitor - Tracks audio performance metrics
 * Helps identify bottlenecks and performance issues
 */

export class PerformanceMonitor {
    constructor(audioContext) {
        this.audioContext = audioContext;
        this.metrics = {
            renderTime: [],
            nodeCount: 0,
            oscillatorCount: 0,
            cpuUsage: 0,
            memoryUsage: 0,
            dropouts: 0,
            lastDropout: null
        };
        
        this.monitoring = false;
        this.updateInterval = null;
        this.startTime = Date.now();
        
        console.log('📊 PerformanceMonitor initialized');
    }
    
    /**
     * Start monitoring performance
     */
    start() {
        if (this.monitoring) return;
        
        this.monitoring = true;
        this.startTime = Date.now();
        
        // Monitor render quantum (if supported)
        this.monitorRenderQuantum();
        
        // Regular metrics update
        this.updateInterval = setInterval(() => {
            this.updateMetrics();
        }, 1000);
        
        console.log('📊 Performance monitoring started');
    }
    
    /**
     * Stop monitoring
     */
    stop() {
        this.monitoring = false;
        
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        
        console.log('📊 Performance monitoring stopped');
    }
    
    /**
     * Monitor render quantum for dropouts
     */
    monitorRenderQuantum() {
        if (!this.audioContext || typeof this.audioContext.outputLatency === 'undefined') {
            console.warn('⚠️ Render quantum monitoring not supported');
            return;
        }
        
        let lastTime = this.audioContext.currentTime;
        let checkInterval = 100; // Check every 100ms
        
        const checkDropouts = () => {
            if (!this.monitoring) return;
            
            const currentTime = this.audioContext.currentTime;
            const expectedTime = lastTime + (checkInterval / 1000);
            const drift = Math.abs(currentTime - expectedTime);
            
            // If drift is more than 10ms, we likely had a dropout
            if (drift > 0.01) {
                this.metrics.dropouts++;
                this.metrics.lastDropout = Date.now();
                console.warn(`⚠️ Audio dropout detected! Drift: ${(drift * 1000).toFixed(2)}ms`);
            }
            
            lastTime = currentTime;
            
            if (this.monitoring) {
                setTimeout(checkDropouts, checkInterval);
            }
        };
        
        checkDropouts();
    }
    
    /**
     * Update performance metrics
     */
    updateMetrics() {
        // Count active nodes
        this.countActiveNodes();
        
        // Estimate CPU usage (simplified)
        this.estimateCPUUsage();
        
        // Check memory usage if available
        this.checkMemoryUsage();
        
        // Log metrics
        this.logMetrics();
    }
    
    /**
     * Count active audio nodes
     */
    countActiveNodes() {
        // Get node pool stats if available
        if (window.synthEngine && window.synthEngine.nodePool) {
            const poolStats = window.synthEngine.nodePool.getStats();
            this.metrics.nodeCount = Object.values(poolStats).reduce((sum, stat) => sum + stat.inUse, 0);
        }
        
        // Count oscillators
        if (window.synthEngine && window.synthEngine.activeOscillators) {
            this.metrics.oscillatorCount = Object.keys(window.synthEngine.activeOscillators).length;
        }
    }
    
    /**
     * Estimate CPU usage based on audio context load
     */
    estimateCPUUsage() {
        if (!this.audioContext) return;
        
        // Simple estimation based on latency and sample rate
        const baseLatency = this.audioContext.baseLatency || 0.01;
        const outputLatency = this.audioContext.outputLatency || 0.02;
        const totalLatency = baseLatency + outputLatency;
        
        // Higher latency usually means more processing
        // This is a rough estimate
        const cpuEstimate = Math.min(100, (totalLatency * 1000) * this.metrics.oscillatorCount);
        this.metrics.cpuUsage = cpuEstimate;
    }
    
    /**
     * Check memory usage if available
     */
    checkMemoryUsage() {
        if (performance.memory) {
            this.metrics.memoryUsage = Math.round(performance.memory.usedJSHeapSize / 1048576); // MB
        }
    }
    
    /**
     * Log current metrics
     */
    logMetrics() {
        const runtime = Math.floor((Date.now() - this.startTime) / 1000);
        
        console.log(`📊 Performance @ ${runtime}s:`, {
            nodes: this.metrics.nodeCount,
            oscillators: this.metrics.oscillatorCount,
            cpu: `${this.metrics.cpuUsage.toFixed(1)}%`,
            memory: `${this.metrics.memoryUsage}MB`,
            dropouts: this.metrics.dropouts,
            contextState: this.audioContext.state,
            sampleRate: this.audioContext.sampleRate,
            latency: `${((this.audioContext.baseLatency || 0) * 1000).toFixed(2)}ms`
        });
    }
    
    /**
     * Get current performance report
     */
    getReport() {
        return {
            ...this.metrics,
            runtime: Date.now() - this.startTime,
            contextInfo: {
                state: this.audioContext.state,
                sampleRate: this.audioContext.sampleRate,
                baseLatency: this.audioContext.baseLatency,
                outputLatency: this.audioContext.outputLatency
            }
        };
    }
    
    /**
     * Check if performance is degraded
     */
    isPerformanceDegraded() {
        return this.metrics.dropouts > 5 || 
               this.metrics.cpuUsage > 80 ||
               this.metrics.oscillatorCount > 50;
    }
    
    /**
     * Get performance recommendations
     */
    getRecommendations() {
        const recommendations = [];
        
        if (this.metrics.dropouts > 5) {
            recommendations.push('Consider increasing buffer size to reduce dropouts');
        }
        
        if (this.metrics.oscillatorCount > 30) {
            recommendations.push('High oscillator count detected. Consider implementing voice stealing');
        }
        
        if (this.metrics.cpuUsage > 80) {
            recommendations.push('High CPU usage. Disable some effects or reduce polyphony');
        }
        
        if (this.metrics.memoryUsage > 100) {
            recommendations.push('High memory usage. Clear unused samples or reduce node pool size');
        }
        
        return recommendations;
    }
}

// Singleton instance
let monitorInstance = null;

/**
 * Get or create performance monitor
 */
export function getPerformanceMonitor(audioContext) {
    if (!monitorInstance && audioContext) {
        monitorInstance = new PerformanceMonitor(audioContext);
    }
    return monitorInstance;
}

/**
 * Start performance monitoring
 */
export function startMonitoring(audioContext) {
    const monitor = getPerformanceMonitor(audioContext);
    if (monitor) {
        monitor.start();
    }
}

/**
 * Get performance report
 */
export function getPerformanceReport() {
    if (monitorInstance) {
        return monitorInstance.getReport();
    }
    return null;
}