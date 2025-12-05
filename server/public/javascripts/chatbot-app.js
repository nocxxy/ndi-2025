/**
 * @fileoverview Chatbot App - Alpine.js component
 * @description Simulates a conversation with a "Copilot" style AI.
 *              Used to trigger the "water shortage" event in the Coffee app.
 */

document.addEventListener('alpine:init', () => {
	Alpine.data('chatbotApp', () => ({
		messages: [
			{ role: 'system', content: "Bonjour ! Je suis votre assistant virtuel. Comment puis-je vous aider aujourd'hui ?" }
		],
		userInput: '',
		isTyping: false,

		init() {
			if (window.emit) emit('app:opened', { appId: 'chatbot' });
		},

		sendMessage() {
			if (!this.userInput.trim()) return;

			// Add user message
			this.messages.push({ role: 'user', content: this.userInput });
			const question = this.userInput;
			this.userInput = '';
			this.isTyping = true;

			// Scroll to bottom
			this.$nextTick(() => this.scrollToBottom());

			// Simulate AI response
			setTimeout(() => {
				this.isTyping = false;
				const response = this.generateResponse(question);
				this.messages.push({ role: 'ai', content: response });
				this.$nextTick(() => this.scrollToBottom());

				// Emit event that interaction happened
				if (window.emit) emit('chatbot:interaction', { question });
			}, 1500);
		},

		generateResponse(question) {
			const responses = [
				"C'est une excellente question ! D'après ma base de données, la réponse est 42.",
				"Je vois ce que vous voulez dire. C'est fascinant.",
				"Pourriez-vous reformuler ? J'étais en train de rêver de moutons électriques.",
				"En effet, l'impact environnemental du numérique est un sujet crucial.",
				"Absolument ! Saviez-vous qu'une seule requête à une IA consomme environ 500ml d'eau pour le refroidissement des serveurs ?"
			];
			return responses[Math.floor(Math.random() * responses.length)];
		},

		scrollToBottom() {
			const container = document.getElementById('chat-container');
			if (container) container.scrollTop = container.scrollHeight;
		}
	}));
});
