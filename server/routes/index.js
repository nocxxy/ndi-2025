/**
 * @fileoverview Express Router - Main routes for NDI application
 * @description Defines all page routes for the NDI web application including:
 *              - Main content pages (accueil, nird, solutions, simulateur, ressources)
 *              - Windows 10 simulation page
 *              - Mini-apps loaded in iframes (snake, typing)
 *
 * @requires express
 *
 * @example
 * // In app.js:
 * const indexRouter = require('./routes/index');
 * app.use('/ndi', indexRouter);
 */

const express = require('express');
const router = express.Router();

// =============================================================================
// MAIN PAGES
// =============================================================================

/**
 * GET / - Home page
 * @route GET /
 * @renders index.ejs
 */
router.get('/', (req, res) => {
	res.render('index', {
		basePath: res.locals.basePath || '/ndi',
		page: 'accueil',
	});
});

/**
 * GET /nird - NIRD presentation page
 * @route GET /nird
 * @renders nird.ejs
 */
router.get('/nird', (req, res) => {
	res.render('nird', {
		basePath: res.locals.basePath || '/ndi',
		page: 'nird',
	});
});

/**
 * GET /solutions - Free software solutions page
 * @route GET /solutions
 * @renders solutions.ejs
 */
router.get('/solutions', (req, res) => {
	res.render('solutions', {
		basePath: res.locals.basePath || '/ndi',
		page: 'solutions',
	});
});

/**
 * GET /simulateur - Cost simulator page
 * @route GET /simulateur
 * @renders simulateur.ejs
 */
router.get('/simulateur', (req, res) => {
	res.render('simulateur', {
		basePath: res.locals.basePath || '/ndi',
		page: 'simulateur',
	});
});

/**
 * GET /ressources - Resources and documentation page
 * @route GET /ressources
 * @renders ressources.ejs
 */
router.get('/ressources', (req, res) => {
	res.render('ressources', {
		basePath: res.locals.basePath || '/ndi',
		page: 'ressources',
	});
});

// =============================================================================
// WINDOWS SIMULATION
// =============================================================================

/**
 * GET /windows - Windows 10 desktop simulation
 * @route GET /windows
 * @renders windows.ejs
 * @description Interactive Windows-like desktop with task/quest system
 */
router.get('/windows', (req, res) => {
	res.render('windows', {
		basePath: res.locals.basePath || '/ndi',
		page: 'windows',
	});
});

// =============================================================================
// MINI-APPS (loaded in iframes within Windows simulation)
// =============================================================================

/**
 * GET /apps/snake - Snake game app
 * @route GET /apps/snake
 * @renders apps/snake.ejs
 * @description Classic snake game, communicates score via postMessage
 */
router.get('/apps/snake', (req, res) => {
	res.render('apps/snake', {
		basePath: res.locals.basePath || '/ndi',
	});
});

/**
 * GET /apps/typing - Typing speed test app
 * @route GET /apps/typing
 * @renders apps/typing.ejs
 * @description WPM typing test, communicates results via postMessage
 */
router.get('/apps/typing', (req, res) => {
	res.render('apps/typing', {
		basePath: res.locals.basePath || '/ndi',
	});
});

/**
 * GET /apps/mail - Mail app (Task manager)
 * @route GET /apps/mail
 * @renders apps/mail.ejs
 * @description Displays tasks as emails
 */
router.get('/apps/mail', (req, res) => {
	res.render('apps/mail', {
		basePath: res.locals.basePath || '/ndi',
	});
});

/**
 * GET /apps/word - Word app (Fails)
 */
router.get('/apps/word', (req, res) => {
	res.render('apps/word', {
		basePath: res.locals.basePath || '/ndi',
	});
});

/**
 * GET /apps/libreoffice - LibreOffice app (Succeeds)
 */
router.get('/apps/libreoffice', (req, res) => {
	res.render('apps/libreoffice', {
		basePath: res.locals.basePath || '/ndi',
	});
});

/**
 * GET /apps/cloud - Cloud app (Simulates download crash)
 */
router.get('/apps/cloud', (req, res) => {
	res.render('apps/cloud', {
		basePath: res.locals.basePath || '/ndi',
	});
});

/**
 * GET /apps/coffee - Coffee app (Fun/Annoying app)
 */
router.get('/apps/coffee', (req, res) => {
	res.render('apps/coffee', {
		basePath: res.locals.basePath || '/ndi',
	});
});

/**
 * GET /apps/chatbot - Copilot app
 */
router.get('/apps/chatbot', (req, res) => {
	res.render('apps/chatbot', {
		basePath: res.locals.basePath || '/ndi',
	});
});

/**
 * GET /apps/server-shield - Server Shield Mini-game
 */
router.get('/apps/server-shield', (req, res) => {
	res.render('apps/server-shield', {
		basePath: res.locals.basePath || '/ndi',
	});
});

module.exports = router;
