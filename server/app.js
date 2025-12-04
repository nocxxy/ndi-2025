var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var indexRouter = require("./routes/index");

var app = express();

// Base path depuis variable d'environnement (par défaut /ndi pour le load balancer)
var BASE_PATH = process.env.BASE_PATH || "/ndi";

// Configuration du moteur de template EJS
app.set("views", path.join(__dirname, "public", "views"));
app.set("view engine", "ejs");

// Middleware pour exposer BASE_PATH aux vues
app.use(function (req, res, next) {
	res.locals.basePath = BASE_PATH;
	next();
});

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Servir les fichiers statiques avec le base path
app.use(
	BASE_PATH + "/stylesheets",
	express.static(path.join(__dirname, "public", "stylesheets")),
);
app.use(
	BASE_PATH + "/images",
	express.static(path.join(__dirname, "public", "images")),
);
app.use(
	BASE_PATH + "/javascripts",
	express.static(path.join(__dirname, "public", "javascripts")),
);

// Servir Alpine.js depuis node_modules avec le base path
app.use(
	BASE_PATH + "/javascripts/alpine.js",
	express.static(
		path.join(__dirname, "node_modules/alpinejs/dist/cdn.min.js"),
	),
);

// Monter les routes avec le base path
app.use(BASE_PATH, indexRouter);

// Redirection de la racine vers le base path si nécessaire
if (BASE_PATH !== "/") {
	app.get("/", function (req, res) {
		res.redirect(BASE_PATH);
	});
}

module.exports = app;
