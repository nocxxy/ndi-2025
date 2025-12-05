/**
 * @fileoverview Cloud App - Alpine.js component
 * @description Simulates a cloud storage interface (OneDrive).
 *              Handles file listing and "download" simulation which triggers a system failure.
 */

document.addEventListener('alpine:init', () => {
	Alpine.data('cloudApp', () => ({
		files: [
			{ name: "Compte_Rendu.txt", modified: "Il y a 10 minutes", size: "2.4 MB" },
			{ name: "Notes_Reunion.txt", modified: "Il y a 2 heures", size: "156 KB" },
			{ name: "error.log", modified: "Il y a 1 heures", size: "892 KB" },
		],
		isLoading: false,
		loadingFileName: '',

		init() {
			if (window.emit) emit('app:opened', { appId: 'cloud' });
		},

		downloadFile(fileName) {
			this.loadingFileName = `Téléchargement de "${fileName}"...`;
			this.isLoading = true;

			// Simulate download that never finishes / causes "system crash"
			// In reality, we trigger the event that fails the task and blocks the system
			setTimeout(() => {
				if (window.emit) {
					emit('cloud:download-attempt', { fileName });
				}
				// We keep isLoading true to show the infinite spinner, 
				// reinforcing the "broken" state until the user closes the window or the system handles it.
			}, 2000);
		}
	}));
});
