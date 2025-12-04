const themeConfig = require("./config/theme");

/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		"./public/**/*.{html,js,ejs}",
		"./routes/**/*.js",
		"./views/**/*.ejs",
	],
	theme: {
		extend: {
			colors: {
				primary: themeConfig.colors.primary,
				secondary: themeConfig.colors.secondary,
				accent: themeConfig.colors.accent,
			},
			fontFamily: themeConfig.typography.fontFamily,
			fontSize: themeConfig.typography.fontSize,
			fontWeight: themeConfig.typography.fontWeight,
			spacing: themeConfig.spacing,
			borderRadius: themeConfig.borderRadius,
			boxShadow: themeConfig.shadows,
			transitionDuration: themeConfig.transitions,
		},
	},
	plugins: [require("daisyui")],
	daisyui: {
		themes: [
			{
				ndi: {
					primary: themeConfig.colors.primary,
					secondary: themeConfig.colors.secondary,
					accent: themeConfig.colors.accent,
					neutral: themeConfig.colors.neutral,
					"base-100": themeConfig.colors.base,
					"base-content": themeConfig.colors.baseContent,
					info: themeConfig.colors.info,
					success: themeConfig.colors.success,
					warning: themeConfig.colors.warning,
					error: themeConfig.colors.error,
					"--rounded-box": themeConfig.borderRadius.lg,
					"--rounded-btn": themeConfig.borderRadius.md,
					"--rounded-badge": themeConfig.borderRadius.full,
					"--animation-btn": "0.25s",
					"--animation-input": "0.2s",
					"--btn-focus-scale": "0.95",
					"--border-btn": "1px",
					"--tab-border": "1px",
					"--tab-radius": themeConfig.borderRadius.md,
				},
			},
			"light",
			"dark",
		],
	},
};
