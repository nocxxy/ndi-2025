/**
 * @fileoverview Server Shield - Alpine.js component
 * @description Rhythm/Defense game ported from vanilla JS.
 *              Strict adherence to original style and mechanics.
 */

document.addEventListener('alpine:init', () => {
    Alpine.data('serverShield', () => ({
        // Constants
        COLUMNS: 3,
        SPAWN_BASE_INTERVAL: 1000,
        FALL_SPEED_BASE: 120,
        LIVES_MAX: 3,
        MAX_SCORE: 10000,
        ERROR_CODES: ["301","302","307","308","400","401","403","404","405","408","429","500","501","502","503","504"],
        HTTP_METHODS: ["GET","POST","DELETE","PUT","PATCH"],
        HIT_WINDOW: 36,
        MISS_THRESHOLD: 48,

        // State
        tiles: [],
        score: 0,
        lives: 3,
        speedMultiplier: 1.0,
        running: false,
        paused: false,
        overlayVisible: true,
        overlayText: 'Appuyez sur Démarrer',
        
        // Internal
        lastFrame: null,
        spawnTimer: 0,
        spawnInterval: 1000,
        limitY: 0,
        
        // Reactive visual states (must be initialized)
        shake: false,
        keyActive0: false,
        keyActive1: false,
        keyActive2: false,
        limitFlash0: false,
        limitFlash1: false,
        limitFlash2: false,
        missFlash0: false,
        missFlash1: false,
        missFlash2: false,
        
        init() {
            if (window.emit) emit('app:opened', { appId: 'server-shield' });
            
            this.lives = this.LIVES_MAX;
            this.spawnInterval = this.SPAWN_BASE_INTERVAL;

            // Wait for DOM
            this.$nextTick(() => {
                this.recalcSizes();
                window.addEventListener('resize', () => this.recalcSizes());
                window.addEventListener('keydown', (e) => this.handleKey(e));
            });
        },

        recalcSizes() {
            const limitLine = this.$refs.limitLine;
            if (limitLine) {
                this.limitY = limitLine.offsetTop + limitLine.offsetHeight / 2;
            }
        },

        handleKey(e) {
            if (e.repeat) return;
            if (e.key.toLowerCase() === 'p') {
                this.togglePause();
                return;
            }
            
            // Strict mapping per requirements
            const KEY_MAP = { 'q': 0, 'Q': 0, 's': 1, 'S': 1, 'd': 2, 'D': 2 };
            
            if (KEY_MAP.hasOwnProperty(e.key)) {
                this.onKeyPress(KEY_MAP[e.key]);
            }
        },

        startGame() {
            if (window.SoundManager) window.SoundManager.resume();
            this.resetState();
            this.running = true;
            this.lastFrame = performance.now();
            this.recalcSizes();
            this.overlayVisible = false;
            requestAnimationFrame((t) => this.loop(t));
        },

        resetState() {
            this.tiles = [];
            this.spawnTimer = 0;
            this.spawnInterval = this.SPAWN_BASE_INTERVAL;
            this.speedMultiplier = 1.0;
            this.score = 0;
            this.lives = this.LIVES_MAX;
            this.paused = false;
        },

        togglePause() {
            if (!this.running) return;
            this.paused = !this.paused;
            if (this.paused) {
                this.overlayText = 'Pause — appuyez sur Reprendre';
                this.overlayVisible = true;
            } else {
                this.overlayVisible = false;
            }
        },

        loop(now) {
            if (!this.running) return;
            
            if (!this.lastFrame) this.lastFrame = now;
            const delta = now - this.lastFrame;
            this.lastFrame = now;

            if (!this.paused) {
                this.update(delta);
            }

            requestAnimationFrame((t) => this.loop(t));
        },

        update(delta) {
            // Spawn
            this.spawnTimer += delta;
            if (this.spawnTimer >= this.spawnInterval) {
                this.spawnTimer = 0;
                this.spawnTile();
            }

            // Move
            const dy = this.FALL_SPEED_BASE * this.speedMultiplier * delta / 1000;
            
            // Logic loop (iterating backwards to safely remove)
            for (let i = this.tiles.length - 1; i >= 0; i--) {
                const t = this.tiles[i];
                
                // Skip if hit animation is playing (handled visually)
                if (t.hit) continue;

                t.y += dy;

                // Miss detection
                if (t.y + 20 > this.limitY + this.MISS_THRESHOLD) { // 20 is half height approx
                    this.tiles.splice(i, 1);
                    this.lives--;
                    this.triggerShake();
                    this.limitSegmentFlash(t.colIndex);
                    
                    if (window.SoundManager) window.SoundManager.play('miss');
                    
                    // Penalty
                    this.speedMultiplier = Math.max(0.6, this.speedMultiplier - 0.07);
                    
                    if (this.lives <= 0) {
                        this.gameOver();
                        return;
                    }
                }
            }

            // Speed Ramp
            this.speedMultiplier = Math.min(3.0, this.speedMultiplier + delta / 100000);

            if (this.score >= this.MAX_SCORE) {
                this.gameWin();
            }
        },

        spawnTile() {
            const colIndex = Math.floor(Math.random() * this.COLUMNS);
            const code = this.ERROR_CODES[Math.floor(Math.random() * this.ERROR_CODES.length)];
            const method = this.HTTP_METHODS[Math.floor(Math.random() * this.HTTP_METHODS.length)];
            const severity = code.startsWith("5") ? 'error-5xx' : (code.startsWith("4") ? 'error-4xx' : 'error-3xx');

            // Visual fix: calculate left position based on column width (assuming CSS vars)
            // We rely on Alpine :style bindings
            this.tiles.push({
                id: Date.now() + Math.random(),
                colIndex,
                text: `${method} ${code}`,
                severity,
                y: -50,
                hit: false,
                popText: null
            });
        },

        onKeyPress(colIndex) {
            if (!this.running || this.paused) return;

            // Visual feedback for key
            this.flashKey(colIndex);
            this.flashLimit(colIndex);

            // Filter tiles in this column
            const colTiles = this.tiles.filter(t => t.colIndex === colIndex && !t.hit);
            if (colTiles.length === 0) return;

            // Find closest to limit line
            let best = null;
            let bestDist = Infinity;

            colTiles.forEach(t => {
                const tileCenterY = t.y + 20; // 40px height
                const dist = Math.abs(tileCenterY - this.limitY);
                if (dist < bestDist) {
                    bestDist = dist;
                    best = t;
                }
            });

            if (best && bestDist <= this.HIT_WINDOW) {
                // HIT
                best.hit = true;
                const points = Math.max(1, Math.round((this.HIT_WINDOW - bestDist) / this.HIT_WINDOW * 100));
                this.score += points;
                
                // Pop effect
                best.popText = `+${points}`;
                
                // Remove after animation
                setTimeout(() => {
                    this.tiles = this.tiles.filter(t => t.id !== best.id);
                }, 260);

                // Difficulty adjustment
                this.speedMultiplier = Math.min(3, this.speedMultiplier + 0.015);
                this.spawnInterval = Math.max(380, this.SPAWN_BASE_INTERVAL * (1 / (1 + this.score / 800)));

                if (window.SoundManager) window.SoundManager.play('hit');

            } else {
                // No penalty for spamming in original script, just ignores
                this.spawnInterval = Math.max(380, this.SPAWN_BASE_INTERVAL * (1 / (1 + this.score / 800)));
            }
        },

        flashKey(colIndex) {
            this['keyActive' + colIndex] = true;
            setTimeout(() => this['keyActive' + colIndex] = false, 200);
        },

        flashLimit(colIndex) {
            this['limitFlash' + colIndex] = true;
            setTimeout(() => this['limitFlash' + colIndex] = false, 200);
        },

        limitSegmentFlash(colIndex) {
            this['missFlash' + colIndex] = true;
            setTimeout(() => this['missFlash' + colIndex] = false, 200);
        },

        triggerShake() {
            this.shake = true;
            setTimeout(() => this.shake = false, 500);
        },

        gameOver() {
            this.running = false;
            this.overlayText = "💥 Le serveur a succombé aux erreurs !";
            this.overlayVisible = true;
            if (window.emit) emit('server-shield:gameover', { score: this.score });
        },

        gameWin() {
            this.running = false;
            this.overlayText = "🎉 Serveur protégé ! Bravo !";
            this.overlayVisible = true;
            if (window.emit) emit('server-shield:victory', { score: this.score });
        }
    }));
});