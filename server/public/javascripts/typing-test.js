/**
 * @fileoverview Typing Speed Test - Alpine.js component
 * @description Typing test that measures WPM (words per minute) and accuracy.
 *              Uses French texts about free software and digital sovereignty.
 *              Communicates with parent window via message-bus for task system.
 *
 * @requires Alpine.js
 * @requires message-bus.js (optional, for parent communication)
 *
 * @example
 * // In HTML template:
 * <div x-data="typingTest()">...</div>
 */

document.addEventListener('alpine:init', () => {
	Alpine.data('typingTest', () => ({
		// ===================
		// Text Content
		// ===================

		/**
		 * Available texts for typing practice (French, NIRD-themed)
		 * @type {string[]}
		 */
		texts: [
			'Le logiciel libre est un mouvement qui promeut la liberté des utilisateurs. Avec Linux et les alternatives open source, vous pouvez contrôler votre système sans dépendre des Big Tech.',
			'La migration vers des solutions libres permet de réduire les coûts de licences tout en améliorant la sécurité et la confidentialité de vos données.',
			'Les logiciels libres offrent une transparence totale sur leur fonctionnement. Vous pouvez examiner le code source et vous assurer qu\'il n\'y a pas de portes dérobées.',
			'La communauté du logiciel libre est active et solidaire. Des milliers de développeurs contribuent chaque jour à améliorer les outils que nous utilisons.',
			'En choisissant des alternatives libres, vous participez à un écosystème plus équitable et durable pour l\'informatique de demain.'
		],

		// ===================
		// State
		// ===================

		/** @type {string} Currently displayed text to type */
		currentText: '',

		/** @type {string} User's typed input */
		userInput: '',

		/** @type {number|null} Timestamp when user started typing */
		startTime: null,

		/** @type {number|null} Timestamp when user finished */
		endTime: null,

		/** @type {boolean} Whether the user is currently typing */
		isTyping: false,

		/** @type {boolean} Whether the test is complete */
		isFinished: false,

		// ===================
		// Statistics
		// ===================

		/** @type {number} Words per minute (5 chars = 1 word) */
		wpm: 0,

		/** @type {number} Accuracy percentage (0-100) */
		accuracy: 100,

		/** @type {number} Number of incorrect characters */
		errors: 0,

		/** @type {number} Total characters typed */
		totalChars: 0,

		// ===================
		// Lifecycle
		// ===================

		/**
		 * Initialize the component
		 * Loads a random text and notifies parent window
		 */
		init() {
			this.loadNewText();
			if (window.emit) emit('app:opened', { appId: 'typing' });
		},

		/**
		 * Load a new random text and reset all state
		 */
		loadNewText() {
			const randomIndex = Math.floor(Math.random() * this.texts.length);
			this.currentText = this.texts[randomIndex];
			this.userInput = '';
			this.startTime = null;
			this.endTime = null;
			this.isTyping = false;
			this.isFinished = false;
			this.wpm = 0;
			this.accuracy = 100;
			this.errors = 0;
			this.totalChars = 0;
		},

		// ===================
		// Test Control
		// ===================

		/**
		 * Start the typing timer (called on first keystroke)
		 */
		startTyping() {
			if (!this.isTyping && !this.isFinished) {
				this.isTyping = true;
				this.startTime = Date.now();
			}
		},

		/**
		 * Handle input changes from textarea
		 * Auto-starts timer, checks completion, updates stats
		 */
		handleInput() {
			if (!this.isTyping && this.userInput.length === 0) {
				this.startTyping();
			}

			if (this.userInput === this.currentText) {
				this.finish();
			}

			this.calculateStats();
		},

		/**
		 * Finish the test and notify parent
		 */
		finish() {
			this.isFinished = true;
			this.isTyping = false;
			this.endTime = Date.now();
			this.calculateStats();
			if (window.emit) emit('typing:finished', { wpm: this.wpm, accuracy: this.accuracy });
		},

		/**
		 * Reset and load a new text (alias for loadNewText)
		 */
		reset() {
			this.loadNewText();
		},

		// ===================
		// Statistics Calculation
		// ===================

		/**
		 * Calculate WPM and accuracy based on current input
		 * WPM formula: (correct_chars / 5) / minutes_elapsed
		 */
		calculateStats() {
			if (!this.startTime) return;

			const elapsedMinutes = (Date.now() - this.startTime) / 1000 / 60;
			const wordsTyped = this.getCorrectChars() / 5; // Standard: 5 chars = 1 word
			this.wpm = Math.round(wordsTyped / elapsedMinutes);

			this.totalChars = this.userInput.length;
			this.errors = this.getErrors();
			this.accuracy = this.totalChars > 0
				? Math.round(((this.totalChars - this.errors) / this.totalChars) * 100)
				: 100;
		},

		/**
		 * Count correctly typed characters
		 * @returns {number} Number of correct characters
		 */
		getCorrectChars() {
			let correct = 0;
			const maxLen = Math.min(this.userInput.length, this.currentText.length);
			for (let i = 0; i < maxLen; i++) {
				if (this.userInput[i] === this.currentText[i]) {
					correct++;
				}
			}
			return correct;
		},

		/**
		 * Count typing errors
		 * @returns {number} Number of incorrect characters
		 */
		getErrors() {
			let errors = 0;
			for (let i = 0; i < this.userInput.length; i++) {
				if (i >= this.currentText.length || this.userInput[i] !== this.currentText[i]) {
					errors++;
				}
			}
			return errors;
		},

		// ===================
		// Template Helpers
		// ===================

		/**
		 * Get CSS class for a character at given index
		 * @param {number} index - Character index in currentText
		 * @returns {string} CSS class: 'correct', 'incorrect', 'current', or ''
		 */
		getCharClass(index) {
			if (index >= this.userInput.length) {
				return index === this.userInput.length ? 'current' : '';
			}
			if (index >= this.currentText.length) {
				return 'incorrect';
			}
			return this.userInput[index] === this.currentText[index] ? 'correct' : 'incorrect';
		}
	}));
});
