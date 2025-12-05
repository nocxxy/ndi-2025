/**
 * @fileoverview Mail App - Alpine.js component
 * @description Outlook-style mail client for the NDI Windows simulation.
 *              Displays mails with read/unread state.
 *
 * @requires Alpine.js
 * @requires message-bus.js (for parent communication)
 */

document.addEventListener('alpine:init', () => {
	Alpine.data('mailApp', () => ({
		// ===================
		// State
		// ===================

		/** @type {Array} List of mails */
		mails: [],

		/** @type {Object|null} Currently selected mail */
		selectedMail: null,

		// ===================
		// Lifecycle
		// ===================

		/**
		 * Initialize the component
		 */
		init() {
			// Listen for data from parent
			window.addEventListener('message', (event) => {
				if (event.data?.type === 'mail:updateData') {
					this.handleDataUpdate(event.data.data);
				}
			});

			// Request initial data
			this.fetchData();

			// Notify parent that app is opened
			if (window.emit) emit('app:opened', { appId: 'mail' });
		},

		// ===================
		// Data Handling
		// ===================

		/**
		 * Request latest data from the parent window
		 */
		fetchData() {
			if (window.emit) emit('mail:requestData');
		},

		/**
		 * Process data updates from parent
		 * @param {Object} data - { mails: Array, tasks: Array }
		 */
		handleDataUpdate(data) {
			this.mails = data.mails || [];

			// Handle mail selection
			if (!this.selectedMail && this.mails.length > 0) {
				this.selectMail(this.mails[0]);
			} else if (this.selectedMail) {
				const updated = this.mails.find(m => m.id === this.selectedMail.id);
				this.selectedMail = updated || (this.mails.length > 0 ? this.mails[0] : null);
			}
		},

		// ===================
		// Mail Actions
		// ===================

		/**
		 * Select a mail and mark as read
		 * @param {Object} mail - Mail object to select
		 */
		selectMail(mail) {
			this.selectedMail = mail;

			// Mark as read if unread
			if (!mail.read && window.emit) {
				emit('mail:markRead', { mailId: mail.id });
			}
		},

		// ===================
		// Computed Properties
		// ===================

		/**
		 * Count of unread mails
		 * @returns {number}
		 */
		get unreadMailCount() {
			return this.mails.filter(m => !m.read).length;
		}
	}));
});
