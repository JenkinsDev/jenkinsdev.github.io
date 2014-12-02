var gulp = require('gulp'),
    minifyCSS = require('gulp-minify-css'),
    less = require('gulp-less'),
    watch = require('gulp-watch');

LESS_FILES = "../static/less/**/*.less"
MAIN_LESS_FILE = "../static/less/main.less"

gulp.task('css', function() {
  source = gulp.src(MAIN_LESS_FILE);
  source.pipe(watch(LESS_FILES, function(files) {
      return source.pipe(less())
                   .pipe(minifyCSS())
                   .pipe(gulp.dest('../static/css/'))
  }));
});
