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
app.use(
	"/stylesheets",
	express.static(path.join(__dirname, "public", "stylesheets")),
);
app.use(
	"/images",
	express.static(path.join(__dirname, "public", "images")),
);
app.use(
	"/javascripts",
	express.static(path.join(__dirname, "public", "javascripts")),
);

// Servir Alpine.js depuis node_modules
app.use(
	"/javascripts/alpine.js",
	express.static(
		path.join(__dirname, "node_modules/alpinejs/dist/cdn.min.js"),
	),
);

// Servir les fichiers JavaScript personnalisés
app.use(
	"/javascripts",
	express.static(path.join(__dirname, "public", "javascripts")),
);

// Monter les routes sur / (le load balancer a déjà enlevé le préfixe)
app.use("/", indexRouter);

module.exports = app;
