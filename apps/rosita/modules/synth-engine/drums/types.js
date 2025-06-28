/**
 * Play kick drum sound
 * @private
 */
export function playKickDrum(oscillator, gainNode, kitType, drumSettings, now) {
    oscillator.type = 'square'; // Always use Kit 1
    
    // Use kickPitch to control frequency
    const basePitch = 60;
    const endPitch = 30;
    const pitchMultiplier = drumSettings.kickPitch || 1.0;
    
    oscillator.frequency.setValueAtTime(basePitch * pitchMultiplier, now);
    oscillator.frequency.exponentialRampToValueAtTime(endPitch * pitchMultiplier, now + 0.3);
    gainNode.gain.setValueAtTime(1.0, now);
    const kickDecay = drumSettings.kickDecay || 0.4;
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + kickDecay);
    oscillator.start(now);
    oscillator.stop(now + kickDecay);
}

/**
 * Play snare drum sound
 * @private
 */
export function playSnare(oscillator, gainNode, kitType, drumSettings, now) {
    oscillator.type = 'triangle'; // Always use Kit 1 settings
    const pitchMultiplier = drumSettings.snarePitch || 1.0;
    oscillator.frequency.setValueAtTime(100 * pitchMultiplier, now);
    gainNode.gain.setValueAtTime(1, now);
    const snareDecay = drumSettings.snareDecay || 0.2;
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + snareDecay);
    
    // Add noise for snare sound
    const noiseNode = this.createNoiseNode(snareDecay);
    noiseNode.connect(this.masterGain);
    
    oscillator.start(now);
    oscillator.stop(now + snareDecay);
}

/**
 * Play hi-hat sounds
 * @private
 */
export function playHiHat(oscillator, gainNode, kitType, drumSettings, now, type) {
    oscillator.type = 'square'; // Always use Kit 1 settings
    let pitchMultiplier = 1.0;
    if (type === 'Hat 1') {
        pitchMultiplier = drumSettings.hat1Pitch || 1.0;
    } else if (type === 'Hat 2') {
        pitchMultiplier = drumSettings.hat2Pitch || 1.0;
    }
    oscillator.frequency.setValueAtTime(800 * pitchMultiplier, now);
    gainNode.gain.setValueAtTime(0.5, now);
    
    // Use different decay times for closed vs open hi-hat
    const hihatDecay = type === 'Hi-hat C' ? 
        (drumSettings.hihatDecay || 0.1) : 
        (drumSettings.hihatDecay || 0.3);
    
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + hihatDecay);
    oscillator.start(now);
    oscillator.stop(now + hihatDecay);
}

/**
 * Play tom drum sounds
 * @private
 */
export function playTom(oscillator, gainNode, kitType, drumSettings, now, type) {
    oscillator.type = 'square'; // Always use Kit 1 settings
    
    // Use Kit 1 parameters only
    if (type === 'Tom Low') {
        oscillator.frequency.setValueAtTime(90, now);
        oscillator.frequency.exponentialRampToValueAtTime(40, now + 0.3);
        gainNode.gain.setValueAtTime(0.8, now);
        const tomLowDecay = drumSettings.tomLowDecay || 0.3;
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + tomLowDecay);
        oscillator.start(now);
        oscillator.stop(now + tomLowDecay);
    } else if (type === 'Tom Mid') {
        oscillator.frequency.setValueAtTime(120, now);
        oscillator.frequency.exponentialRampToValueAtTime(60, now + 0.2);
        gainNode.gain.setValueAtTime(0.7, now);
        const tomMidDecay = drumSettings.tomMidDecay || 0.2;
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + tomMidDecay);
        oscillator.start(now);
        oscillator.stop(now + tomMidDecay);
    } else if (type === 'Tom High') {
        oscillator.frequency.setValueAtTime(180, now);
        oscillator.frequency.exponentialRampToValueAtTime(80, now + 0.15);
        gainNode.gain.setValueAtTime(0.6, now);
        const tomHighDecay = drumSettings.tomHighDecay || 0.15;
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + tomHighDecay);
        oscillator.start(now);
        oscillator.stop(now + tomHighDecay);
    }
}

/**
 * Play crash cymbal sound
 * @private
 */
export function playCrash(oscillator, gainNode, kitType, drumSettings, now) {
    oscillator.type = 'square'; // Always use Kit 1 settings
    oscillator.frequency.setValueAtTime(1500, now);
    gainNode.gain.setValueAtTime(0.4, now);
    const crashDecay = drumSettings.crashDecay || 0.5;
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + crashDecay);
    oscillator.start(now);
    oscillator.stop(now + crashDecay);
}

/**
 * Play rim shot sound
 * @private
 */
export function playRim(oscillator, gainNode, kitType, drumSettings, now) {
    oscillator.type = 'square'; // Always use Kit 1 settings
    const rimDecay = drumSettings.rimDecay || 0.05;
    
    oscillator.frequency.setValueAtTime(800, now);
    gainNode.gain.setValueAtTime(0.5, now);
    
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + rimDecay);
    oscillator.start(now);
    oscillator.stop(now + rimDecay);
}

/**
 * Play percussion sounds
 * @private
 */
export function playPercussion(oscillator, gainNode, kitType, drumSettings, now, type) {
    if (type === 'Perc 1') {
        oscillator.type = 'triangle'; // Always use Kit 1 settings
        oscillator.frequency.setValueAtTime(400, now);
        gainNode.gain.setValueAtTime(0.5, now);
        const perc1Decay = drumSettings.perc1Decay || 0.2;
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + perc1Decay);
        oscillator.start(now);
        oscillator.stop(now + perc1Decay);
    } else if (type === 'Perc 2') {
        oscillator.type = 'sawtooth'; // Always use Kit 1 settings
        oscillator.frequency.setValueAtTime(300, now);
        gainNode.gain.setValueAtTime(0.5, now);
        const perc2Decay = drumSettings.perc2Decay || 0.3;
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + perc2Decay);
        oscillator.start(now);
        oscillator.stop(now + perc2Decay);
    }
}