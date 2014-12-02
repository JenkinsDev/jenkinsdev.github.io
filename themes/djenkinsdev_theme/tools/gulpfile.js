var gulp = require('gulp'),
    minifyCSS = require('gulp-minify-css'),
    less = require('gulp-less');

/**
 * Constants For Our Paths
 */
LESS_FILES = "../static/less/**/*.less"
MAIN_LESS_FILE = "../static/less/main.less"
CSS_PATH = "../static/css/"



/***************************************************
 *                  TASKS
 **************************************************/

gulp.task('css', function() {
  gulp.src(MAIN_LESS_FILE)
      .pipe(less())
      .pipe(minifyCSS())
      .pipe(gulp.dest(CSS_PATH))
});

gulp.task('watch', function() {
  gulp.watch(LESS_FILES, ['css']);
});

gulp.task('default', ['watch']);
