var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
	res.render("index", {
		basePath: res.locals.basePath || "/ndi",
		page: "accueil",
	});
});

/* GET page NIRD. */
router.get("/nird", function (req, res, next) {
	res.render("nird", {
		basePath: res.locals.basePath || "/ndi",
		page: "nird",
	});
});

/* GET page Solutions. */
router.get("/solutions", function (req, res, next) {
	res.render("solutions", {
		basePath: res.locals.basePath || "/ndi",
		page: "solutions",
	});
});

/* GET page Simulateur. */
router.get("/simulateur", function (req, res, next) {
	res.render("simulateur", {
		basePath: res.locals.basePath || "/ndi",
		page: "simulateur",
	});
});

/* GET page Ressources. */
router.get("/ressources", function (req, res, next) {
	res.render("ressources", {
		basePath: res.locals.basePath || "/ndi",
		page: "ressources",
	});
});

/* GET page Jeu Snake. */
router.get("/jeu", function (req, res, next) {
	res.render("snake", {
		basePath: res.locals.basePath || "/ndi",
		page: "jeu",
	});
});

/* GET page Windows 10. */
router.get("/windows", function (req, res, next) {
	res.render("windows", {
		basePath: res.locals.basePath || "/ndi",
		page: "windows",
	});
});

module.exports = router;
