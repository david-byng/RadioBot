var gulp = require('gulp');
var path = require('path');
var child_process = require("child_process");
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var exec = require("child_process").exec;

var paths = {
  js: ['./www/js/**/*.js']
};

gulp.task('default', ['sass']);

gulp.task("watch", function() {
    var watch = require("gulp-watch");

    watch(paths.js, function() {
        gulp.start("scripts");
    });
});

gulp.task("jshint", function() {
    var jshint = require("gulp-jshint");
    var cache = require("gulp-cached");

    return gulp.src(paths.js)
        .pipe(cache("linting"))
        .pipe(jshint())
        .pipe(jshint.reporter())
        .pipe(jshint.reporter("fail"));
});

gulp.task("scripts-runtime", function() {
    var concat = require("gulp-concat");

    return gulp.src([
        "www/js/spark/**/*.js",
        "!www/js/spark/**/*e2e-spec.js",
        "!www/js/spark/**/*_test.js"
    ])
        .pipe(concat('spark.js'))
        .pipe(gulp.dest("www/compiled"));
});

gulp.task("scripts-unittest", function() {
    var concat = require("gulp-concat");

    return gulp.src([
        "www/js/spark/**/*_test.js"
    ])
        .pipe(concat('spark_test.js'))
        .pipe(gulp.dest("www/compiled"));
});

gulp.task("scripts", ["jshint", "scripts-runtime", "scripts-unittest"], function(done) {
    done(); // just a convenience task
});
