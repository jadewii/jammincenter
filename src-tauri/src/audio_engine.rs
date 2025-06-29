use rodio::{OutputStream, OutputStreamHandle, Sink, Source};
use std::sync::{Arc, Mutex, RwLock};
use std::collections::HashMap;
use std::f32::consts::PI;
use std::time::Duration;
use std::collections::VecDeque;

// Simple sine wave generator
struct SineWave {
    freq: f32,
    num_samples: usize,
    sample_rate: u32,
    current_sample: usize,
}

impl SineWave {
    fn new(freq: f32, duration: Duration) -> SineWave {
        let sample_rate = 44100;
        let num_samples = (sample_rate as f32 * duration.as_secs_f32()) as usize;
        SineWave {
            freq,
            num_samples,
            sample_rate,
            current_sample: 0,
        }
    }
}

impl Iterator for SineWave {
    type Item = f32;

    fn next(&mut self) -> Option<f32> {
        if self.current_sample >= self.num_samples {
            None
        } else {
            let time = self.current_sample as f32 / self.sample_rate as f32;
            let sample = (time * self.freq * 2.0 * PI).sin();
            self.current_sample += 1;
            Some(sample)
        }
    }
}

impl Source for SineWave {
    fn current_frame_len(&self) -> Option<usize> {
        None
    }

    fn channels(&self) -> u16 {
        1
    }

    fn sample_rate(&self) -> u32 {
        self.sample_rate
    }

    fn total_duration(&self) -> Option<Duration> {
        Some(Duration::from_secs_f32(self.num_samples as f32 / self.sample_rate as f32))
    }
}

// Simple effect processor with delay
struct EffectProcessor<S: Source<Item = f32>> {
    source: S,
    delay_buffer: VecDeque<f32>,
    delay_amount: f32,
    reverb_amount: f32,
    saturation_amount: f32,
    sample_rate: u32,
}

impl<S: Source<Item = f32>> EffectProcessor<S> {
    fn new(source: S, delay_amount: f32, reverb_amount: f32, saturation_amount: f32) -> Self {
        let sample_rate = source.sample_rate();
        let delay_samples = (sample_rate as f32 * 0.25) as usize; // 250ms delay
        let mut delay_buffer = VecDeque::with_capacity(delay_samples);
        
        // Fill delay buffer with silence
        for _ in 0..delay_samples {
            delay_buffer.push_back(0.0);
        }
        
        EffectProcessor {
            source,
            delay_buffer,
            delay_amount,
            reverb_amount,
            saturation_amount,
            sample_rate,
        }
    }
}

impl<S: Source<Item = f32>> Iterator for EffectProcessor<S> {
    type Item = f32;
    
    fn next(&mut self) -> Option<f32> {
        if let Some(sample) = self.source.next() {
            // Get delayed sample
            let delayed = self.delay_buffer.pop_front().unwrap_or(0.0);
            
            // Mix dry and delayed signal
            let wet = sample + (delayed * self.delay_amount);
            
            // Add to delay buffer (with feedback)
            self.delay_buffer.push_back(wet * 0.5);
            
            // Simple reverb simulation (just more delay taps)
            let reverb = if self.reverb_amount > 0.0 {
                let reverb_delay = (self.delay_buffer.len() / 3).max(1);
                let reverb_sample = self.delay_buffer.get(reverb_delay).copied().unwrap_or(0.0);
                reverb_sample * self.reverb_amount * 0.3
            } else {
                0.0
            };
            
            // Apply saturation (soft clipping)
            let mut output = wet + reverb;
            if self.saturation_amount > 0.0 {
                let drive = 1.0 + (self.saturation_amount * 4.0);
                output = (output * drive).tanh() / drive.tanh();
            }
            
            Some(output.clamp(-1.0, 1.0))
        } else {
            None
        }
    }
}

impl<S: Source<Item = f32>> Source for EffectProcessor<S> {
    fn current_frame_len(&self) -> Option<usize> {
        self.source.current_frame_len()
    }
    
    fn channels(&self) -> u16 {
        self.source.channels()
    }
    
    fn sample_rate(&self) -> u32 {
        self.source.sample_rate()
    }
    
    fn total_duration(&self) -> Option<Duration> {
        self.source.total_duration()
    }
}

// Global effect parameters
#[derive(Clone)]
pub struct EffectParams {
    pub delay_amount: f32,
    pub delay_time: f32,
    pub reverb_amount: f32,
    pub chorus_amount: f32,
    pub saturation_amount: f32,
}

impl Default for EffectParams {
    fn default() -> Self {
        EffectParams {
            delay_amount: 0.0,
            delay_time: 0.25,
            reverb_amount: 0.0,
            chorus_amount: 0.0,
            saturation_amount: 0.0,
        }
    }
}

pub struct AudioEngine {
    _stream: OutputStream,
    stream_handle: OutputStreamHandle,
    active_notes: Arc<Mutex<HashMap<String, Sink>>>,
    effects: Arc<RwLock<EffectParams>>,
}

// Make AudioEngine thread-safe
unsafe impl Send for AudioEngine {}
unsafe impl Sync for AudioEngine {}

impl AudioEngine {
    pub fn new() -> Result<Self, Box<dyn std::error::Error>> {
        let (_stream, stream_handle) = OutputStream::try_default()?;
        
        Ok(AudioEngine {
            _stream,
            stream_handle,
            active_notes: Arc::new(Mutex::new(HashMap::new())),
            effects: Arc::new(RwLock::new(EffectParams::default())),
        })
    }
    
    pub fn play_note(&self, note_id: String, frequency: f32, instrument: u8, volume: f32) -> Result<(), Box<dyn std::error::Error>> {
        // Create sink first
        let sink = Sink::try_new(&self.stream_handle)?;
        
        // Create and append appropriate oscillator based on instrument
        let source: Box<dyn Source<Item = f32> + Send> = match instrument {
            1 => self.create_synth_oscillator(frequency, volume),
            2 => self.create_bass_oscillator(frequency, volume),
            3 => self.create_keys_oscillator(frequency, volume),
            4 => self.create_drum_sound(frequency, volume),
            _ => self.create_synth_oscillator(frequency, volume),
        };
        
        sink.append(source);
        
        // Store the sink
        let mut notes = self.active_notes.lock().unwrap();
        notes.insert(note_id, sink);
        
        Ok(())
    }
    
    pub fn stop_note(&self, note_id: String) -> Result<(), Box<dyn std::error::Error>> {
        let mut notes = self.active_notes.lock().unwrap();
        if let Some(sink) = notes.remove(&note_id) {
            // Fade out quickly
            sink.set_volume(0.0);
            sink.sleep_until_end();
        }
        Ok(())
    }
    
    pub fn stop_all_notes(&self) -> Result<(), Box<dyn std::error::Error>> {
        let mut notes = self.active_notes.lock().unwrap();
        for (_, sink) in notes.drain() {
            sink.set_volume(0.0);
            sink.stop();
        }
        Ok(())
    }
    
    // Create a synth oscillator with effects
    fn create_synth_oscillator(&self, frequency: f32, volume: f32) -> Box<dyn Source<Item = f32> + Send> {
        let effects = self.effects.read().unwrap();
        let delay_amount = effects.delay_amount;
        let reverb_amount = effects.reverb_amount;
        let saturation_amount = effects.saturation_amount;
        drop(effects);
        
        println!("🎵 Creating synth with effects - delay: {}, reverb: {}, saturation: {}", 
                 delay_amount, reverb_amount, saturation_amount);
        
        let source = SineWave::new(frequency, Duration::from_secs(2))
            .amplify(volume * 0.3);
        
        // Apply effects
        if delay_amount > 0.0 || reverb_amount > 0.0 || saturation_amount > 0.0 {
            println!("✅ Applying effects processor");
            Box::new(EffectProcessor::new(source, delay_amount, reverb_amount, saturation_amount))
        } else {
            println!("⚠️ No effects active");
            Box::new(source)
        }
    }
    
    // Create a bass oscillator with effects
    fn create_bass_oscillator(&self, frequency: f32, volume: f32) -> Box<dyn Source<Item = f32> + Send> {
        let effects = self.effects.read().unwrap();
        let delay_amount = effects.delay_amount;
        let reverb_amount = effects.reverb_amount;
        let saturation_amount = effects.saturation_amount;
        drop(effects);
        
        let source = SineWave::new(frequency * 0.5, Duration::from_secs(2)) // Lower octave for bass
            .amplify(volume * 0.4);
        
        // Apply effects
        if delay_amount > 0.0 || reverb_amount > 0.0 || saturation_amount > 0.0 {
            Box::new(EffectProcessor::new(source, delay_amount, reverb_amount, saturation_amount))
        } else {
            Box::new(source)
        }
    }
    
    // Create a keys oscillator with effects
    fn create_keys_oscillator(&self, frequency: f32, volume: f32) -> Box<dyn Source<Item = f32> + Send> {
        let effects = self.effects.read().unwrap();
        let delay_amount = effects.delay_amount;
        let reverb_amount = effects.reverb_amount;
        let saturation_amount = effects.saturation_amount;
        drop(effects);
        
        let source = SineWave::new(frequency, Duration::from_secs(3))
            .amplify(volume * 0.35);
        
        // Apply effects
        if delay_amount > 0.0 || reverb_amount > 0.0 || saturation_amount > 0.0 {
            Box::new(EffectProcessor::new(source, delay_amount, reverb_amount, saturation_amount))
        } else {
            Box::new(source)
        }
    }
    
    // Create a simple drum sound with effects
    fn create_drum_sound(&self, frequency: f32, volume: f32) -> Box<dyn Source<Item = f32> + Send> {
        let effects = self.effects.read().unwrap();
        let delay_amount = effects.delay_amount;
        let reverb_amount = effects.reverb_amount;
        let saturation_amount = effects.saturation_amount;
        drop(effects);
        
        let source = SineWave::new(frequency, Duration::from_millis(200))
            .amplify(volume * 0.5);
        
        // Apply effects
        if delay_amount > 0.0 || reverb_amount > 0.0 || saturation_amount > 0.0 {
            Box::new(EffectProcessor::new(source, delay_amount, reverb_amount, saturation_amount))
        } else {
            Box::new(source)
        }
    }
    
    // Update effect parameters
    pub fn set_effect_param(&self, effect: &str, value: f32) -> Result<(), Box<dyn std::error::Error>> {
        let mut effects = self.effects.write().unwrap();
        
        match effect {
            "delay" => {
                effects.delay_amount = value.clamp(0.0, 0.5); // Limit to 50%
                println!("🎛️ Set delay to: {}", effects.delay_amount);
            },
            "reverb" => {
                effects.reverb_amount = value.clamp(0.0, 0.5); // Limit to 50%
                println!("🎛️ Set reverb to: {}", effects.reverb_amount);
            },
            "chorus" => {
                effects.chorus_amount = value.clamp(0.0, 0.3); // Limit to 30%
                println!("🎛️ Set chorus to: {}", effects.chorus_amount);
            },
            "saturation" => {
                effects.saturation_amount = value.clamp(0.0, 0.8); // Limit to 80%
                println!("🎛️ Set saturation to: {}", effects.saturation_amount);
            },
            _ => return Err("Unknown effect parameter".into()),
        }
        
        Ok(())
    }
}

// ADSR Envelope
pub struct Envelope {
    attack: f32,
    decay: f32,
    sustain: f32,
    release: f32,
}

impl Envelope {
    pub fn new(attack: f32, decay: f32, sustain: f32, release: f32) -> Self {
        Envelope { attack, decay, sustain, release }
    }
    
    pub fn apply(&self, time: f32, note_off_time: Option<f32>) -> f32 {
        if let Some(off_time) = note_off_time {
            if time >= off_time {
                // Release phase
                let release_time = time - off_time;
                if release_time >= self.release {
                    0.0
                } else {
                    self.sustain * (1.0 - release_time / self.release)
                }
            } else {
                self.calculate_envelope(time)
            }
        } else {
            self.calculate_envelope(time)
        }
    }
    
    fn calculate_envelope(&self, time: f32) -> f32 {
        if time < self.attack {
            // Attack phase
            time / self.attack
        } else if time < self.attack + self.decay {
            // Decay phase
            let decay_time = time - self.attack;
            1.0 - (1.0 - self.sustain) * (decay_time / self.decay)
        } else {
            // Sustain phase
            self.sustain
        }
    }
}