/**
 * Helpers EJS pour construire les URLs et liens
 */

/**
 * Construit une URL avec le basePath
 * @param {string} path - Le chemin (ex: '/windows', '/solutions')
 * @param {string} basePath - Le basePath (ex: '/ndi' ou '/')
 * @returns {string} L'URL complète
 */
function url(path, basePath) {
	// Normaliser le path pour qu'il commence toujours par /
	const normalizedPath = path.startsWith('/') ? path : '/' + path;
	
	// Si basePath est '/' ou vide, retourner juste le path
	if (!basePath || basePath === '/') {
		return normalizedPath;
	}
	
	// Normaliser basePath pour qu'il se termine par /
	const normalizedBasePath = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;
	
	// Combiner basePath et path
	return normalizedBasePath + normalizedPath;
}

/**
 * Construit une URL pour un fichier statique
 * @param {string} path - Le chemin du fichier statique (ex: '/stylesheets/style.css')
 * @param {string} basePath - Le basePath (ex: '/ndi' ou '/')
 * @returns {string} L'URL du fichier statique avec basePath
 */
function staticUrl(path, basePath) {
	const normalizedPath = path.startsWith('/') ? path : '/' + path;

	if (!basePath || basePath === '/') {
		return normalizedPath;
	}

	const normalizedBasePath = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;
	return normalizedBasePath + normalizedPath;
}

/**
 * Construit un lien HTML avec le basePath
 * @param {string} path - Le chemin (ex: '/windows', '/solutions')
 * @param {string} text - Le texte du lien
 * @param {string} basePath - Le basePath
 * @param {object} options - Options supplémentaires (classes, etc.)
 * @returns {string} Le HTML du lien
 */
function link(path, text, basePath, options = {}) {
	const href = url(path, basePath);
	const classes = options.class || options.className || '';
	const attrs = options.attrs || '';
	
	return `<a href="${href}" class="${classes}" ${attrs}>${text}</a>`;
}

module.exports = {
	url,
	staticUrl,
	link
};

