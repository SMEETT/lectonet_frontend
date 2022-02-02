const gulp = require("gulp");
const concat = require("gulp-concat");
const sourcemaps = require("gulp-sourcemaps");
const terser = require("gulp-terser");
const { src, series, parallel, dest, watch } = require("gulp");
const postcss = require("gulp-postcss");
const cssnano = require("cssnano");
const autoprefixer = require("autoprefixer");

const jsPath = "./static/**/*.js";
const cssPath = "./static/css/**/*.css";

function jsTasks() {
	return src(jsPath).pipe(sourcemaps.init()).pipe(concat("bundled.js")).pipe(terser()).pipe(sourcemaps.write(".")).pipe(dest("./static/dist/js"));
}

function cssTasks() {
	return src(cssPath)
		.pipe(sourcemaps.init())
		.pipe(concat("bundled.css"))
		.pipe(postcss([autoprefixer(), cssnano()]))
		.pipe(sourcemaps.write("."))
		.pipe(dest("./static/dist/css"));
}

exports.cssTasks = cssTasks;
exports.jsTasks = jsTasks;
