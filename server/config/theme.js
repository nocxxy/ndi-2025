/**
 * Configuration de la charte graphique
 * Modifiez les valeurs ci-dessous pour changer l'apparence de l'application
 */

module.exports = {
	// Couleurs principales
	colors: {
		primary: "#3b82f6", // Bleu principal
		secondary: "#8b5cf6", // Violet secondaire
		accent: "#10b981", // Vert accent
		neutral: "#6b7280", // Gris neutre
		base: "#ffffff", // Fond de base
		baseContent: "#1f2937", // Texte sur fond de base
		info: "#3b82f6", // Couleur info
		success: "#10b981", // Couleur succès
		warning: "#f59e0b", // Couleur avertissement
		error: "#ef4444", // Couleur erreur
	},

	// Typographie
	typography: {
		fontFamily: {
			sans: [
				"Inter",
				"system-ui",
				"-apple-system",
				"BlinkMacSystemFont",
				'"Segoe UI"',
				"Roboto",
				'"Helvetica Neue"',
				"Arial",
				"sans-serif",
			],
			serif: ["Georgia", "Cambria", '"Times New Roman"', "Times", "serif"],
			mono: [
				"Menlo",
				"Monaco",
				"Consolas",
				'"Liberation Mono"',
				'"Courier New"',
				"monospace",
			],
		},
		fontSize: {
			xs: "0.75rem", // 12px
			sm: "0.875rem", // 14px
			base: "1rem", // 16px
			lg: "1.125rem", // 18px
			xl: "1.25rem", // 20px
			"2xl": "1.5rem", // 24px
			"3xl": "1.875rem", // 30px
			"4xl": "2.25rem", // 36px
			"5xl": "3rem", // 48px
		},
		fontWeight: {
			light: 300,
			normal: 400,
			medium: 500,
			semibold: 600,
			bold: 700,
		},
	},

	// Espacements
	spacing: {
		xs: "0.5rem", // 8px
		sm: "1rem", // 16px
		md: "1.5rem", // 24px
		lg: "2rem", // 32px
		xl: "3rem", // 48px
		"2xl": "4rem", // 64px
	},

	// Bordures
	borderRadius: {
		none: "0",
		sm: "0.25rem", // 4px
		md: "0.5rem", // 8px
		lg: "0.75rem", // 12px
		xl: "1rem", // 16px
		full: "9999px",
	},

	// Ombres
	shadows: {
		sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
		md: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
		lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
		xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
	},

	// Transitions
	transitions: {
		fast: "150ms",
		normal: "300ms",
		slow: "500ms",
	},
};

