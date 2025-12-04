var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var indexRouter = require("./routes/index");

var app = express();

// Configuration du moteur de template EJS
app.set("views", path.join(__dirname, "public", "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Servir Alpine.js depuis node_modules
app.use(
	"/javascripts/alpine.js",
	express.static(
		path.join(__dirname, "node_modules/alpinejs/dist/cdn.min.js"),
	),
);

app.use("/", indexRouter);

module.exports = app;
