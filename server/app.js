var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var indexRouter = require("./routes/index");
var helpers = require("./utils/helpers");

var app = express();

// Base path depuis variable d'environnement (par défaut /ndi pour le load balancer)
var BASE_PATH = process.env.BASE_PATH || "/ndi";

// Configuration du moteur de template EJS
app.set("views", path.join(__dirname, "public", "views"));
app.set("view engine", "ejs");

// Middleware pour exposer BASE_PATH et helpers aux vues
app.use(function (req, res, next) {
	res.locals.basePath = BASE_PATH;
	// Exposer les helpers dans res.locals pour qu'ils soient accessibles dans les templates
	res.locals.url = function(path) {
		return helpers.url(path, BASE_PATH);
	};
	res.locals.staticUrl = helpers.staticUrl;
	res.locals.link = function(path, text, options) {
		return helpers.link(path, text, BASE_PATH, options);
	};
	next();
});

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Le load balancer enlève le préfixe /ndi/ avant d'envoyer les requêtes
// Donc on écoute sur / mais on utilise BASE_PATH pour générer les URLs dans les templates
// Servir les fichiers statiques avec les bons MIME types (AVANT les routes)
// IMPORTANT: Les fichiers statiques doivent être servis AVANT les routes pour éviter les conflits

// Fonction helper pour servir les fichiers statiques avec les bons MIME types
function serveStaticWithMime(route, dir, mimeType) {
	return express.static(dir, {
		setHeaders: (res, filePath) => {
			// Toujours définir le Content-Type explicitement
			if (mimeType) {
				res.setHeader('Content-Type', mimeType);
			} else if (filePath.endsWith('.css')) {
				res.setHeader('Content-Type', 'text/css; charset=utf-8');
			} else if (filePath.endsWith('.js')) {
				res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
			}
			// Headers de cache
			res.setHeader('Cache-Control', 'public, max-age=31536000');
		},
		maxAge: '1y',
		etag: true,
		lastModified: true
	});
}

// Servir les fichiers statiques sur / (le load balancer a enlevé le préfixe)
// Ordre important : Alpine.js d'abord (route spécifique), puis le dossier général
app.use(
	"/javascripts/alpine.js",
	serveStaticWithMime(
		"/javascripts/alpine.js",
		path.join(__dirname, "node_modules/alpinejs/dist/cdn.min.js"),
		'application/javascript; charset=utf-8'
	)
);

app.use("/stylesheets", serveStaticWithMime("/stylesheets", path.join(__dirname, "public", "stylesheets"), 'text/css; charset=utf-8'));
app.use("/images", express.static(path.join(__dirname, "public", "images"), { maxAge: '1y' }));
app.use("/javascripts", serveStaticWithMime("/javascripts", path.join(__dirname, "public", "javascripts"), 'application/javascript; charset=utf-8'));

// AUSSI servir les fichiers statiques avec BASE_PATH au cas où le load balancer ne les enlèverait pas
// (fallback pour certains cas de configuration)
if (BASE_PATH && BASE_PATH !== '/') {
	const basePathNormalized = BASE_PATH.endsWith('/') ? BASE_PATH.slice(0, -1) : BASE_PATH;
	app.use(basePathNormalized + "/stylesheets", serveStaticWithMime(basePathNormalized + "/stylesheets", path.join(__dirname, "public", "stylesheets"), 'text/css; charset=utf-8'));
	app.use(basePathNormalized + "/images", express.static(path.join(__dirname, "public", "images"), { maxAge: '1y' }));
	app.use(basePathNormalized + "/javascripts", serveStaticWithMime(basePathNormalized + "/javascripts", path.join(__dirname, "public", "javascripts"), 'application/javascript; charset=utf-8'));
	app.use(
		basePathNormalized + "/javascripts/alpine.js",
		serveStaticWithMime(
			basePathNormalized + "/javascripts/alpine.js",
			path.join(__dirname, "node_modules/alpinejs/dist/cdn.min.js"),
			'application/javascript; charset=utf-8'
		)
	);
}

// Monter les routes sur / (le load balancer a déjà enlevé le préfixe)
app.use("/", indexRouter);

module.exports = app;
