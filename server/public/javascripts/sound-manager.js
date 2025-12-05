/**
 * @fileoverview Sound Manager
 * @description Centralized audio management for the NDI OS.
 *              Allows apps to register and play sounds.
 */

window.SoundManager = {
    sounds: {},
    context: null,

    init() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.context = new AudioContext();
            }
        } catch (e) {
            console.warn('Web Audio API not supported');
        }
    },

    /**
     * Register a sound
     * @param {string} key - Unique identifier
     * @param {string} path - Path to audio file
     */
    register(key, path) {
        this.sounds[key] = new Audio(path);
        this.sounds[key].volume = key === 'miss' ? 0.1 : 0.2; // Lower volume for miss
        // Fallback listener
        this.sounds[key].onerror = () => {
            this.sounds[key].failed = true;
        };
    },

    /**
     * Resume AudioContext (call on user interaction)
     */
    resume() {
        if (this.context && this.context.state === 'suspended') {
            this.context.resume();
        }
    },

    /**
     * Play a sound
     * @param {string} key - Unique identifier
     */
    play(key) {
        const sound = this.sounds[key];
        if (sound && !sound.failed) {
            sound.currentTime = 0;
            sound.play().catch(e => {
                // console.warn('Audio play failed, using fallback:', e);
                this.playBeep(key);
            });
        } else {
            this.playBeep(key);
        }
    },

    /**
     * Generate a beep (fallback)
     */
    playBeep(type) {
        if (!this.context) {
            if (!this.init()) return; // Try init if not ready
            if (!this.context) return;
        }
        
        // Ensure context is running (handled best via explicit resume() call)
        if (this.context.state === 'suspended') {
            this.context.resume();
        }

        const oscillator = this.context.createOscillator();
        const gainNode = this.context.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.context.destination);

        if (type === 'hit') {
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(800, this.context.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(1200, this.context.currentTime + 0.1);
            gainNode.gain.setValueAtTime(0.03, this.context.currentTime); // Low volume
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.1);
            oscillator.start();
            oscillator.stop(this.context.currentTime + 0.1);
        } else if (type === 'miss') {
            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(150, this.context.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(50, this.context.currentTime + 0.3);
            gainNode.gain.setValueAtTime(0.015, this.context.currentTime); // Very low volume for miss
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.3);
            oscillator.start();
            oscillator.stop(this.context.currentTime + 0.3);
        }
    }
};

// Auto-init
window.SoundManager.init();
