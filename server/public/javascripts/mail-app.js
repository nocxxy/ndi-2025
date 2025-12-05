/**
 * @fileoverview Mail App - Alpine.js component
 * @description Outlook-style mail client for the NDI Windows simulation.
 *              Displays tasks as emails with "read" status and completion badges.
 *              Communicates with parent window via message-bus to sync tasks.
 *
 * @requires Alpine.js
 * @requires message-bus.js (for parent communication)
 *
 * @example
 * // In HTML template:
 * <body x-data="mailApp">
 */

document.addEventListener('alpine:init', () => {
	Alpine.data('mailApp', () => ({
		// ===================
		// State
		// ===================

		/** @type {Array<{id: string, title: string, description: string, completed: boolean, unlocksApps?: string[]}>} List of tasks */
		tasks: [],

		/** @type {Object|null} Currently selected task for reading pane */
		selectedTask: null,

		// ===================
		// Lifecycle
		// ===================

		/**
		 * Initialize the component
		 * - Sets up message listener for task updates
		 * - Requests initial tasks
		 * - Notifies parent window that app is opened
		 */
		init() {
			// Listen for tasks data from parent
			window.addEventListener('message', (event) => {
				if (event.data && event.data.type === 'mail:updateTasks') {
					this.handleTasksUpdate(event.data.data);
				}
			});

			// Request initial tasks
			this.fetchTasks();

			// Notify parent that app is opened
			if (window.emit) emit('app:opened', { appId: 'mail' });
		},

		// ===================
		// Data Handling
		// ===================

		/**
		 * Request latest tasks from the parent window (Window Manager)
		 */
		fetchTasks() {
			if (window.emit) emit('mail:requestTasks');
		},

		/**
		 * Process task updates from parent
		 * Preserves selection if possible
		 * @param {Array} newTasks - Updated list of tasks
		 */
		handleTasksUpdate(newTasks) {
			this.tasks = newTasks;

			// Handle selection logic
			if (!this.selectedTask && this.tasks.length > 0) {
				// Auto-select first email if nothing is selected
				this.selectedTask = this.tasks[0];
			} else if (this.selectedTask) {
				// Update the currently selected task with fresh data (e.g. if status changed)
				const updated = this.tasks.find(t => t.id === this.selectedTask.id);
				if (updated) {
					this.selectedTask = updated;
				} else {
					// If selected task no longer exists (unlikely but safe), select first
					this.selectedTask = this.tasks.length > 0 ? this.tasks[0] : null;
				}
			}
		},

		// ===================
		// UI Actions
		// ===================

		/**
		 * Select a task to view in reading pane
		 * @param {Object} task - Task object to select
		 */
		selectTask(task) {
			this.selectedTask = task;
		}
	}));
});
