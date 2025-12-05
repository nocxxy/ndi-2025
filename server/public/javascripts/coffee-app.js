/**
 * @fileoverview Coffee App - Alpine.js component
 * @description A "bun" (fun/annoying) app that simulates a complex coffee machine process.
 *              The user has to click buttons that appear in random locations to make coffee.
 */

document.addEventListener('alpine:init', () => {
	Alpine.data('coffeeApp', () => ({
		step: 0,
		cookiesAccepted: false,
		firstTime: null,
		card: null,
		cardInput: '',
		cardAccepted: false,
		licenseRenewed: false,
		beansGround: false,
		beansRefilled: false,
		waterHeated: false,
		coffeeBrewed: false,
		showCoffee: false,
		failureMode: false,

		init() {
			if (window.emit) emit('app:opened', { appId: 'coffee' });
			
			window.addEventListener('message', (event) => {
				if (event.data && event.data.type === 'coffee:setFailureMode') {
					this.failureMode = event.data.value;
				}
			});
			
			// Request current state
			if (window.emit) emit('coffee:requestState');
		},

		// Step 9: Brew the coffee
		brewCoffee() {
			this.coffeeBrewed = true;
			
			if (this.failureMode) {
				// Fail scenario
				if (window.emit) emit('coffee:water-shortage');
				// We don't show the coffee success popup
				// Instead we could show a failure popup inside the app, but the task system handles the notification.
				// Let's reset the app to avoid confusion or show a specific error message inside the app.
				alert("Erreur : Plus d'eau disponible.");
				this.reset();
			} else {
				// Success scenario
				this.showCoffee = true;
				this.step = 10;
			}
		},

		generateCard() {
			this.card = 'cafe-' + Math.random().toString(36).substr(2, 9);
			this.step = 4; // go to card display
		},

		reset() {
			this.step = 0;
			this.cookiesAccepted = false;
			this.firstTime = null;
			this.card = null;
			this.cardInput = '';
			this.cardAccepted = false;
			this.licenseRenewed = false;
			this.beansGround = false;
			this.beansRefilled = false;
			this.waterHeated = false;
			this.coffeeBrewed = false;
			this.showCoffee = false;
		},

		getRandomSizeClass() {
			const sizes = ['text-base', 'text-lg', 'text-xl', 'text-2xl'];
			const paddings = ['py-2 px-4', 'py-3 px-6', 'py-4 px-8'];
			const randomSize = sizes[Math.floor(Math.random() * sizes.length)];
			const randomPadding = paddings[Math.floor(Math.random() * paddings.length)];
			return `${randomSize} ${randomPadding}`;
		}
	}));
});
