/**
 * @fileoverview Windows Manager - Alpine.js store for Windows 10 simulation
 * @description Unified store managing the Windows desktop simulation including:
 *              - App registry and window management (open, close, minimize, maximize)
 *              - Task/mission system with unlock chains
 *              - Drag & resize functionality
 *              - localStorage persistence for progress
 *
 * @requires Alpine.js
 * @requires message-bus.js (for iframe communication)
 *
 * @example
 * // Initialize in template:
 * <body x-data x-init="$store.wm.init('/ndi')">
 *
 * // Access store:
 * $store.wm.openApp(app)
 * $store.wm.availableTasks
 */

// =============================================================================
// APP REGISTRY
// Add new apps here. They will appear on the desktop once unlocked.
// =============================================================================

/**
 * @typedef {Object} App
 * @property {string} id - Unique identifier
 * @property {string} name - Display name
 * @property {string} icon - Emoji icon
 * @property {string} category - Category for search
 * @property {string} route - URL route (will be prefixed with basePath)
 */

/** @type {App[]} */
const APPS = [
	{ id: 'snake', name: 'Snake', icon: '🐍', category: 'Jeux', route: '/apps/snake' },
	{ id: 'typing', name: 'Typing Speed', icon: '⌨️', category: 'Outils', route: '/apps/typing' },
	{ id: 'mail', name: 'Mail', icon: '📧', category: 'Outils', route: '/apps/mail' },
];

// =============================================================================
// TASK REGISTRY
// Add new tasks here. Tasks unlock sequentially based on triggers and conditions.
// =============================================================================

/**
 * @typedef {Object} Task
 * @property {string} id - Unique identifier
 * @property {string} title - Display title
 * @property {string} description - Task description
 * @property {string} trigger - Event type that can complete this task
 * @property {Object} condition - Conditions to check against event data
 * @property {string[]} unlocksTasks - Task IDs to unlock on completion
 * @property {string[]} unlocksApps - App IDs to unlock on completion
 */

/** @type {Task[]} */
const TASKS = [
	{
		id: 'open-snake',
		title: 'Lancer Snake',
		description: 'Ouvre le jeu Snake',
		trigger: 'app:opened',
		condition: { appId: 'snake' },
		unlocksTasks: ['score-snake-30'],
		unlocksApps: [],
	},
	{
		id: 'score-snake-30',
		title: 'Marquer 30 points',
		description: 'Atteins un score de 30 au Snake',
		trigger: 'snake:gameOver',
		condition: { score: 30 },
		unlocksTasks: ['open-typing'],
		unlocksApps: [],
	},
	{
		id: 'open-typing',
		title: 'Lancer Typing Speed',
		description: 'Ouvre le test de frappe',
		trigger: 'app:opened',
		condition: { appId: 'typing' },
		unlocksTasks: ['wpm-25'],
		unlocksApps: [],
	},
	{
		id: 'wpm-25',
		title: 'Atteindre 25 WPM',
		description: 'Tape à 25 mots par minute',
		trigger: 'typing:finished',
		condition: { wpm: 25 },
		unlocksTasks: [],
		unlocksApps: [],
	},
];

/** @type {string[]} Tasks unlocked at start */
const INITIAL_TASKS = ['open-snake', 'open-typing', 'wpm-25', 'score-snake-30'];

/** @type {string[]} Apps unlocked at start */
const INITIAL_APPS = ['mail', 'snake', 'typing'];

// =============================================================================
// CONFIGURATION
// =============================================================================

const CONFIG = {
	window: {
		defaultWidth: 800,
		defaultHeight: 500,
		minWidth: 300,
		minHeight: 200,
		offsetStep: 30,   // Cascade offset for new windows
		initialX: 100,
		initialY: 80,
	},
	zIndex: { initial: 1000 },
	storageKey: 'ndi-progress',
};

// =============================================================================
// ALPINE STORE
// =============================================================================

document.addEventListener('alpine:init', () => {
	Alpine.store('wm', {
		// =====================================================================
		// State
		// =====================================================================

		/** @type {string} Base path for URL generation */
		basePath: '',

		/** @type {App[]} All apps with computed URLs */
		apps: [],

		/** @type {Object[]} Currently open windows */
		windows: [],

		/** @type {number} Next z-index for window layering */
		nextZIndex: CONFIG.zIndex.initial,

		// =====================================================================
		// UI State
		// =====================================================================

		/** @type {boolean} Start menu visibility */
		showStartMenu: false,

		/** @type {boolean} Search overlay visibility */
		showSearch: false,

		/** @type {string} Current search query */
		searchQuery: '',

		// =====================================================================
		// Task State
		// =====================================================================

		/** @type {string[]} IDs of completed tasks */
		completedTasks: [],

		/** @type {string[]} IDs of unlocked (available) tasks */
		unlockedTasks: [...INITIAL_TASKS],

		/** @type {string[]} IDs of unlocked apps */
		unlockedApps: [...INITIAL_APPS],

		/** @type {string[]} IDs of apps with pending notifications */
		notifications: ['mail'],

		// =====================================================================
		// Initialization
		// =====================================================================

		/**
		 * Initialize the store
		 * @param {string} basePath - Base path for URL generation (e.g., '/ndi')
		 */
		init(basePath = '') {
			this.basePath = basePath === '/' ? '' : basePath;
			this.apps = APPS.map(app => ({
				...app,
				url: this.basePath + app.route,
			}));
			this.loadProgress();
			this.initMessageBus();
		},

		/**
		 * Initialize message bus listener for iframe communication
		 */
		initMessageBus() {
			if (window.MessageBus) {
				MessageBus.init((event) => this.handleEvent(event));
			}
		},

		// =====================================================================
		// Notification Methods
		// =====================================================================

		/**
		 * Add a notification for an app
		 * @param {string} appId
		 */
		addNotification(appId) {
			if (!this.notifications.includes(appId)) {
				this.notifications.push(appId);
			}
		},

		/**
		 * Remove notification for an app
		 * @param {string} appId
		 */
		removeNotification(appId) {
			this.notifications = this.notifications.filter(id => id !== appId);
		},

		// =====================================================================
		// Task Methods
		// =====================================================================

		/**
		 * Get all unlocked tasks
		 * @returns {Task[]}
		 */
		get availableTasks() {
			return TASKS.filter(t => this.unlockedTasks.includes(t.id));
		},

		/**
		 * Get the current (first uncompleted) task
		 * @returns {Task|undefined}
		 */
		get currentTask() {
			return this.availableTasks.find(t => !this.completedTasks.includes(t.id));
		},

		/**
		 * Check if a task is completed
		 * @param {string} taskId
		 * @returns {boolean}
		 */
		isTaskCompleted(taskId) {
			return this.completedTasks.includes(taskId);
		},

		/**
		 * Check if an app is unlocked
		 * @param {string} appId
		 * @returns {boolean}
		 */
		isAppUnlocked(appId) {
			return this.unlockedApps.includes(appId);
		},

		/**
		 * Get all unlocked apps
		 * @returns {App[]}
		 */
		get availableApps() {
			return this.apps.filter(app => this.isAppUnlocked(app.id));
		},

		/**
		 * Handle event from iframe (via message-bus)
		 * Checks all unlocked tasks for matching trigger and conditions
		 * @param {{type: string, data: Object}} event
		 */
		handleEvent(event) {
			const { type, data } = event;

			if (type === 'mail:requestTasks') {
				this.sendTasksToMail();
				return;
			}

			TASKS.forEach(task => {
				// Skip if already completed or not unlocked
				if (this.completedTasks.includes(task.id)) return;
				if (!this.unlockedTasks.includes(task.id)) return;
				if (task.trigger !== type) return;

				if (this.checkCondition(task.condition, data)) {
					this.completeTask(task.id);
				}
			});
		},

		/**
		 * Check if event data satisfies task condition
		 * Numbers use >= comparison, others use strict equality
		 * @param {Object} condition - Expected values
		 * @param {Object} data - Actual event data
		 * @returns {boolean}
		 */
		checkCondition(condition, data) {
			for (const [key, expected] of Object.entries(condition)) {
				const actual = data[key];
				if (typeof expected === 'number') {
					if (actual < expected) return false;
				} else {
					if (actual !== expected) return false;
				}
			}
			return true;
		},

		/**
		 * Send current tasks to all open Mail app instances
		 */
		sendTasksToMail() {
			// Format tasks for display
			const tasksData = TASKS
				.filter(t => this.unlockedTasks.includes(t.id))
				.map(t => ({
					...t,
					completed: this.completedTasks.includes(t.id)
				}))
				.sort((a, b) => {
					if (a.completed === b.completed) return 0;
					return a.completed ? 1 : -1; // Completed last
				});

			// Find all iframe windows with the mail app
			const mailWindows = this.windows.filter(w => w.app.id === 'mail');
			mailWindows.forEach(win => {
				const wrapper = document.getElementById(`window-${win.id}`);
				if (wrapper) {
					const iframe = wrapper.querySelector('iframe');
					if (iframe && iframe.contentWindow) {
						iframe.contentWindow.postMessage({
							type: 'mail:updateTasks',
							data: tasksData
						}, '*');
					}
				}
			});
		},

		/**
		 * Mark a task as completed and unlock subsequent tasks/apps
		 * @param {string} taskId
		 */
		completeTask(taskId) {
			if (this.completedTasks.includes(taskId)) return;

			const task = TASKS.find(t => t.id === taskId);
			if (!task) return;

			this.completedTasks.push(taskId);

			// Unlock new tasks
			let newTasksUnlocked = false;
			task.unlocksTasks.forEach(id => {
				if (!this.unlockedTasks.includes(id)) {
					this.unlockedTasks.push(id);
					newTasksUnlocked = true;
				}
			});

			// Unlock new apps
			task.unlocksApps.forEach(id => {
				if (!this.unlockedApps.includes(id)) {
					this.unlockedApps.push(id);
				}
			});

			// Notify mail app if new tasks are unlocked
			if (newTasksUnlocked) {
				this.addNotification('mail');
			}

			this.saveProgress();
			this.sendTasksToMail(); // Update UI
		},

		// =====================================================================
		// Persistence (localStorage)
		// =====================================================================

		/**
		 * Save progress to localStorage
		 */
		saveProgress() {
			const data = {
				completedTasks: this.completedTasks,
				unlockedTasks: this.unlockedTasks,
				unlockedApps: this.unlockedApps,
			};
			localStorage.setItem(CONFIG.storageKey, JSON.stringify(data));
		},

		/**
		 * Load progress from localStorage
		 */
		loadProgress() {
			try {
				const saved = localStorage.getItem(CONFIG.storageKey);
				if (saved) {
					const data = JSON.parse(saved);
					this.completedTasks = data.completedTasks || [];
					this.unlockedTasks = data.unlockedTasks || [...INITIAL_TASKS];
					this.unlockedApps = data.unlockedApps || [...INITIAL_APPS];
				}
			} catch (e) {
				console.warn('Failed to load progress:', e);
			}
		},

		/**
		 * Reset all progress to initial state
		 */
		resetProgress() {
			this.completedTasks = [];
			this.unlockedTasks = [...INITIAL_TASKS];
			this.unlockedApps = [...INITIAL_APPS];
			this.notifications = ['mail']; // Reset notifications
			localStorage.removeItem(CONFIG.storageKey);
			this.sendTasksToMail();
		},

		// =====================================================================
		// Search
		// =====================================================================

		/**
		 * Get apps matching search query
		 * @returns {App[]}
		 */
		get searchResults() {
			if (!this.searchQuery.trim()) return [];
			const q = this.searchQuery.toLowerCase();
			return this.availableApps.filter(app =>
				app.name.toLowerCase().includes(q) ||
				app.category.toLowerCase().includes(q)
			);
		},

		// =====================================================================
		// Window Management
		// =====================================================================

		/**
		 * Open an app in a new window
		 * @param {App} app - App to open
		 * @returns {string|null} Window ID or null if app is locked
		 */
		openApp(app) {
			if (!this.isAppUnlocked(app.id)) return null;

			this.removeNotification(app.id);

			const id = `win-${Date.now()}`;
			const offset = this.windows.length * CONFIG.window.offsetStep;

			this.windows.push({
				id,
				app,
				x: CONFIG.window.initialX + offset,
				y: CONFIG.window.initialY + offset,
				width: CONFIG.window.defaultWidth,
				height: CONFIG.window.defaultHeight,
				minimized: false,
				maximized: false,
				zIndex: this.nextZIndex++,
				prev: null, // Stored state for restore after maximize
			});

			this.closeMenus();
			return id;
		},

		/**
		 * Close a window
		 * @param {string} id - Window ID
		 */
		closeWindow(id) {
			this.windows = this.windows.filter(w => w.id !== id);
		},

		/**
		 * Focus a window (bring to front, unminimize if needed)
		 * @param {string} id - Window ID
		 */
		focusWindow(id) {
			const win = this.windows.find(w => w.id === id);
			if (win) {
				win.zIndex = this.nextZIndex++;
				if (win.minimized) win.minimized = false;
			}
		},

		/**
		 * Toggle window minimized state
		 * @param {string} id - Window ID
		 */
		minimizeWindow(id) {
			const win = this.windows.find(w => w.id === id);
			if (win) win.minimized = !win.minimized;
		},

		/**
		 * Toggle window maximized state
		 * @param {string} id - Window ID
		 */
		toggleMaximize(id) {
			const win = this.windows.find(w => w.id === id);
			if (!win) return;

			if (win.maximized) {
				// Restore previous position/size
				if (win.prev) Object.assign(win, win.prev);
				win.maximized = false;
				win.prev = null;
			} else {
				// Save current state and maximize
				win.prev = { x: win.x, y: win.y, width: win.width, height: win.height };
				win.maximized = true;
				win.x = 0;
				win.y = 0;
			}
		},

		// =====================================================================
		// Drag & Resize
		// =====================================================================

		/**
		 * Start dragging a window
		 * @param {string} id - Window ID
		 * @param {MouseEvent} event
		 */
		startDrag(id, event) {
			const win = this.windows.find(w => w.id === id);
			if (!win || win.maximized) return;

			this.focusWindow(id);
			const startX = event.clientX - win.x;
			const startY = event.clientY - win.y;

			const onMove = (e) => {
				win.x = e.clientX - startX;
				win.y = e.clientY - startY;
			};

			const onUp = () => {
				document.removeEventListener('mousemove', onMove);
				document.removeEventListener('mouseup', onUp);
			};

			document.addEventListener('mousemove', onMove, { passive: true });
			document.addEventListener('mouseup', onUp);
		},

		/**
		 * Start resizing a window
		 * @param {string} id - Window ID
		 * @param {MouseEvent} event
		 * @param {string} handle - Resize handle direction (n, s, e, w, ne, nw, se, sw)
		 */
		startResize(id, event, handle) {
			event.preventDefault();
			event.stopPropagation();

			const win = this.windows.find(w => w.id === id);
			if (!win || win.maximized) return;

			this.focusWindow(id);
			const start = {
				x: event.clientX,
				y: event.clientY,
				width: win.width,
				height: win.height,
				left: win.x,
				top: win.y,
			};

			const onMove = (e) => {
				const dx = e.clientX - start.x;
				const dy = e.clientY - start.y;
				const minW = CONFIG.window.minWidth;
				const minH = CONFIG.window.minHeight;

				if (handle.includes('e')) win.width = Math.max(minW, start.width + dx);
				if (handle.includes('w')) {
					win.width = Math.max(minW, start.width - dx);
					win.x = start.left + (start.width - win.width);
				}
				if (handle.includes('s')) win.height = Math.max(minH, start.height + dy);
				if (handle.includes('n')) {
					win.height = Math.max(minH, start.height - dy);
					win.y = start.top + (start.height - win.height);
				}
			};

			const onUp = () => {
				document.removeEventListener('mousemove', onMove);
				document.removeEventListener('mouseup', onUp);
			};

			document.addEventListener('mousemove', onMove, { passive: false });
			document.addEventListener('mouseup', onUp);
		},

		// =====================================================================
		// UI Methods
		// =====================================================================

		/** Toggle start menu visibility */
		toggleStartMenu() {
			this.showStartMenu = !this.showStartMenu;
			if (this.showStartMenu) this.showSearch = false;
		},

		/** Open search overlay */
		openSearch() {
			this.showSearch = true;
			this.showStartMenu = false;
		},

		/** Close search overlay and clear query */
		closeSearch() {
			this.showSearch = false;
			this.searchQuery = '';
		},

		/** Close all menus (start menu and search) */
		closeMenus() {
			this.showStartMenu = false;
			this.closeSearch();
		},

		/**
		 * Handle taskbar window button click
		 * Toggles minimize or focuses window
		 * @param {string} id - Window ID
		 */
		onTaskbarClick(id) {
			const win = this.windows.find(w => w.id === id);
			if (win) {
				if (win.minimized) {
					win.minimized = false;
					this.focusWindow(id);
				} else {
					win.minimized = true;
				}
			}
		},
	});
});
