/**
 * @fileoverview Windows Manager - Alpine.js store for Windows 10 simulation
 * @description Unified store managing the Windows desktop simulation including:
 *              - App registry and window management
 *              - Task/mission system with unlock chains and failure states
 *              - Persistence
 */

// =============================================================================
// CONSTANTS
// =============================================================================

const APPS = [
	{ id: 'word', name: 'Word', icon: '📝', category: 'Bureautique', route: '/apps/word' },
	{ id: 'libreoffice', name: 'LibreOffice', icon: '📄', category: 'Bureautique', route: '/apps/libreoffice' },
	{ id: 'cloud', name: 'OneDrive', icon: '☁️', category: 'Outils', route: '/apps/cloud' },
	{ id: 'mail', name: 'Outlook', icon: '📧', category: 'Outils', route: '/apps/mail' },
	{ id: 'coffee', name: 'Café', icon: '☕', category: 'Détente', route: '/apps/coffee' },
	{ id: 'chatbot', name: 'Copilot', icon: '✨', category: 'IA', route: '/apps/chatbot' },
	{ id: 'server-shield', name: 'Server Shield', icon: '🛡️', category: 'Outils', route: '/apps/server-shield' },
	{ id: 'sport', name: 'Pause Sport', icon: '🏃‍♂️', category: 'Santé', route: '/apps/sport' },
	{ id: 'bun', name: 'Inscription RH', icon: '📋', category: 'Outils', route: '/apps/bun' },
	{ id: 'secret-snake', name: 'Snake', icon: '🐍', category: 'Secret', route: '/apps/secret-snake', secret: true },
];

// =============================================================================
// MAILS - Informational messages (no triggers, just content)
// =============================================================================

/**
 * Mail Definitions - Pure informational content
 * @property {string} id - Unique ID
 * @property {string} dialogFile - JSON file in /dialogs/ containing title/description
 * @property {string} sender - Display name of sender
 * @property {string} senderIcon - Emoji icon for sender avatar
 * @property {string} date - Display date
 */
const MAILS = [
	{
		id: 'welcome-mail-1',
		dialogFile: 'welcome-mail-1.json',
		sender: 'Système NDI',
		senderIcon: '🤖',
		date: '04 Déc 10:42',
	},
	{
		id: 'eco-info-mail',
		dialogFile: 'eco-info-mail.json',
		sender: 'Équipe RSE',
		senderIcon: '🌱',
		date: '04 Déc 10:45',
	},
	{
		id: 'water-shortage-mail',
		dialogFile: 'water-shortage-mail.json',
		sender: 'Green IT',
		senderIcon: '🌍',
		date: '04 Déc 11:30',
	},
	{
		id: 'libreoffice-vs-word-mail',
		dialogFile: 'libreoffice-vs-word-mail.json',
		sender: 'Collègue Tech',
		senderIcon: '💡',
		date: '04 Déc 12:00',
	},
	{
		id: 'onedrive-crash-mail',
		dialogFile: 'onedrive-crash-mail.json',
		sender: 'IT Support',
		senderIcon: '💻',
		date: '04 Déc 14:15',
	},
	{
		id: 'end-of-day-mail',
		dialogFile: 'end-of-day-mail.json',
		sender: 'Direction NIRD',
		senderIcon: '🎉',
		date: '04 Déc 17:30',
	},
];

const INITIAL_MAILS = ['welcome-mail-1', 'eco-info-mail'];

/**
 * Task Definitions
 * @property {string} id - Unique ID
 * @property {string} trigger - Event to listen for
 * @property {string} dialogFile - JSON file in /dialogs/ containing pending/success/failure texts
 * @property {Function} validate - Returns true (success), false (failure), or null (ignore).
 *                                If not present, event presence = success.
 * @property {boolean} blocking - If true, prevents other tasks and restricts apps until completed
 * @property {string[]} allowedApps - If blocking, only these apps (plus Mail) are accessible
 * @property {string[]} unlocksTasks - Tasks to unlock on success
 * @property {string[]} unlocksApps - Apps to unlock on success
 */
const TASKS = [
	{
		id: 'open-snake',
		trigger: 'app:opened',
		dialogFile: 'open-snake.json',
		validate: (data) => data.appId === 'snake' ? true : null,
		unlocksTasks: ['score-snake-30'],
		unlocksApps: [],
	},
	{
		id: 'score-snake-30',
		trigger: 'snake:gameOver',
		dialogFile: 'score-snake-30.json',
		validate: (data) => data.score >= 30,
		blocking: true,
		allowedApps: ['snake'],
		unlocksTasks: ['open-typing'],
		unlocksApps: [],
	},
	{
		id: 'prepare-meeting-word',
		trigger: 'word:finished',
		dialogFile: 'prepare-meeting-word.json',
		validate: (data) => false, // Always fails
		unlocksTasks: [],
		unlocksApps: [],
		onFail: {
			unlocksTasks: ['ask-ai'],
			unlocksApps: ['chatbot']
		}
	},
	{
		id: 'ask-ai',
		trigger: 'chatbot:interaction',
		dialogFile: 'ask-ai.json',
		validate: (data) => true,
		unlocksTasks: ['make-coffee-fail'],
		unlocksApps: ['coffee'],
	},
	{
		id: 'make-coffee-fail',
		trigger: 'coffee:water-shortage',
		dialogFile: 'make-coffee-fail.json',
		validate: (data) => false, // Always fails due to shortage
		unlocksTasks: [],
		unlocksApps: [],
		onFail: {
			unlocksTasks: ['prepare-meeting-libreoffice'],
			unlocksApps: ['libreoffice'],
			unlocksMails: ['water-shortage-mail']
		}
	},
	{
		id: 'prepare-meeting-libreoffice',
		trigger: 'libreoffice:finished',
		dialogFile: 'prepare-meeting-libreoffice.json',
		validate: (data) => true, // Always succeeds
		unlocksTasks: ['share-meeting-notes'],
		unlocksApps: ['cloud'],
		unlocksMails: ['libreoffice-vs-word-mail'],
	},
	{
		id: 'share-meeting-notes',
		trigger: 'cloud:download-attempt',
		dialogFile: 'share-meeting-notes.json',
		validate: (data) => false, // The download always fails/hangs
		unlocksTasks: [],
		unlocksApps: [],
		onFail: {
			unlocksTasks: ['repair-cloud-services'],
			unlocksApps: ['server-shield'],
			unlocksMails: ['onedrive-crash-mail']
		},
	},
	{
		id: 'repair-cloud-services',
		trigger: 'server-shield:victory',
		dialogFile: 'repair-cloud-services.json',
		validate: (data) => true,
		unlocksTasks: ['final-inscription'],
		unlocksApps: ['bun'],
		blocking: true,
		allowedApps: ['server-shield', 'mail'],
		fixTask: 'share-meeting-notes'
	},
	{
		id: 'final-inscription',
		trigger: 'bun:finished',
		dialogFile: 'final-inscription.json',
		validate: (data) => true,
		unlocksTasks: [],
		unlocksApps: [],
		unlocksMails: ['end-of-day-mail'],
	},
];
const INITIAL_TASKS = ['welcome-mail-1', 'eco-info-mail', 'prepare-meeting-word'];
const INITIAL_APPS = ['mail', 'word', 'coffee', 'sport', 'secret-snake'];

const CONFIG = {
	window: {
		defaultWidth: 1500,
		defaultHeight: 900,
		minWidth: 400,
		minHeight: 300,
		offsetStep: 30,
		initialX: 80,
		initialY: 40,
	},
	zIndex: { initial: 1000 },
	storageKey: 'ndi-progress',
};

// =============================================================================
// ALPINE STORE
// =============================================================================

document.addEventListener('alpine:init', () => {
	Alpine.store('wm', {
		// State
		basePath: '',
		apps: [],
		windows: [],
		nextZIndex: CONFIG.zIndex.initial,

		// UI State
		showStartMenu: false,
		showSearch: false,
		searchQuery: '',

		// Task State
		// taskStates structure: { [taskId]: { status: 'pending'|'completed'|'failed', content: { title, description } } }
		taskStates: {},
		unlockedTasks: [...INITIAL_TASKS],
		unlockedApps: [...INITIAL_APPS],

		// Mail State
		// mailStates structure: { [mailId]: { read: boolean, content: { title, description } } }
		mailStates: {},
		unlockedMails: [...INITIAL_MAILS],

		notifications: ['mail'],
		toasts: [],
		popups: [],

		// Initialization
		init(basePath = '') {
			this.basePath = basePath === '/' ? '' : basePath;
			this.apps = APPS.map(app => ({ ...app, url: this.basePath + app.route }));
			this.loadProgress();
			this.initMessageBus();

			// Load initial task and mail data
			this.unlockedTasks.forEach(taskId => this.loadTaskData(taskId));
			this.unlockedMails.forEach(mailId => this.loadMailData(mailId));

			// Trigger Welcome Popup (fake security alert)
			setTimeout(() => {
				this.addPopup(
					"Alerte de Sécurité Windows",
					`La version de votre système d’exploitation n’est plus couverte par le support.
					
					Cliquez sur le lien suivant pour passer à la version suivante : <a href="${this.basePath}/fake-update" target="_blank" class="text-blue-600 hover:underline">Mettre à jour maintenant</a>`
				);
			}, 1000);
		},

		initMessageBus() {
			if (window.MessageBus) {
				MessageBus.init((event) => this.handleEvent(event));
			}
		},

		// Notification Methods
		addNotification(appId) {
			if (!this.notifications.includes(appId)) this.notifications.push(appId);
		},
		removeNotification(appId) {
			this.notifications = this.notifications.filter(id => id !== appId);
		},

		// Toast Methods
		showToast(title, message) {
			const id = Date.now() + Math.random();

			let currentToasts = [...this.toasts];
			if (currentToasts.length >= 4) {
				currentToasts = currentToasts.slice(1);
			}
			currentToasts.push({ id, title, message });
			this.toasts = currentToasts;
			// No auto dismiss - user must close manually
		},
		removeToast(id) {
			this.toasts = this.toasts.filter(t => t.id !== id);
		},

		// Popup Methods
		addPopup(title, content) {
			// Prevent duplicates
			if (this.popups.some(p => p.title === title)) return;
			
			const id = Date.now() + Math.random();
			this.popups.push({ id, title, content });
		},
		removePopup(id) {
			this.popups = this.popups.filter(p => p.id !== id);
		},

		// ===================
		// Mail Methods
		// ===================

		async loadMailData(mailId) {
			if (this.mailStates[mailId]?.content) return;

			const mail = MAILS.find(m => m.id === mailId);
			if (!mail || !mail.dialogFile) return;

			try {
				const url = `${this.basePath}/dialogs/${mail.dialogFile}`;
				const response = await fetch(url);
				if (response.ok) {
					const json = await response.json();
					if (!this.mailStates[mailId]) {
						this.mailStates[mailId] = { read: false };
					}
					this.mailStates[mailId].content = json;

					// Show toast for new mail
					if (!this.mailStates[mailId].read) {
						this.showToast(json.pending?.title || json.title, "Nouveau courrier");
					}

					this.sendDataToMail();
				}
			} catch (e) {
				console.error(`Failed to load mail ${mailId}`, e);
			}
		},

		markMailAsRead(mailId) {
			if (!this.mailStates[mailId]) {
				this.mailStates[mailId] = { read: false };
			}
			this.mailStates[mailId].read = true;
			this.saveProgress();
			this.sendDataToMail();
		},

		isMailRead(mailId) {
			return this.mailStates[mailId]?.read === true;
		},

		get availableMails() {
			return MAILS.filter(m => this.unlockedMails.includes(m.id));
		},

		get unreadMailCount() {
			return this.unlockedMails.filter(id => !this.isMailRead(id)).length;
		},

		// ===================
		// Task Methods
		// ===================

		async loadTaskData(taskId) {
			if (this.taskStates[taskId] && this.taskStates[taskId].content) return;

			const task = TASKS.find(t => t.id === taskId);
			if (!task || !task.dialogFile) return;

			try {
				const url = `${this.basePath}/dialogs/${task.dialogFile}`;
				const response = await fetch(url);
				if (response.ok) {
					const json = await response.json();
					if (!this.taskStates[taskId]) {
						this.taskStates[taskId] = { status: 'pending' };
					}
					this.taskStates[taskId].content = json;

					// If this task is pending (newly unlocked), show toast
					if (this.taskStates[taskId].status === 'pending') {
						this.showToast(json.pending.title, "Nouvelle tâche");
					}

					this.sendDataToMail();
				}
			} catch (e) {
				console.error(`Failed to load dialog for ${taskId}`, e);
			}
		},

		get availableTasks() {
			return TASKS.filter(t => this.unlockedTasks.includes(t.id));
		},

		/**
		 * Get tasks formatted for the desktop widget
		 */
		get widgetTasks() {
			const blockingTask = this.activeBlockingTask;
			return TASKS
				.filter(t => this.unlockedTasks.includes(t.id))
				.map(t => {
					const state = this.taskStates[t.id] || { status: 'pending' };
					const content = state.content || {};
					let textData = content.pending;
					if (state.status === 'completed') textData = content.success;
					if (state.status === 'failed') textData = content.failure;
					if (!textData) textData = { title: 'Chargement...', description: '...' };

					return {
						id: t.id,
						title: textData.title,
						description: textData.description,
						status: state.status,
						completed: state.status === 'completed',
						failed: state.status === 'failed',
						blocked: blockingTask && t.id !== blockingTask.id && state.status === 'pending',
					};
				});
		},

		get activeBlockingTask() {
			return TASKS.find(t =>
				this.unlockedTasks.includes(t.id) &&
				t.blocking &&
				!this.isTaskCompleted(t.id) &&
				!this.isTaskFailed(t.id)
			);
		},

		isTaskCompleted(taskId) {
			return this.taskStates[taskId]?.status === 'completed';
		},
		
		isTaskFailed(taskId) {
			return this.taskStates[taskId]?.status === 'failed';
		},

		isAppUnlocked(appId) {
			return this.unlockedApps.includes(appId);
		},

		get availableApps() {
			return this.apps.filter(app => this.isAppUnlocked(app.id) && !app.secret);
		},

		/**
		 * Central Event Handler
		 * Delegates logic to the task definitions themselves
		 */
		handleEvent(event) {
			const { type, data } = event;

			// Mail app requests data (mails + tasks)
			if (type === 'mail:requestData') {
				this.sendDataToMail();
				return;
			}

			// Legacy support
			if (type === 'mail:requestTasks') {
				this.sendDataToMail();
				return;
			}

			// Mark mail as read
			if (type === 'mail:markRead') {
				this.markMailAsRead(data.mailId);
				return;
			}

			if (type === 'coffee:requestState') {
				const isCoffeeFailActive = this.unlockedTasks.includes('make-coffee-fail') && !this.isTaskCompleted('make-coffee-fail');
				
				// Find coffee app window
				const coffeeWins = this.windows.filter(w => w.app.id === 'coffee');
				coffeeWins.forEach(win => {
					const wrapper = document.getElementById(`window-${win.id}`);
					if (wrapper) {
						const iframe = wrapper.querySelector('iframe');
						if (iframe && iframe.contentWindow) {
							iframe.contentWindow.postMessage({
								type: 'coffee:setFailureMode',
								value: isCoffeeFailActive
							}, '*');
						}
					}
				});
				return;
			}

			const blockingTask = this.activeBlockingTask;

			// Iterate over all active tasks to see if any respond to this event
			TASKS.forEach(task => {
				// Ignore locked or completed tasks
				if (!this.unlockedTasks.includes(task.id)) return;
				if (this.isTaskCompleted(task.id)) return;

				// If system is blocked, ONLY process the blocking task
				if (blockingTask && task.id !== blockingTask.id) return;

				// Check Event Trigger
				if (task.trigger !== type) return;

				// Validate Condition
				// If validate() returns true -> Success
				// If validate() returns false -> Failure
				// If validate() returns null -> Ignore (not relevant to this task)
				// If no validate() -> Default Success
				let result = true;
				if (task.validate) {
					result = task.validate(data);
				}

				if (result === true) {
					this.completeTask(task.id);
				} else if (result === false) {
					this.failTask(task.id);
				}
				// if result is null, do nothing
			});
		},

		completeTask(taskId) {
			if (this.isTaskCompleted(taskId)) return;

			// Update status
			if (!this.taskStates[taskId]) this.taskStates[taskId] = {};
			this.taskStates[taskId].status = 'completed';

			// Notify user of success
			this.addNotification('mail');
			const content = this.taskStates[taskId].content?.success;
			if (content) this.showToast(content.title, "Mission accomplie");

			const task = TASKS.find(t => t.id === taskId);
			let newTasksUnlocked = false;

			// Process unlocks defined in the task
			if (task.unlocksTasks) {
				task.unlocksTasks.forEach(id => {
					if (!this.unlockedTasks.includes(id)) {
						this.unlockedTasks.push(id);
						this.loadTaskData(id);
						newTasksUnlocked = true;
					}
				});
			}

			// Unlock apps
			if (task.unlocksApps) {
				task.unlocksApps.forEach(id => {
					if (!this.unlockedApps.includes(id)) {
						this.unlockedApps.push(id);
					}
				});
			}

			// Unlock mails on success
			if (task.unlocksMails) {
				task.unlocksMails.forEach(id => {
					if (!this.unlockedMails.includes(id)) {
						this.unlockedMails.push(id);
						this.loadMailData(id);
					}
				});
			}

			// Fix other tasks if specified
			if (task.fixTask) {
				if (!this.taskStates[task.fixTask]) this.taskStates[task.fixTask] = {};
				this.taskStates[task.fixTask].status = 'completed';
				this.addNotification('mail');
			}

			if (newTasksUnlocked) this.addNotification('mail');

			this.saveProgress();
			this.sendDataToMail();
		},

		failTask(taskId) {
			if (this.isTaskCompleted(taskId)) return;
			if (this.isTaskFailed(taskId)) return;

			if (!this.taskStates[taskId]) this.taskStates[taskId] = {};
			this.taskStates[taskId].status = 'failed';

			const task = TASKS.find(t => t.id === taskId);

			// Handle onFail unlocks
			if (task.onFail) {
				if (task.onFail.unlocksTasks) {
					task.onFail.unlocksTasks.forEach(id => {
						if (!this.unlockedTasks.includes(id)) {
							this.unlockedTasks.push(id);
							this.loadTaskData(id);
						}
					});
				}
				if (task.onFail.unlocksApps) {
					task.onFail.unlocksApps.forEach(id => {
						if (!this.unlockedApps.includes(id)) {
							this.unlockedApps.push(id);
						}
					});
				}
				// Unlock mails on failure
				if (task.onFail.unlocksMails) {
					task.onFail.unlocksMails.forEach(id => {
						if (!this.unlockedMails.includes(id)) {
							this.unlockedMails.push(id);
							this.loadMailData(id);
						}
					});
				}
			}

			this.addNotification('mail');
			const content = this.taskStates[taskId].content?.failure;
			if (content) this.showToast(content.title, "Mission échouée");
		
			this.saveProgress();
			this.sendDataToMail();
		},

		/**
		 * Send mails and tasks data to the Mail app
		 */
		sendDataToMail() {
			const blockingTask = this.activeBlockingTask;

			// Prepare mails data
			const mailsData = MAILS
				.filter(m => this.unlockedMails.includes(m.id))
				.map(m => {
					const state = this.mailStates[m.id] || { read: false };
					const content = state.content?.pending || state.content || {};

					return {
						id: m.id,
						title: content.title || 'Chargement...',
						description: content.description || '...',
						sender: m.sender,
						senderIcon: m.senderIcon,
						date: m.date,
						read: state.read,
					};
				});

			// Prepare tasks data
			const tasksData = TASKS
				.filter(t => this.unlockedTasks.includes(t.id))
				.map(t => {
					const state = this.taskStates[t.id] || { status: 'pending' };
					const content = state.content || {};

					// Select text based on status
					let textData = content.pending;
					if (state.status === 'completed') textData = content.success;
					if (state.status === 'failed') textData = content.failure;

					// Fallback if JSON not loaded yet
					if (!textData) {
						textData = { title: 'Chargement...', description: '...' };
					}

					// Determine if this specific task is "blocked" by another blocking task
					const isBlockedBySystem = blockingTask && t.id !== blockingTask.id && !state.status.includes('completed');

					return {
						id: t.id,
						title: textData.title,
						description: textData.description,
						completed: state.status === 'completed',
						failed: state.status === 'failed',
						blocked: isBlockedBySystem,
						status: state.status,
						unlocksApps: t.unlocksApps
					};
				})
				.sort((a, b) => {
					// Sort: Pending/Failed first, Completed last
					const scoreA = a.completed ? 2 : (a.failed ? 1 : 0);
					const scoreB = b.completed ? 2 : (b.failed ? 1 : 0);
					return scoreA - scoreB;
				});

			// Find all iframe windows with the mail app
			const mailWindows = this.windows.filter(w => w.app.id === 'mail');
			mailWindows.forEach(win => {
				const wrapper = document.getElementById(`window-${win.id}`);
				if (wrapper) {
					const iframe = wrapper.querySelector('iframe');
					if (iframe && iframe.contentWindow) {
						iframe.contentWindow.postMessage({
							type: 'mail:updateData',
							data: { mails: mailsData, tasks: tasksData }
						}, '*');
					}
				}
			});
		},
		// Persistence
		saveProgress() {
			const simplifiedTaskStates = {};
			Object.keys(this.taskStates).forEach(key => {
				simplifiedTaskStates[key] = { status: this.taskStates[key].status };
			});

			const simplifiedMailStates = {};
			Object.keys(this.mailStates).forEach(key => {
				simplifiedMailStates[key] = { read: this.mailStates[key].read };
			});

			const data = {
				taskStates: simplifiedTaskStates,
				unlockedTasks: this.unlockedTasks,
				unlockedApps: this.unlockedApps,
				mailStates: simplifiedMailStates,
				unlockedMails: this.unlockedMails,
			};
			localStorage.setItem(CONFIG.storageKey, JSON.stringify(data));
		},

		loadProgress() {
			try {
				const saved = localStorage.getItem(CONFIG.storageKey);
				if (saved) {
					const data = JSON.parse(saved);
					this.taskStates = data.taskStates || {};
					this.unlockedTasks = data.unlockedTasks || [...INITIAL_TASKS];
					this.unlockedApps = data.unlockedApps || [...INITIAL_APPS];
					this.mailStates = data.mailStates || {};
					this.unlockedMails = data.unlockedMails || [...INITIAL_MAILS];
				}
			} catch (e) {
				console.warn('Failed to load progress:', e);
			}
		},

		resetProgress() {
			this.taskStates = {};
			this.unlockedTasks = [...INITIAL_TASKS];
			this.unlockedApps = [...INITIAL_APPS];
			this.mailStates = {};
			this.unlockedMails = [...INITIAL_MAILS];
			this.notifications = ['mail'];
			localStorage.removeItem(CONFIG.storageKey);

			this.unlockedTasks.forEach(taskId => this.loadTaskData(taskId));
			this.unlockedMails.forEach(mailId => this.loadMailData(mailId));
			this.sendDataToMail();
		},

		// Search & Window Management
		get searchResults() {
			if (!this.searchQuery.trim()) return [];
			const q = this.searchQuery.toLowerCase();
			
			const results = this.availableApps.filter(app =>
				app.name.toLowerCase().includes(q) ||
				app.category.toLowerCase().includes(q)
			);

			if (this.searchQuery === 'Snake') {
				const secretApp = this.apps.find(a => a.id === 'secret-snake');
				if (secretApp) results.push(secretApp);
			}

			return results;
		},

				openApp(app) {

					if (!this.isAppUnlocked(app.id) && !app.secret) return null;

		

					this.removeNotification(app.id);
			const id = `win-${Date.now()}`;
			const offset = this.windows.length * CONFIG.window.offsetStep;
			this.windows.push({
				id, app,
				x: CONFIG.window.initialX + offset,
				y: CONFIG.window.initialY + offset,
				width: CONFIG.window.defaultWidth,
				height: CONFIG.window.defaultHeight,
				minimized: false, maximized: false,
				zIndex: this.nextZIndex++,
				prev: null,
			});
			this.closeMenus();
			return id;
		},
		closeWindow(id) { this.windows = this.windows.filter(w => w.id !== id); },
		focusWindow(id) {
			const win = this.windows.find(w => w.id === id);
			if (win) { win.zIndex = this.nextZIndex++; if (win.minimized) win.minimized = false; }
		},
		minimizeWindow(id) { const w = this.windows.find(w => w.id === id); if(w) w.minimized = !w.minimized; },
		toggleMaximize(id) {
			const win = this.windows.find(w => w.id === id);
			if (!win) return;
			if (win.maximized) { Object.assign(win, win.prev); win.maximized = false; win.prev = null; }
			else { win.prev = { x: win.x, y: win.y, width: win.width, height: win.height }; win.maximized = true; win.x = 0; win.y = 0; }
		},
		startDrag(id, event) {
			const win = this.windows.find(w => w.id === id);
			if (!win || win.maximized) return;
			this.focusWindow(id);
			const startX = event.clientX - win.x;
			const startY = event.clientY - win.y;
			const onMove = (e) => { win.x = e.clientX - startX; win.y = e.clientY - startY; };
			const onUp = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
			document.addEventListener('mousemove', onMove, { passive: true });
			document.addEventListener('mouseup', onUp);
		},
		startResize(id, event, handle) {
			event.preventDefault(); event.stopPropagation();
			const win = this.windows.find(w => w.id === id);
			if (!win || win.maximized) return;
			this.focusWindow(id);
			const start = { x: event.clientX, y: event.clientY, width: win.width, height: win.height, left: win.x, top: win.y };
			const onMove = (e) => {
				const dx = e.clientX - start.x; const dy = e.clientY - start.y;
				const minW = CONFIG.window.minWidth; const minH = CONFIG.window.minHeight;
				if (handle.includes('e')) win.width = Math.max(minW, start.width + dx);
				if (handle.includes('w')) { win.width = Math.max(minW, start.width - dx); win.x = start.left + (start.width - win.width); }
				if (handle.includes('s')) win.height = Math.max(minH, start.height + dy);
				if (handle.includes('n')) { win.height = Math.max(minH, start.height - dy); win.y = start.top + (start.height - win.height); }
			};
			const onUp = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
			document.addEventListener('mousemove', onMove, { passive: false });
			document.addEventListener('mouseup', onUp);
		},
		toggleStartMenu() { this.showStartMenu = !this.showStartMenu; if (this.showStartMenu) this.showSearch = false; },
		openSearch() { this.showSearch = true; this.showStartMenu = false; },
		closeSearch() { this.showSearch = false; this.searchQuery = ''; },
		closeMenus() { this.showStartMenu = false; this.closeSearch(); },
		onTaskbarClick(id) {
			const win = this.windows.find(w => w.id === id);
			if (win) { if (win.minimized) { win.minimized = false; this.focusWindow(id); } else { win.minimized = true; } }
		},
	});
});