var express = require("express");
var path = require("path");
var fs = require("fs");
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
	res.locals.staticUrl = function(path) {
		return helpers.staticUrl(path, BASE_PATH);
	};
	res.locals.link = function(path, text, options) {
		return helpers.link(path, text, BASE_PATH, options);
	};
	next();
});

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Middleware de diagnostic pour les fichiers statiques (en production aussi pour debug)
app.use((req, res, next) => {
	if (req.path.startsWith('/javascripts/') || req.path.startsWith('/stylesheets/')) {
		console.log('[STATIC] Request for:', req.path, 'Method:', req.method);
		console.log('[STATIC] __dirname:', __dirname);
		console.log('[STATIC] BASE_PATH:', BASE_PATH);
	}
	next();
});

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

// Routes explicites pour les fichiers critiques (pour éviter les problèmes de routing)
const publicJsDir = path.join(__dirname, "public", "javascripts");
const publicCssDir = path.join(__dirname, "public", "stylesheets");
const alpineJsPath = path.join(__dirname, "node_modules/alpinejs/dist/cdn.min.js");

// Route explicite pour message-bus.js
app.get("/javascripts/message-bus.js", (req, res) => {
	const filePath = path.join(publicJsDir, "message-bus.js");
	if (fs.existsSync(filePath)) {
		res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
		res.sendFile(filePath);
	} else {
		res.status(404).send('File not found');
	}
});

// Route explicite pour windows-manager.js
app.get("/javascripts/windows-manager.js", (req, res) => {
	const filePath = path.join(publicJsDir, "windows-manager.js");
	if (fs.existsSync(filePath)) {
		res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
		res.sendFile(filePath);
	} else {
		res.status(404).send('File not found');
	}
});

// Route explicite pour style.css
app.get("/stylesheets/style.css", (req, res) => {
	const filePath = path.join(publicCssDir, "style.css");
	if (fs.existsSync(filePath)) {
		res.setHeader('Content-Type', 'text/css; charset=utf-8');
		res.sendFile(filePath);
	} else {
		res.status(404).send('File not found');
	}
});

// Route explicite pour alpine.js
app.get("/javascripts/alpine.js", (req, res) => {
	if (fs.existsSync(alpineJsPath)) {
		res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
		res.sendFile(alpineJsPath);
	} else {
		res.status(404).send('File not found');
	}
});

// Routes explicites pour les autres fichiers JS (snake-game, typing-test)
app.get("/javascripts/snake-game.js", (req, res) => {
	const filePath = path.join(publicJsDir, "snake-game.js");
	if (fs.existsSync(filePath)) {
		res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
		res.sendFile(filePath);
	} else {
		res.status(404).send('File not found');
	}
});

app.get("/javascripts/typing-test.js", (req, res) => {
	const filePath = path.join(publicJsDir, "typing-test.js");
	if (fs.existsSync(filePath)) {
		res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
		res.sendFile(filePath);
	} else {
		res.status(404).send('File not found');
	}
});

app.get("/javascripts/mail-app.js", (req, res) => {
	const filePath = path.join(publicJsDir, "mail-app.js");
	if (fs.existsSync(filePath)) {
		res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
		res.sendFile(filePath);
	} else {
		res.status(404).send('File not found');
	}
});

app.get("/javascripts/word-game.js", (req, res) => {
	const filePath = path.join(publicJsDir, "word-game.js");
	if (fs.existsSync(filePath)) {
		res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
		res.sendFile(filePath);
	} else {
		res.status(404).send('File not found');
	}
});

app.get("/javascripts/cloud-app.js", (req, res) => {
	const filePath = path.join(publicJsDir, "cloud-app.js");
	if (fs.existsSync(filePath)) {
		res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
		res.sendFile(filePath);
	} else {
		res.status(404).send('File not found');
	}
});

app.get("/javascripts/coffee-app.js", (req, res) => {
	const filePath = path.join(publicJsDir, "coffee-app.js");
	if (fs.existsSync(filePath)) {
		res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
		res.sendFile(filePath);
	} else {
		res.status(404).send('File not found');
	}
});

app.get("/javascripts/chatbot-app.js", (req, res) => {
	const filePath = path.join(publicJsDir, "chatbot-app.js");
	if (fs.existsSync(filePath)) {
		res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
		res.sendFile(filePath);
	} else {
		res.status(404).send('File not found');
	}
});

app.get("/javascripts/sound-manager.js", (req, res) => {
	const filePath = path.join(publicJsDir, "sound-manager.js");
	if (fs.existsSync(filePath)) {
		res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
		res.sendFile(filePath);
	} else {
		res.status(404).send('File not found');
	}
});

app.get("/javascripts/server-shield.js", (req, res) => {
	const filePath = path.join(publicJsDir, "server-shield.js");
	if (fs.existsSync(filePath)) {
		res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
		res.sendFile(filePath);
	} else {
		res.status(404).send('File not found');
	}
});

app.get("/javascripts/secret-snake.js", (req, res) => {
	const filePath = path.join(publicJsDir, "secret-snake.js");
	if (fs.existsSync(filePath)) {
		res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
		res.sendFile(filePath);
	} else {
		res.status(404).send('File not found');
	}
});

// Servir les fichiers statiques sur / (le load balancer a enlevé le préfixe)
// Ordre important : routes explicites d'abord, puis middleware général

app.get("/javascripts/sport-app.js", (req, res) => {
	const filePath = path.join(publicJsDir, "sport-app.js");
	if (fs.existsSync(filePath)) {
		res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
		res.sendFile(filePath);
	} else {
		res.status(404).send('File not found');
	}
});

app.get("/javascripts/form-game.js", (req, res) => {
	const filePath = path.join(publicJsDir, "form-game.js");
	if (fs.existsSync(filePath)) {
		res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
		res.sendFile(filePath);
	} else {
		res.status(404).send('File not found');
	}
});

// Servir les fichiers statiques sur / (le load balancer a enlevé le préfixe)
// Ordre important : routes explicites d'abord, puis middleware général
app.use("/stylesheets", serveStaticWithMime("/stylesheets", publicCssDir, 'text/css; charset=utf-8'));
app.use("/images", express.static(path.join(__dirname, "public", "images"), { maxAge: '1y' }));
app.use("/javascripts", serveStaticWithMime("/javascripts", publicJsDir, 'application/javascript; charset=utf-8'));
app.use("/dialogs", express.static(path.join(__dirname, "public", "dialogs"), { maxAge: '1y' }));
app.use("/sounds", express.static(path.join(__dirname, "public", "sounds"), { maxAge: '1y' }));

// AUSSI servir les fichiers statiques avec BASE_PATH au cas où le load balancer ne les enlèverait pas
// (fallback pour certains cas de configuration)
if (BASE_PATH && BASE_PATH !== '/') {
	const basePathNormalized = BASE_PATH.endsWith('/') ? BASE_PATH.slice(0, -1) : BASE_PATH;
	
	// Routes explicites avec BASE_PATH
	app.get(basePathNormalized + "/javascripts/message-bus.js", (req, res) => {
		const filePath = path.join(publicJsDir, "message-bus.js");
		if (fs.existsSync(filePath)) {
			res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
			res.sendFile(filePath);
		} else {
			res.status(404).send('File not found');
		}
	});
	
	app.get(basePathNormalized + "/javascripts/windows-manager.js", (req, res) => {
		const filePath = path.join(publicJsDir, "windows-manager.js");
		if (fs.existsSync(filePath)) {
			res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
			res.sendFile(filePath);
		} else {
			res.status(404).send('File not found');
		}
	});
	
	app.get(basePathNormalized + "/stylesheets/style.css", (req, res) => {
		const filePath = path.join(publicCssDir, "style.css");
		if (fs.existsSync(filePath)) {
			res.setHeader('Content-Type', 'text/css; charset=utf-8');
			res.sendFile(filePath);
		} else {
			res.status(404).send('File not found');
		}
	});
	
	app.get(basePathNormalized + "/javascripts/alpine.js", (req, res) => {
		if (fs.existsSync(alpineJsPath)) {
			res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
			res.sendFile(alpineJsPath);
		} else {
			res.status(404).send('File not found');
		}
	});
	
	app.get(basePathNormalized + "/javascripts/snake-game.js", (req, res) => {
		const filePath = path.join(publicJsDir, "snake-game.js");
		if (fs.existsSync(filePath)) {
			res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
			res.sendFile(filePath);
		} else {
			res.status(404).send('File not found');
		}
	});
	
	app.get(basePathNormalized + "/javascripts/typing-test.js", (req, res) => {
		const filePath = path.join(publicJsDir, "typing-test.js");
		if (fs.existsSync(filePath)) {
			res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
			res.sendFile(filePath);
		} else {
			res.status(404).send('File not found');
		}
	});
	
	app.get(basePathNormalized + "/javascripts/mail-app.js", (req, res) => {
		const filePath = path.join(publicJsDir, "mail-app.js");
		if (fs.existsSync(filePath)) {
			res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
			res.sendFile(filePath);
		} else {
			res.status(404).send('File not found');
		}
	});
	
	app.get(basePathNormalized + "/javascripts/word-game.js", (req, res) => {
		const filePath = path.join(publicJsDir, "word-game.js");
		if (fs.existsSync(filePath)) {
			res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
			res.sendFile(filePath);
		} else {
			res.status(404).send('File not found');
		}
	});
	
	app.get(basePathNormalized + "/javascripts/cloud-app.js", (req, res) => {
		const filePath = path.join(publicJsDir, "cloud-app.js");
		if (fs.existsSync(filePath)) {
			res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
			res.sendFile(filePath);
		} else {
			res.status(404).send('File not found');
		}
	});
	
	app.get(basePathNormalized + "/javascripts/coffee-app.js", (req, res) => {
		const filePath = path.join(publicJsDir, "coffee-app.js");
		if (fs.existsSync(filePath)) {
			res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
			res.sendFile(filePath);
		} else {
			res.status(404).send('File not found');
		}
	});
	
	app.get(basePathNormalized + "/javascripts/chatbot-app.js", (req, res) => {
		const filePath = path.join(publicJsDir, "chatbot-app.js");
		if (fs.existsSync(filePath)) {
			res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
			res.sendFile(filePath);
		} else {
			res.status(404).send('File not found');
		}
	});
	
	app.get(basePathNormalized + "/javascripts/sound-manager.js", (req, res) => {
		const filePath = path.join(publicJsDir, "sound-manager.js");
		if (fs.existsSync(filePath)) {
			res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
			res.sendFile(filePath);
		} else {
			res.status(404).send('File not found');
		}
	});
	
	app.get(basePathNormalized + "/javascripts/server-shield.js", (req, res) => {
		const filePath = path.join(publicJsDir, "server-shield.js");
		if (fs.existsSync(filePath)) {
			res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
			res.sendFile(filePath);
		} else {
			res.status(404).send('File not found');
		}
	});
	
	app.get(basePathNormalized + "/javascripts/secret-snake.js", (req, res) => {
		const filePath = path.join(publicJsDir, "secret-snake.js");
		if (fs.existsSync(filePath)) {
			res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
			res.sendFile(filePath);
		} else {
			res.status(404).send('File not found');
		}
	});
	
	// Middleware général avec BASE_PATH
	app.use(basePathNormalized + "/stylesheets", serveStaticWithMime(basePathNormalized + "/stylesheets", publicCssDir, 'text/css; charset=utf-8'));
	app.use(basePathNormalized + "/images", express.static(path.join(__dirname, "public", "images"), { maxAge: '1y' }));
	app.use(basePathNormalized + "/javascripts", serveStaticWithMime(basePathNormalized + "/javascripts", publicJsDir, 'application/javascript; charset=utf-8'));
	app.use(basePathNormalized + "/dialogs", express.static(path.join(__dirname, "public", "dialogs"), { maxAge: '1y' }));
	app.use(basePathNormalized + "/sounds", express.static(path.join(__dirname, "public", "sounds"), { maxAge: '1y' }));
}

// Monter les routes sur / (le load balancer a déjà enlevé le préfixe)
app.use("/", indexRouter);

module.exports = app;
