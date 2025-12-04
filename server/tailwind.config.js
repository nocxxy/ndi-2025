/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		"./public/**/*.{html,js,ejs}",
		"./routes/**/*.js",
		"./views/**/*.ejs",
	],
	theme: {
		extend: {},
	},
	plugins: [require("daisyui")],
	daisyui: {
		themes: ["light", "dark", "cupcake"],
	},
};
