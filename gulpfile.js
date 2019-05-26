"use strict";

var gulp = require("gulp");
var plumber = require("gulp-plumber");
var sourcemap = require("gulp-sourcemaps");
// var sass = require("gulp-sass");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var server = require("browser-sync").create();
var csso = require("gulp-csso");
var del = require("del");
var imagemin = require("gulp-imagemin");
var webp = require("gulp-webp");
var rename = require("gulp-rename");
var svgstore = require("gulp-svgstore");
// var posthtml = require("gulp-posthtml");
var htmlmin = require('gulp-htmlmin');
// var include = require("posthtml-include");
var uglify = require('gulp-uglify');



//удаляем папку билд
gulp.task("clean", function() {
  return del("build");
});

//создаем папку билд
gulp.task("copy", function() {
  return gulp.src([
    // "source/fonts**/*.{woff,woff2}",
    "source/css/normalize.css",
    "source/img/**",
    //"source/js/**",
    "source/*.ico"
    //"source/*.html"
  ], {
    base: "source"
  })
  .pipe(gulp.dest("build"));
});

//оптимизируем изображения
gulp.task("images", function () {
  return gulp.src("source/img/**/*.{png,jpg,svg}")
  .pipe(imagemin([
    imagemin.optipng({optimizationLevel: 3}),
    imagemin.jpegtran({progressive: true}),
    imagemin.svgo({ plugins: [
      {removeViewBox: false}
    ]})
  ]))
  .pipe(gulp.dest("source/img"));
});

//конвертируем изображения в webp
gulp.task("webp", function () {
  return gulp.src("source/img/**/*.{png,jpg}")
  .pipe(webp({quality: 90}))
  .pipe(gulp.dest("source/img"));
});

// //создаем спрайт
// gulp.task("sprite", function () {
//   return gulp.src("source/img/icon-*.svg")
//   .pipe(svgstore({
//     inlineSvg: true
//   }))
//   .pipe(rename("sprite.svg"))
//   .pipe(gulp.dest("build/img"));
// });

//инлайним свг в хтмл и минифицируем
gulp.task("html", function () {
  return gulp.src("source/*.html")
  // .pipe(posthtml([
  //   include()
  // ]))
  .pipe(htmlmin({ collapseWhitespace: true }))
  .pipe(gulp.dest("build"));
});

//обновляем js в билд
gulp.task("js", function () {
  return gulp.src("source/js/**/*.js")
  .pipe(uglify())
  .pipe(gulp.dest("build/js"));
});

gulp.task("css", function () {
  return gulp.src("source/css/style.css")
    .pipe(plumber())
    .pipe(sourcemap.init())
    // .pipe(sass())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(gulp.dest("build/css"))
    .pipe(csso())
    .pipe(rename("style.min.css"))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("build/css"))
    .pipe(server.stream());
});

gulp.task("server", function () {
  server.init({
    server: "build/",
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch("source/css/**/*.css", gulp.series("css"));
  //gulp.watch("source/img/icon-*.svg", gulp.series("sprite", "html", "refresh"));
  gulp.watch("source/*.html", gulp.series("html", "refresh"));
  gulp.watch("source/js/**/*.js", gulp.series("js", "refresh"));
});

//перезапуск сервера
gulp.task("refresh", function (done) {
  server.reload();
  done();
});

gulp.task("build", gulp.series(
  "clean",
  "copy",
  "css",
  // "sprite",
  "html",
  "js"
));

gulp.task("start", gulp.series("build", "server"));
