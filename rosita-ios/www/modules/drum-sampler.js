/**
 * Drum Sampler Module - Handles loading and playing drum samples
 */
class DrumSampler {
    constructor(audioContext) {
        this.audioContext = audioContext;
        this.buffers = {};
        this.currentKit = 1;
        this.kits = {
            1: 'kit 1',
            2: 'kit 2', 
            3: 'kit 3',
            4: 'kit 4'
        };
        
        // Define the drum mapping (row index to sample type)
        this.drumMap = [
            'kick',   // Row 0
            'snare',  // Row 1
            'hat1',   // Row 2
            'hat2',   // Row 3
            'perc1',  // Row 4
            'perc2',  // Row 5
            'perc3',  // Row 6
            'perc4',  // Row 7
            'extra1', // Row 8
            'extra2', // Row 9
            'extra3', // Row 10
            'extra4'  // Row 11
        ];
        
        this.loadCurrentKit();
    }
    
    async loadAudioBuffer(url) {
        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            return audioBuffer;
        } catch (error) {
            console.error('Error loading audio file:', url, error);
            return null;
        }
    }
    
    async loadCurrentKit() {
        const kitFolder = this.kits[this.currentKit];
        const kitPath = `samples/${kitFolder}`;
        
        // Clear previous buffers
        this.buffers = {};
        
        console.log(`Loading drum kit: ${kitFolder} from ${kitPath}`);
        
        // Get list of files in the kit folder
        try {
            // For each kit, we'll map files to our drum types
            const fileMappings = {
                'kit 1': {
                    'kick': 'FB Kick 1.wav',
                    'snare': 'FB Snare 6.wav',
                    'hat1': 'FB Hat 1.wav',
                    'hat2': 'FB Hat 5.wav',
                    'perc1': 'FB Perc 1.wav',
                    'perc2': 'FB Perc 2.wav',
                    'perc3': 'FB Perc 3.wav',
                    'perc4': 'FB Perc 4.wav',
                    'extra1': 'FB Kick 2.wav',
                    'extra2': 'FB Snare 1.wav',
                    'extra3': 'FB Hat 8.wav',
                    'extra4': 'FB Perc 5.wav'
                },
                'kit 2': {
                    'kick': 'FB Kick 2.wav',
                    'snare': 'FB Snare 3.wav',
                    'hat1': 'FB Hat 2.wav',
                    'hat2': 'FB Hat 6.wav',
                    'perc1': 'FB Perc 5.wav',
                    'perc2': 'FB Perc 6.wav',
                    'perc3': 'FB Perc 7.wav',
                    'perc4': 'FB Perc 8.wav',
                    'extra1': 'FB Kick 3.wav',
                    'extra2': 'FB Snare 2.wav',
                    'extra3': 'FB Hat 7.wav',
                    'extra4': 'FB Perc 1.wav'
                },
                'kit 3': {
                    'kick': 'FB Kick 3.wav',
                    'snare': 'FB Snare 1.wav',
                    'hat1': 'FB Hat 3.wav',
                    'hat2': 'FB Hat 7.wav',
                    'perc1': 'MH1.wav',
                    'perc2': 'MH2.wav',
                    'perc3': 'MH3.wav',
                    'perc4': 'MH4.wav',
                    'extra1': 'MH16.wav',
                    'extra2': 'MH17.wav',
                    'extra3': 'MH21.wav',
                    'extra4': 'MH22.wav'
                },
                'kit 4': {
                    'kick': 'FB Kick 8.wav',
                    'snare': 'FB Snare 2.wav',
                    'hat1': 'FB Hat 4.wav',
                    'hat2': 'FB Hat 8.wav',
                    'perc1': 'MH16.wav',
                    'perc2': 'MH17.wav',
                    'perc3': 'MH21.wav',
                    'perc4': 'MH22.wav',
                    'extra1': 'FB Kick 1.wav',
                    'extra2': 'FB Snare 6.wav',
                    'extra3': 'FB Hat 1.wav',
                    'extra4': 'MH1.wav'
                }
            };
            
            const mapping = fileMappings[kitFolder];
            
            // Load each mapped file
            for (const [drumType, fileName] of Object.entries(mapping)) {
                const url = `${kitPath}/${fileName}`;
                console.log(`Loading ${drumType}: ${url}`);
                const buffer = await this.loadAudioBuffer(url);
                if (buffer) {
                    this.buffers[drumType] = buffer;
                    console.log(`✅ Loaded ${drumType}`);
                } else {
                    console.error(`❌ Failed to load ${drumType} from ${url}`);
                }
            }
            
            console.log(`Loaded drum kit ${this.currentKit}:`, Object.keys(this.buffers));
            
        } catch (error) {
            console.error('Error loading drum kit:', error);
        }
    }
    
    playDrum(rowIndex, velocity = 1.0) {
        console.log(`playDrum called for row ${rowIndex}`);
        const drumType = this.drumMap[rowIndex];
        if (!drumType || !this.buffers[drumType]) {
            console.warn(`No drum sample for row ${rowIndex} (${drumType})`);
            console.log('Available drums:', Object.keys(this.buffers));
            return;
        }
        console.log(`Playing ${drumType} drum sound`);
        
        const buffer = this.buffers[drumType];
        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();
        
        source.buffer = buffer;
        source.connect(gainNode);
        // Route through effects processor if available (from global synthEngine)
        if (window.synthEngine && window.synthEngine.effectsProcessor && window.synthEngine.effectsProcessor.inputGain) {
            console.log('🥁 DrumSampler routing through effects');
            gainNode.connect(window.synthEngine.effectsProcessor.inputGain);
        } else {
            console.log('⚠️ DrumSampler connecting directly (no effects)');
            gainNode.connect(this.audioContext.destination);
        }
        
        // Apply velocity
        gainNode.gain.setValueAtTime(velocity * 0.8, this.audioContext.currentTime);
        
        source.start();
    }
    
    async cycleKit() {
        this.currentKit = (this.currentKit % 4) + 1;
        await this.loadCurrentKit();
        return this.currentKit;
    }
    
    getCurrentKitName() {
        return `Kit ${this.currentKit}`;
    }
}

export default DrumSampler;