/**
 * Message Bus - Communication utility for parent-iframe messaging
 *
 * Usage in apps (iframe):
 *   emit('snake:gameOver', { score: 50 })
 *
 * Usage in parent:
 *   MessageBus.init((event) => console.log(event.type, event.data))
 */

(function() {
	const SOURCE_ID = 'ndi-app';

	// Parent-side: Listen for messages from iframes
	window.MessageBus = {
		listeners: [],

		init(callback) {
			window.addEventListener('message', (e) => {
				if (e.data?.source === SOURCE_ID) {
					callback({ type: e.data.type, data: e.data.data });
				}
			});
		},

		// Send message to a specific iframe
		sendTo(iframe, type, data) {
			iframe.contentWindow?.postMessage({ source: SOURCE_ID, type, data }, '*');
		}
	};

	// Child-side (apps): Send messages to parent
	window.emit = function(type, data = {}) {
		if (window.parent !== window) {
			window.parent.postMessage({ source: SOURCE_ID, type, data }, '*');
		}
	};
})();
