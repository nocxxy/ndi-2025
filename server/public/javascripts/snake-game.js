/**
 * @fileoverview Snake Game - Alpine.js component
 * @description Classic Snake game implementation with grid-based movement,
 *              collision detection, and score tracking via localStorage.
 *              Communicates with parent window via message-bus for task system.
 *
 * @requires Alpine.js
 * @requires message-bus.js (optional, for parent communication)
 *
 * @example
 * // In HTML template:
 * <div x-data="snakeGame()">...</div>
 */

document.addEventListener('alpine:init', () => {
	Alpine.data('snakeGame', () => ({
		// ===================
		// State
		// ===================

		/** @type {boolean} Whether the game is currently running */
		gameStarted: false,

		/** @type {boolean} Whether the game has ended */
		gameOver: false,

		/** @type {number} Current game score (10 points per food) */
		score: 0,

		/** @type {number} Best score from localStorage */
		highScore: 0,

		/** @type {number} Grid dimensions (gridSize x gridSize) */
		gridSize: 20,

		/** @type {number} Size of each cell in pixels */
		cellSize: 20,

		/** @type {Array<{x: number, y: number}>} Snake body segments, head at index 0 */
		snake: [{x: 10, y: 10}],

		/** @type {{x: number, y: number}} Current movement direction (-1, 0, or 1) */
		direction: {x: 1, y: 0},

		/** @type {{x: number, y: number}} Current food position */
		food: {x: 15, y: 15},

		/** @type {number|null} Game loop interval ID */
		gameLoop: null,

		/** @type {number[]} Row indices for template rendering */
		rows: [],

		/** @type {number[]} Column indices for template rendering */
		cells: [],

		// ===================
		// Lifecycle
		// ===================

		/**
		 * Initialize the game component
		 * - Generates grid arrays for template
		 * - Loads high score from localStorage
		 * - Sets up keyboard event listeners
		 * - Notifies parent window that app is opened
		 */
		init() {
			this.rows = Array.from({length: this.gridSize}, (_, i) => i);
			this.cells = Array.from({length: this.gridSize}, (_, i) => i);

			if (typeof Storage !== 'undefined') {
				this.highScore = parseInt(localStorage.getItem('snakeHighScore') || '0');
			}

			// Notify parent for task system
			if (window.emit) emit('app:opened', { appId: 'snake' });

			// Keyboard controls
			this.keyHandler = (e) => {
				if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
					e.preventDefault();
				}
				if (!this.gameStarted || this.gameOver) return;

				const directionMap = {
					'ArrowUp':    { x: 0, y: -1, condition: this.direction.y === 0 },
					'ArrowDown':  { x: 0, y: 1,  condition: this.direction.y === 0 },
					'ArrowLeft':  { x: -1, y: 0, condition: this.direction.x === 0 },
					'ArrowRight': { x: 1, y: 0,  condition: this.direction.x === 0 },
				};

				const dir = directionMap[e.key];
				if (dir && dir.condition) {
					this.direction = { x: dir.x, y: dir.y };
				}
			};

			window.addEventListener('keydown', this.keyHandler);
		},

		// ===================
		// Game Control
		// ===================

		/**
		 * Start a new game
		 * Resets all state and begins the game loop (150ms interval)
		 */
		startGame() {
			this.gameStarted = true;
			this.gameOver = false;
			this.score = 0;
			this.snake = [{x: 10, y: 10}];
			this.direction = {x: 1, y: 0};
			this.generateFood();

			this.gameLoop = setInterval(() => this.moveSnake(), 150);
		},

		/**
		 * End the current game
		 * Stops game loop and notifies parent window with final score
		 */
		endGame() {
			this.gameStarted = false;
			this.gameOver = true;
			if (this.gameLoop) {
				clearInterval(this.gameLoop);
				this.gameLoop = null;
			}
			// Notify parent for task system
			if (window.emit) emit('snake:gameOver', { score: this.score, highScore: this.highScore });
		},

		// ===================
		// Game Logic
		// ===================

		/**
		 * Move snake one step in current direction
		 * Handles wall collision, self collision, and food eating
		 */
		moveSnake() {
			const head = {
				x: this.snake[0].x + this.direction.x,
				y: this.snake[0].y + this.direction.y
			};

			// Wall collision
			if (head.x < 0 || head.x >= this.gridSize || head.y < 0 || head.y >= this.gridSize) {
				this.endGame();
				return;
			}

			// Self collision
			if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
				this.endGame();
				return;
			}

			this.snake.unshift(head);

			// Food collision
			if (head.x === this.food.x && head.y === this.food.y) {
				this.score += 10;
				this.generateFood();
				if (typeof Storage !== 'undefined' && this.score > this.highScore) {
					this.highScore = this.score;
					localStorage.setItem('snakeHighScore', this.highScore);
				}
			} else {
				this.snake.pop();
			}
		},

		/**
		 * Generate new food position
		 * Ensures food doesn't spawn on snake body
		 */
		generateFood() {
			do {
				this.food = {
					x: Math.floor(Math.random() * this.gridSize),
					y: Math.floor(Math.random() * this.gridSize)
				};
			} while (this.snake.some(segment => segment.x === this.food.x && segment.y === this.food.y));
		},

		/**
		 * Change snake direction (for touch/button controls)
		 * @param {number} x - Horizontal direction (-1, 0, or 1)
		 * @param {number} y - Vertical direction (-1, 0, or 1)
		 */
		changeDirection(x, y) {
			if (!this.gameStarted || this.gameOver) return;
			// Prevent reversing direction
			if (this.direction.x === -x && this.direction.y === -y) return;
			this.direction = {x, y};
		},

		// ===================
		// Cell Helpers (for template rendering)
		// ===================

		/**
		 * Check if cell contains snake head
		 * @param {number} x - Cell X coordinate
		 * @param {number} y - Cell Y coordinate
		 * @returns {boolean}
		 */
		isSnakeHead(x, y) {
			return this.snake[0].x === x && this.snake[0].y === y;
		},

		/**
		 * Check if cell contains snake body (not head)
		 * @param {number} x - Cell X coordinate
		 * @param {number} y - Cell Y coordinate
		 * @returns {boolean}
		 */
		isSnakeBody(x, y) {
			return this.snake.slice(1).some(segment => segment.x === x && segment.y === y);
		},

		/**
		 * Check if cell contains food
		 * @param {number} x - Cell X coordinate
		 * @param {number} y - Cell Y coordinate
		 * @returns {boolean}
		 */
		isFood(x, y) {
			return this.food.x === x && this.food.y === y;
		}
	}));
});
