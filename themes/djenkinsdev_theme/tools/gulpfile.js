var gulp = require('gulp'),
    minifyCSS = require('gulp-minify-css'),
    less = require('gulp-less'),
    uglify = require('gulp-uglifyjs');

/**
 * Constants For Our Paths
 */
LESS_FILES = "../static/less/**/*.less";
MAIN_LESS_FILE = "../static/less/main.less";
CSS_PATH = "../static/css/";

UNMINIFIED_JS_FILES = ["../static/js/**/*.js", "!../static/js/minified/script.js"];
MINIFIED_JS_FILE = "script.js";
MINIFIED_JS_PATH = "../static/js/minified/";



/***************************************************
 *                  TASKS
 **************************************************/

gulp.task('css', function() {
  gulp.src(MAIN_LESS_FILE)
      .pipe(less())
      .pipe(minifyCSS())
      .pipe(gulp.dest(CSS_PATH));
});

gulp.task('js', function() {
  gulp.src(UNMINIFIED_JS_FILES)
      .pipe(uglify(MINIFIED_JS_FILE))
      .pipe(gulp.dest(MINIFIED_JS_PATH))

});

gulp.task('watch', function() {
  gulp.watch(LESS_FILES, ['css']);
  gulp.watch(UNMINIFIED_JS_FILES, ['js']);
});

gulp.task('default', ['watch']);
