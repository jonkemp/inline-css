'use strict';
var gulp = require('gulp'),
    eslint = require('gulp-eslint'),
    mocha = require('gulp-mocha');

var paths = {
    scripts: ['./*.js', '!./gulpfile.js']
};

gulp.task('lint', function() {
    return gulp.src(paths.scripts)
        .pipe(eslint())
        .pipe(eslint.format());
});

gulp.task('test', function() {
    return gulp.src('./test/*.js')
        .pipe(mocha());
});

gulp.task('watch', function () {
    gulp.watch(paths.scripts, ['lint', 'test']);
});

gulp.task('default', ['lint', 'test', 'watch']);
