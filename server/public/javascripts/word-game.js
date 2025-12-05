/**
 * @fileoverview Word Game - Alpine.js component
 * @description Infinite typing game similar to the "Word" app integration.
 *              Used for both Word (failure scenario) and LibreOffice (success scenario).
 */

document.addEventListener('alpine:init', () => {
	Alpine.data('wordGame', (appId = 'word') => ({
		// Config
		gameDuration: 30,
		texts: [
			"Je soussigné, développeur épuisé, certifie avoir passé trois heures à chercher un bug qui était finalement un point-virgule manquant. J'atteste avoir copié du code sans le comprendre et menti lors du stand-up meeting.",
			"Moi, utilisateur moyen, je clique sur \"J'accepte\" sans lire. Je promets d'utiliser \"motdepasse123\" partout, de paniquer au moindre bruit bizarre, et d'appeler mon neveu quand le wifi coupe.",
			"En tant que stagiaire, je promets de confondre Java et JavaScript, de paniquer devant chaque message d'erreur, et de faire semblant de comprendre quand on me parle de frameworks.",
			"Cher journal, ce matin j'ai affiché \"bourrage papier\" pour voir Daniel paniquer. À onze heures, j'ai manqué de cyan en pleine impression urgente, juste pour me sentir puissant."
		],

		// State
		currentText: "",
		userInput: "",
		timeLeft: 30,
		timerInterval: null,
		isGameActive: false,
		correctChars: 0,
		htmlContent: "",

		init() {
			if (window.emit) emit('app:opened', { appId });
			this.resetGame();
		},

		resetGame() {
			if (this.timerInterval) clearInterval(this.timerInterval);
			this.isGameActive = false;
			this.timeLeft = this.gameDuration;
			this.userInput = "";
			this.correctChars = 0;
			
			// Pick random text
			this.currentText = this.texts[Math.floor(Math.random() * this.texts.length)];
			this.updateDisplay();
			
			// Auto start
			this.startGame();
		},

		startGame() {
			if (this.isGameActive) return;
			this.isGameActive = true;
			
			// Only start timer for Word (failure condition)
			if (appId === 'word') {
				this.timerInterval = setInterval(() => {
					this.timeLeft--;
					if (this.timeLeft <= 0) {
						this.endGame(false); 
					}
				}, 1000);
			}
		},

		handleInput() {
			if (!this.isGameActive) return;
			
			// Logic branching based on App ID
			if (appId === 'word') {
				// Infinite Mode (Fail)
				if (this.userInput.length >= this.currentText.length - 20) {
					const newText = this.texts[Math.floor(Math.random() * this.texts.length)];
					this.currentText += " " + newText;
				}
			} else {
				// LibreOffice Mode (Win)
				if (this.userInput === this.currentText) {
					this.endGame(true); // Victory
					return;
				}
			}
			
			this.updateDisplay();
		},

		updateDisplay() {
			let html = "";
			for (let i = 0; i < this.currentText.length; i++) {
				if (i < this.userInput.length) {
					if (this.userInput[i] === this.currentText[i]) {
						html += `<span class="text-green-600 bg-green-50">${this.currentText[i]}</span>`;
					} else {
						html += `<span class="text-red-600 bg-red-50 font-bold">${this.currentText[i]}</span>`;
					}
				} else if (i === this.userInput.length) {
					html += `<span class="bg-yellow-100">${this.currentText[i]}</span>`;
				} else {
					html += `<span class="text-gray-700">${this.currentText[i]}</span>`;
				}
			}
			this.htmlContent = html;
			
			// Count correct chars
			let correct = 0;
			const max = Math.min(this.userInput.length, this.currentText.length);
			for(let i=0; i<max; i++) {
				if (this.userInput[i] === this.currentText[i]) correct++;
			}
			this.correctChars = correct;
		},

		endGame(success = false) {
			this.isGameActive = false;
			clearInterval(this.timerInterval);
			
			// If it's Word, we essentially treat "timeout" as the "crash" event that ends the task
			// If it's LibreOffice, success=true means we typed everything
			
			if (window.emit) {
				emit(`${appId}:finished`, { 
					success: success,
					chars: this.correctChars, 
					total: this.userInput.length 
				});
			}
		}
	}));
});
