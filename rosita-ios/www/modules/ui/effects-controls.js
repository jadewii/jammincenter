/**
 * Effects Controls UI Module
 * Provides user interface for controlling audio effects
 */

export default class EffectsControls {
    constructor(synthEngine) {
        this.synthEngine = synthEngine;
        this.container = null;
        this.effectElements = {};
        
        console.log('🎛️ EffectsControls created');
    }
    
    initialize() {
        console.log('🎛️ Initializing effects controls...');
        
        // Find or create container
        this.container = document.getElementById('effects-controls');
        if (!this.container) {
            console.warn('⚠️ No effects-controls container found, creating one...');
            this.createContainer();
        }
        
        // Create UI elements
        this.createEffectsUI();
        
        // Set up event listeners
        this.setupEventListeners();
        
        console.log('✅ Effects controls initialized');
    }
    
    createContainer() {
        // Create a container div and add it to the page
        this.container = document.createElement('div');
        this.container.id = 'effects-controls';
        this.container.className = 'effects-controls-panel';
        
        // Try to find a suitable parent element
        const controlsArea = document.querySelector('.controls-area') || 
                           document.querySelector('.synth-controls') ||
                           document.body;
        
        controlsArea.appendChild(this.container);
    }
    
    createEffectsUI() {
        const effects = ['reverb', 'delay', 'filter', 'distortion'];
        
        // Create title
        const title = document.createElement('h3');
        title.textContent = 'Effects';
        title.className = 'effects-title';
        this.container.appendChild(title);
        
        // Create effects grid
        const effectsGrid = document.createElement('div');
        effectsGrid.className = 'effects-grid';
        
        effects.forEach(effectName => {
            const effectPanel = this.createEffectPanel(effectName);
            effectsGrid.appendChild(effectPanel);
            this.effectElements[effectName] = effectPanel;
        });
        
        this.container.appendChild(effectsGrid);
        
        // Add CSS if not already present
        this.injectStyles();
    }
    
    createEffectPanel(effectName) {
        const panel = document.createElement('div');
        panel.className = 'effect-panel';
        panel.dataset.effect = effectName;
        
        // Effect header with toggle
        const header = document.createElement('div');
        header.className = 'effect-header';
        
        const toggle = document.createElement('input');
        toggle.type = 'checkbox';
        toggle.id = `${effectName}-toggle`;
        toggle.className = 'effect-toggle';
        
        const label = document.createElement('label');
        label.htmlFor = `${effectName}-toggle`;
        label.textContent = effectName.charAt(0).toUpperCase() + effectName.slice(1);
        label.className = 'effect-label';
        
        header.appendChild(toggle);
        header.appendChild(label);
        panel.appendChild(header);
        
        // Effect controls
        const controls = document.createElement('div');
        controls.className = 'effect-controls';
        
        // Add specific controls for each effect
        switch (effectName) {
            case 'reverb':
                controls.appendChild(this.createSlider('reverb-wetness', 'Mix', 0, 100, 30));
                controls.appendChild(this.createSlider('reverb-roomSize', 'Room', 0, 100, 70));
                controls.appendChild(this.createSlider('reverb-decay', 'Decay', 0.5, 5, 2, 0.1));
                break;
                
            case 'delay':
                controls.appendChild(this.createSlider('delay-time', 'Time', 0, 1000, 250, 10, 'ms'));
                controls.appendChild(this.createSlider('delay-feedback', 'Feedback', 0, 90, 30, 1, '%'));
                controls.appendChild(this.createSlider('delay-wetness', 'Mix', 0, 100, 30));
                break;
                
            case 'filter':
                controls.appendChild(this.createSelect('filter-type', 'Type', [
                    { value: 'lowpass', label: 'Low Pass' },
                    { value: 'highpass', label: 'High Pass' },
                    { value: 'bandpass', label: 'Band Pass' },
                    { value: 'notch', label: 'Notch' }
                ]));
                controls.appendChild(this.createSlider('filter-frequency', 'Freq', 20, 20000, 2000, 10, 'Hz'));
                controls.appendChild(this.createSlider('filter-resonance', 'Q', 0.1, 30, 1, 0.1));
                break;
                
            case 'distortion':
                controls.appendChild(this.createSlider('distortion-amount', 'Drive', 0, 100, 20));
                break;
        }
        
        panel.appendChild(controls);
        return panel;
    }
    
    createSlider(id, label, min, max, defaultValue, step = 1, unit = '%') {
        const container = document.createElement('div');
        container.className = 'slider-container';
        
        const labelEl = document.createElement('label');
        labelEl.htmlFor = id;
        labelEl.textContent = label;
        labelEl.className = 'slider-label';
        
        const slider = document.createElement('input');
        slider.type = 'range';
        slider.id = id;
        slider.min = min;
        slider.max = max;
        slider.value = defaultValue;
        slider.step = step;
        slider.className = 'effect-slider';
        
        const value = document.createElement('span');
        value.className = 'slider-value';
        value.textContent = `${defaultValue}${unit}`;
        
        // Update value display
        slider.addEventListener('input', () => {
            value.textContent = `${slider.value}${unit}`;
        });
        
        container.appendChild(labelEl);
        container.appendChild(slider);
        container.appendChild(value);
        
        return container;
    }
    
    createSelect(id, label, options) {
        const container = document.createElement('div');
        container.className = 'select-container';
        
        const labelEl = document.createElement('label');
        labelEl.htmlFor = id;
        labelEl.textContent = label;
        labelEl.className = 'select-label';
        
        const select = document.createElement('select');
        select.id = id;
        select.className = 'effect-select';
        
        options.forEach(option => {
            const optionEl = document.createElement('option');
            optionEl.value = option.value;
            optionEl.textContent = option.label;
            select.appendChild(optionEl);
        });
        
        container.appendChild(labelEl);
        container.appendChild(select);
        
        return container;
    }
    
    setupEventListeners() {
        // Effect toggles
        this.container.querySelectorAll('.effect-toggle').forEach(toggle => {
            toggle.addEventListener('change', (e) => {
                const effectName = e.target.id.replace('-toggle', '');
                this.handleEffectToggle(effectName, e.target.checked);
            });
        });
        
        // Reverb controls
        this.setupSliderListener('reverb-wetness', 'reverb', 'wetness', 0.01);
        this.setupSliderListener('reverb-roomSize', 'reverb', 'roomSize', 0.01);
        this.setupSliderListener('reverb-decay', 'reverb', 'decay', 1);
        
        // Delay controls
        this.setupSliderListener('delay-time', 'delay', 'time', 0.001);
        this.setupSliderListener('delay-feedback', 'delay', 'feedback', 0.01);
        this.setupSliderListener('delay-wetness', 'delay', 'wetness', 0.01);
        
        // Filter controls
        this.setupSliderListener('filter-frequency', 'filter', 'frequency', 1);
        this.setupSliderListener('filter-resonance', 'filter', 'resonance', 1);
        
        const filterType = document.getElementById('filter-type');
        if (filterType) {
            filterType.addEventListener('change', (e) => {
                this.synthEngine.setEffectParam('filter', 'type', e.target.value);
            });
        }
        
        // Distortion controls
        this.setupSliderListener('distortion-amount', 'distortion', 'amount', 1);
    }
    
    setupSliderListener(sliderId, effectName, paramName, multiplier = 1) {
        const slider = document.getElementById(sliderId);
        if (slider) {
            slider.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value) * multiplier;
                this.synthEngine.setEffectParam(effectName, paramName, value);
            });
        }
    }
    
    handleEffectToggle(effectName, enabled) {
        console.log(`${enabled ? '🔊' : '🔇'} ${effectName} effect ${enabled ? 'enabled' : 'disabled'}`);
        
        // Enable/disable the effect
        this.synthEngine.setEffect(effectName, enabled);
        
        // Update UI state
        const panel = this.effectElements[effectName];
        if (panel) {
            panel.classList.toggle('active', enabled);
        }
    }
    
    injectStyles() {
        if (document.getElementById('effects-controls-styles')) {
            return; // Styles already injected
        }
        
        const styles = document.createElement('style');
        styles.id = 'effects-controls-styles';
        styles.textContent = `
            .effects-controls-panel {
                background: rgba(255, 255, 255, 0.1);
                border-radius: 10px;
                padding: 15px;
                margin: 10px 0;
                backdrop-filter: blur(10px);
            }
            
            .effects-title {
                color: #fff;
                margin: 0 0 15px 0;
                font-size: 18px;
                text-align: center;
            }
            
            .effects-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 15px;
            }
            
            .effect-panel {
                background: rgba(0, 0, 0, 0.3);
                border-radius: 8px;
                padding: 10px;
                transition: all 0.3s ease;
                opacity: 0.7;
            }
            
            .effect-panel.active {
                opacity: 1;
                box-shadow: 0 0 10px rgba(255, 105, 180, 0.5);
            }
            
            .effect-header {
                display: flex;
                align-items: center;
                margin-bottom: 10px;
            }
            
            .effect-toggle {
                margin-right: 8px;
            }
            
            .effect-label {
                color: #fff;
                font-weight: bold;
                font-size: 14px;
            }
            
            .effect-controls {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            
            .slider-container, .select-container {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .slider-label, .select-label {
                color: #ccc;
                font-size: 12px;
                width: 50px;
            }
            
            .effect-slider {
                flex: 1;
                height: 4px;
                background: rgba(255, 255, 255, 0.2);
                outline: none;
                -webkit-appearance: none;
            }
            
            .effect-slider::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                width: 12px;
                height: 12px;
                background: #ff69b4;
                cursor: pointer;
                border-radius: 50%;
            }
            
            .slider-value {
                color: #fff;
                font-size: 11px;
                min-width: 40px;
                text-align: right;
            }
            
            .effect-select {
                flex: 1;
                background: rgba(0, 0, 0, 0.5);
                color: #fff;
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 4px;
                padding: 4px;
                font-size: 12px;
            }
        `;
        
        document.head.appendChild(styles);
    }
}