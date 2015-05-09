var gulp = require("gulp");

var paths = {
  js: ["./www/js/**/*.js"]
};

gulp.task("default", ["scripts"]);

gulp.task("watch", function() {
    var watch = require("gulp-watch");

    gulp.start("scripts");

    watch(paths.js, function() {
        gulp.start("scripts");
    });
});

gulp.task("jshint", function() {
    var jshint = require("gulp-jshint");

    return gulp.src(paths.js)
        .pipe(jshint())
        .pipe(jshint.reporter())
        .pipe(jshint.reporter("fail"));
});

gulp.task("scripts-runtime", function() {
    var concat = require("gulp-concat");

    return gulp.src([
        "www/js/radiobot/**/*.js",
        "!www/js/radiobot/**/*e2e-spec.js",
        "!www/js/radiobot/**/*_test.js"
    ])
        .pipe(concat("radiobot.js"))
        .pipe(gulp.dest("www/compiled"));
});

gulp.task("scripts-unittest", function() {
    var concat = require("gulp-concat");

    return gulp.src([
        "www/js/spark/**/*_test.js"
    ])
        .pipe(concat("spark_test.js"))
        .pipe(gulp.dest("www/compiled"));
});

gulp.task("scripts", ["jshint", "scripts-runtime", "scripts-unittest"], function(done) {
    done(); // just a convenience task
});
