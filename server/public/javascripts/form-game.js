/**
 * @fileoverview Form Game logic
 * Mini dino-runner game that appears when focusing form inputs
 */

(function() {
    function randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    class Rectangle {
        constructor(x, y, width, height) {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
        }

        collision(other) {
            return (
                this.x < other.x + other.width &&
                this.x + this.width > other.x &&
                this.y < other.y + other.height &&
                this.y + this.height > other.y
            );
        }
    }

    class Player {
        constructor(x, y, width, height) {
            this.startX = x;
            this.startY = y;
            this.rect = new Rectangle(x, y, width, height);
            this.velocityY = 0;
            this.gravity = 0.35;
            this.jumpForce = -14;
            this.isJumping = false;
            this.color = '#4ecdc4';

            // Load sprite images
            // Utiliser BASE_PATH si disponible (pour la production)
            const basePath = (window.BASE_PATH && window.BASE_PATH !== '/') ? window.BASE_PATH : '';
            this.images = [];
            this.imagesSrc = [
                basePath + '/images/bun/player1.png',
                basePath + '/images/bun/player2.png'
            ];
            this.imagesLoaded = [];
            this.currentFrame = 0;
            this.frameTimer = 0;

            for (let i = 0; i < this.imagesSrc.length; i++) {
                this.images.push(new Image());
                this.images[i].src = this.imagesSrc[i];
                this.imagesLoaded.push(false);
                this.images[i].onload = () => { this.imagesLoaded[i] = true; };
                this.images[i].onerror = () => { 
                    console.error('Failed to load image:', this.imagesSrc[i]);
                };
            }
        }

        jump() {
            if (!this.isJumping) {
                this.velocityY = this.jumpForce;
                this.isJumping = true;
            }
        }

        reset(sol) {
            this.rect.x = this.startX;
            this.rect.y = sol.y - this.rect.height;
            this.velocityY = 0;
            this.isJumping = false;
        }

        update(sol) {
            this.velocityY += this.gravity;
            this.rect.y += this.velocityY;

            if (this.rect.collision(sol)) {
                this.rect.y = sol.y - this.rect.height;
                this.velocityY = 0;
                this.isJumping = false;
            }

            // Animate sprite
            this.frameTimer++;
            if (this.frameTimer >= 15) {
                this.currentFrame = (this.currentFrame + 1) % this.images.length;
                this.frameTimer = 0;
            }
        }

        getCurrentImage() {
            if (this.imagesLoaded[this.currentFrame]) {
                return this.images[this.currentFrame];
            }
            return null;
        }
    }

    class Enemy {
        constructor(x, y, width, height, type) {
            this.rect = new Rectangle(x, y, width, height);
            this.speed = 3;
            this.type = type;
            this.color = '#ff6b6b';

            // Load rock image based on type
            // Utiliser BASE_PATH si disponible (pour la production)
            const basePath = (window.BASE_PATH && window.BASE_PATH !== '/') ? window.BASE_PATH : '';
            const imgIndex = type === 'small' ? 1 : 2;
            this.image = new Image();
            this.image.src = basePath + `/images/bun/rock${imgIndex}.png`;
            this.imageLoaded = false;
            this.image.onload = () => { this.imageLoaded = true; };
            this.image.onerror = () => { 
                console.error('Failed to load image:', this.image.src);
            };
        }

        update() {
            this.rect.x -= this.speed;
        }

        estHorsEcran() {
            return this.rect.x + this.rect.width < 0;
        }

        getCurrentImage() {
            return this.imageLoaded ? this.image : null;
        }
    }

    class Game {
        constructor(largeur = 800, hauteur = 200) {
            this.width = largeur;
            this.height = hauteur;
            this.activeInput = null;
            this.activeContainer = null;
            this.canvas = null;
            this.ctx = null;
            this.play = false;
            this.jumpPressed = false;
            this.isGameOver = false;
            this.animationId = null;

            this.enemies = [];
            this.spawnTimer = 0;
            this.spawnInterval = randomInt(100, 200);

            // Sol and player
            this.sol = new Rectangle(0, hauteur - 30, largeur, 30);
            this.player = new Player(50, this.sol.y - 60, 50, 60);

            this.initKeyboard();
        }

        initKeyboard() {
            window.addEventListener('keydown', (e) => {
                this.jumpPressed = true;
            });
            window.addEventListener('keyup', (e) => {
                this.jumpPressed = false;
            });
        }

        createCanvas() {
            const canvas = document.createElement('canvas');
            canvas.width = this.width;
            canvas.height = this.height;
            canvas.style.display = 'block';
            canvas.style.width = '100%';
            canvas.style.height = '150px';
            canvas.style.marginTop = '10px';
            canvas.style.borderRadius = '8px';
            canvas.style.backgroundColor = '#87CEEB';
            return canvas;
        }

        start(inputElement, container) {
            // Stop any existing game
            this.stop();

            this.activeInput = inputElement;
            this.activeContainer = container;

            // Create fresh canvas
            this.canvas = this.createCanvas();
            this.ctx = this.canvas.getContext('2d');
            container.appendChild(this.canvas);

            // Reset game state
            this.enemies = [];
            this.spawnTimer = 0;
            this.spawnInterval = randomInt(100, 200);
            this.isGameOver = false;
            this.player.reset(this.sol);

            this.play = true;
            this.loop();
        }

        stop() {
            this.play = false;
            if (this.animationId) {
                cancelAnimationFrame(this.animationId);
                this.animationId = null;
            }
            if (this.canvas && this.canvas.parentNode) {
                this.canvas.parentNode.removeChild(this.canvas);
            }
            this.canvas = null;
            this.ctx = null;
            this.activeInput = null;
            this.activeContainer = null;
        }

        spawnEnnemi() {
            const types = ["small", "big"];
            let i = randomInt(0, 1);
            const width = 40 + i * 20;
            const height = 40 + i * 20;
            const x = this.width;
            const y = this.sol.y - height;

            this.enemies.push(new Enemy(x, y, width, height, types[i]));
        }

        loop() {
            if (!this.play || !this.ctx) return;

            // Clear
            this.ctx.clearRect(0, 0, this.width, this.height);

            if (this.isGameOver) {
                // Draw ground
                this.ctx.fillStyle = '#8B4513';
                this.ctx.fillRect(this.sol.x, this.sol.y, this.sol.width, this.sol.height);
                // Draw game over text
                this.ctx.fillStyle = '#ff0000';
                this.ctx.font = 'bold 24px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText('OUPS ! -1 Lettre', this.width / 2, this.height / 2);
                this.ctx.textAlign = 'left';

                this.animationId = requestAnimationFrame(() => this.loop());
                return;
            }

            // Jump
            if (this.jumpPressed) {
                this.player.jump();
            }

            // Update player
            this.player.update(this.sol);

            // Spawn enemies
            this.spawnTimer++;
            if (this.spawnTimer >= this.spawnInterval) {
                this.spawnEnnemi();
                this.spawnTimer = 0;
                this.spawnInterval = randomInt(80, 180);
            }

            // Update enemies
            for (let i = this.enemies.length - 1; i >= 0; i--) {
                this.enemies[i].update();

                if (this.enemies[i].estHorsEcran()) {
                    this.enemies.splice(i, 1);
                } else if (this.enemies[i].rect.collision(this.player.rect)) {
                    // Collision! Remove a letter
                    if (this.activeInput && this.activeInput.value.length > 0) {
                        this.activeInput.value = this.activeInput.value.slice(0, -1);
                        // Trigger input event for any listeners
                        this.activeInput.dispatchEvent(new Event('input', { bubbles: true }));
                    }

                    this.isGameOver = true;

                    setTimeout(() => {
                        this.enemies = [];
                        this.spawnTimer = 0;
                        this.player.reset(this.sol);
                        this.isGameOver = false;
                    }, 1000);
                }
            }

            // Draw ground
            this.ctx.fillStyle = '#8B4513';
            this.ctx.fillRect(this.sol.x, this.sol.y, this.sol.width, this.sol.height);

            // Draw player
            const playerImg = this.player.getCurrentImage();
            if (playerImg) {
                this.ctx.drawImage(playerImg, this.player.rect.x, this.player.rect.y, this.player.rect.width, this.player.rect.height);
            } else {
                this.ctx.fillStyle = this.player.color;
                this.ctx.fillRect(this.player.rect.x, this.player.rect.y, this.player.rect.width, this.player.rect.height);
            }

            // Draw enemies
            this.enemies.forEach(enemy => {
                const enemyImg = enemy.getCurrentImage();
                if (enemyImg) {
                    this.ctx.drawImage(enemyImg, enemy.rect.x, enemy.rect.y, enemy.rect.width, enemy.rect.height);
                } else {
                    this.ctx.fillStyle = enemy.color;
                    this.ctx.fillRect(enemy.rect.x, enemy.rect.y, enemy.rect.width, enemy.rect.height);
                }
            });

            this.animationId = requestAnimationFrame(() => this.loop());
        }
    }

    // Init
    function initGame() {
        // Notify system opened
        if (window.emit) emit('app:opened', { appId: 'bun' });

        const game = new Game(800, 200);

        const inputs = document.querySelectorAll('.inputgame');
        const inputsContainers = document.querySelectorAll('.gameRequired');

        inputs.forEach((input, i) => {
            const container = inputsContainers[i];

            input.addEventListener('focus', () => {
                game.start(input, container);
            });

            input.addEventListener('blur', () => {
                // Small delay to handle focus switching between inputs
                setTimeout(() => {
                    // Only stop if we're not focused on another game input
                    if (!document.activeElement || !document.activeElement.classList.contains('inputgame')) {
                        game.stop();
                    }
                }, 50);
            });
        });

        // Handle Form Submission
        const form = document.querySelector('form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            game.stop();
            if (window.emit) emit('bun:finished');
            alert('Formulaire envoyé avec succès !');
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initGame);
    } else {
        initGame();
    }

})();
