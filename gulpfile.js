/* Libs */

const {src, dest} = require('gulp');
const gulp = require('gulp');
const fileinclude = require('gulp-file-include');
const del = require('del');
const scss = require('gulp-sass')(require('sass'));
const autoprefixer = require('gulp-autoprefixer');
const groupmedia = require('gulp-group-css-media-queries');
const cleancss = require('gulp-clean-css');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify-es').default;
const ttf2woff = require('gulp-ttf2woff');
const ttf2woff2 = require('gulp-ttf2woff2');
const browserSync = require('browser-sync').create();

/* Paths */

const source = 'src/';
const output = 'dist/';

const path = {
  build: {
      html:   output,
      js:     output + "js/",
      css:    output + "css/",
      images: output + "img/",
      fonts:  output + "fonts/"
  },
  src: {
      html:   source + "*.html",
      js:     source + "js/app.js",
      css:    source + "scss/style.scss",
      images: source + "img/**/*.{jpg,png,svg,gif,ico,webp,webmanifest,xml,json}",
      fonts:  source + "fonts/**/*.{eot,woff,woff2,ttf,svg}"
  },
  watch: {
      html:   source + "**/*.html",
      js:     source + "js/**/*.js",
      css:    source + "scss/**/*.scss",
      images: source + "img/**/*.{jpg,png,svg,gif,ico,webp,webmanifest,xml,json}",
      fonts:  source + "fonts/**/*.{eot,woff,woff2,ttf,svg}"
  },
  clean: "./" + output
}

/* Tasks */

function bsync() {
  browserSync.init({
    server: {
      baseDir: './' + output
    },
    notify: false
  });
}

function html() {
  return src(path.src.html, {base: source})
    .pipe(fileinclude())
    .pipe(dest(path.build.html))
    .pipe(browserSync.reload({stream: true}));
}

function css() {
  return src(path.src.css, {base: source + "scss/"})
    .pipe(
      scss({ outputStyle: 'expanded' })
      .on('error', scss.logError)
    )
    .pipe(groupmedia())
    .pipe(autoprefixer({
      overrideBrowserslist: ["last 5 versions"],
      cascade: true
    }))
    .pipe(dest(path.build.css))
    .pipe(cleancss())
    .pipe(rename({
      suffix: ".min",
      extname: ".css"
    }))
    .pipe(dest(path.build.css))
    .pipe(browserSync.reload({stream: true}));
}

function js() {
  return src(path.src.js, {base: source + "js/"})
    .pipe(fileinclude())
    .pipe(dest(path.build.js))
    .pipe(uglify())
    .pipe(rename({
      suffix: ".min",
      extname: ".js"
    }))
    .pipe(dest(path.build.js))
    .pipe(browserSync.reload({stream: true}));
}

function images() {
  return src(path.src.images, {base: source + 'img/'})
    .pipe(dest(path.build.images))
    .pipe(browserSync.reload({stream: true}));
}

function fonts() {
  src(path.src.fonts, {base: source + 'fonts/'})
    .pipe(ttf2woff())
    .pipe(dest(path.build.fonts));
  return src(path.src.fonts, {base: source + 'fonts/'})
    .pipe(ttf2woff2())
    .pipe(dest(path.build.fonts))
}

function watcher() {
  gulp.watch([path.watch.html], html)
  gulp.watch([path.watch.css], css)
  gulp.watch([path.watch.js], js)
  gulp.watch([path.watch.images], images)
}

function cleaner() {
  return del(path.clean)
}

const build = gulp.series(cleaner, gulp.parallel(html, css, js, images, fonts));
const watch = gulp.parallel(build, watcher, bsync);

/* Exports */

exports.html = html;
exports.css = css;
exports.js = js;
exports.images = images;
exports.fonts = fonts;
exports.build = build;
exports.watch = watch;
exports.default = watch;