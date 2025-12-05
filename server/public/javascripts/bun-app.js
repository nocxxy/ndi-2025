/**
 * @fileoverview Bun App - Alpine.js component
 * @description The "Bun" app (similar to Coffee app) for the final registration task.
 */

document.addEventListener('alpine:init', () => {
	Alpine.data('bunApp', () => ({
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

		init() {
			if (window.emit) emit('app:opened', { appId: 'bun' });
		},

		generateCard() {
			this.card = 'bun-' + Math.random().toString(36).substr(2, 9);
			this.step = 4;
		},

		reset() {
			this.step = 0;
			// Reset other states...
		},

		finish() {
			this.coffeeBrewed = true;
			this.showCoffee = true;
			this.step = 10;
			
			// Emit completion event
			if (window.emit) emit('bun:finished');
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
