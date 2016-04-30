var gulp = require('gulp');
var gulpif = require('gulp-if');
var argv = require('yargs').argv;
var del = require('del');
var sourcemaps = require('gulp-sourcemaps');
var sequence = require('run-sequence');
var eventStream = require('event-stream');
// css
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var cleancss = require('gulp-clean-css');
// js
var concat = require('gulp-concat');
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');
// images
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');
var jpegRecompress = require('imagemin-jpeg-recompress');
var changed = require('gulp-changed');
// svg
var svgmin = require('gulp-svgmin');
// SSH
var rsync = require('gulp-rsync');


// Check for --production flag
var isProduction = !!(argv.production);

// Browsers to target when prefixing CSS.
var COMPATIBILITY = ['> 0.1%', 'last 2 versions', 'ie >= 9'];

// File paths
var PATHS = {
  dist: 'fionatheme',
  assets: [
    'src/**/*', // select all, doesn't select hidden files
    'src/.htaccess',
    '!src/{img,js,scss,svg}/**/*', // handled extra
    '!src/{img,js,scss,svg}' // handled extra
  ],
  stylesSrc: 'src/scss/style.scss',
  stylesDest: 'fionatheme/css',
  javascriptOwnSrc: ['src/js/**/*', '!src/js/vendor/**/*'],
  javascriptVendorSrc: 'src/js/vendor/**/*',
  javascriptDest: 'fionatheme/js',
  imagesSrc: 'src/img/**/*',
  imagesDest: 'fionatheme/img',
  svgSrc: 'src/svg/**/*',
  svgDest: 'fionatheme/svg',
};

// Delete dist and temp (in production) folder
gulp.task('clean', function () {
  var cleanFolders = [];
  if (!isProduction) {
    cleanFolders.push(PATHS.stylesDest); // add css folder
    cleanFolders.push(PATHS.javascriptDest); // add js folder
  }
  if (isProduction) {
    cleanFolders.push(PATHS.dist); // add dist folder if production
  }
  return del(cleanFolders);
});

// Copy files out of the assets folder
// This task skips over img, scss, js and svg folders, which are parsed separately
gulp.task('copy', function() {
  gulp.src(PATHS.assets)
    .pipe(gulp.dest(PATHS.dist));
});

// Combines, prefixes and cleans SCSS files to one CSS
gulp.task('styles', function() {
  return gulp.src(PATHS.stylesSrc)
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(autoprefixer({browsers: COMPATIBILITY}))
    .pipe(cleancss())
    .pipe(gulpif(!isProduction, sourcemaps.write()))
    .pipe(gulp.dest(PATHS.stylesDest));
});

// Combine and minify (in production) JavaScript
gulp.task('scripts', function() {
  var uglifyRun = gulpif(isProduction, uglify()
    .on('error', function (e) {
      console.log(e);
    }));

  var appFiles = gulp.src(PATHS.javascriptOwnSrc)
    .pipe(jshint({}))
    .pipe(jshint.reporter("default"));

  var vendorFiles = gulp.src(PATHS.javascriptVendorSrc);

  return eventStream.concat(vendorFiles, appFiles)
    .pipe(sourcemaps.init())
    .pipe(concat('app.js'))
    .pipe(uglifyRun)
    .pipe(gulpif(!isProduction, sourcemaps.write()))
    .pipe(gulp.dest(PATHS.javascriptDest));
});

// Get new images and minify them
gulp.task('images', function () {
  return gulp.src(PATHS.imagesSrc)
    .pipe(changed(PATHS.imagesDest))
    .pipe(imagemin({
      progressive: true,
      use: [pngquant(), jpegRecompress({loops: 3})]
    }))
    .pipe(gulp.dest(PATHS.imagesDest));
});

// SVG optimization
gulp.task('svg', function () {
  return gulp.src(PATHS.svgSrc)
    .pipe(changed(PATHS.svgDest))
    .pipe(svgmin())
    .pipe(gulp.dest(PATHS.svgDest));
});

gulp.task('upload', ['build'], function () {
  gulp.src('fionatheme/**/*')
    .pipe(rsync({
      hostname: 'hostname',
      username: 'username',
      destination: '/opt/bitnami/apps/wordpress/htdocs/wp-content/themes/',
      incremental: true,
      progress: false,
      silent: false,
    }));
});

// Build the "dist" folder by running all of the above tasks
gulp.task('build', function(done) {
  sequence('clean', ['copy', 'styles', 'scripts', 'images', 'svg'], done);
});

// build and create server
gulp.task('default', ['upload'], function() {
  gulp.watch(['src/**/*'], ['upload']);
});
