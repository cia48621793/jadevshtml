var ts = require('typescript');
var jade = require('jade');
var gulp = require('gulp');
var del = require('del');

var useref = require('gulp-useref');
var gulpif = require('gulp-if');
var riot = require('gulp-riot');
var uglify = require('gulp-uglify');
var htmlmin = require('gulp-minify-html');
var debug = require('gulp-debug');
var purify = require('gulp-purifycss');
var preprocess = require('gulp-preprocess');

function extend (obj, props) {
    if (props) {
        for (var prop in props) {
            /* istanbul ignore next */
            if (props.hasOwnProperty(prop)) {
                obj[prop] = props[prop]
            }
        }
    }
    return obj
}

gulp.task('clean-riot-jade', function() {
    return del([
        'tags/*.js',
    ]);
})

gulp.task('riot-jade', ['clean-riot-jade'], function () {
    return gulp.src('./tags/*.jade')
            .pipe(debug({title: 'Processing:'}))
            .pipe(riot({
                compact: true,
                template: "jade",
                type: "javascript",
                parsers: {
                    html: {
                        jade: function (html, opts, url) {
                            opts = extend({
                                pretty: false,
                                filename: url,
                                doctype: 'html'
                            }, opts);

                            return jade.render(html, opts)
                        },
                    },
                    js: {
                        javascript: ts.transpile
                    }
                }
            }))
        .pipe(gulp.dest('tags/'));
});

gulp.task('clean-dist', function() {
    return del([
        'dist/',
    ]);
})

gulp.task('dist', ['clean-dist', 'riot-jade'], function() {
    return gulp.src('index.html')
            .pipe(useref())
            .pipe(gulpif('*.js', uglify()))
            .pipe(gulpif('*.html', preprocess()))
            .pipe(gulpif('*.html', htmlmin()))
        .pipe(gulp.dest('dist/'));
});

gulp.task('default', ['dist'], function() {
    return gulp.src('dist/dist.css')
        .pipe(purify(['dist/*.js', 'dist/*.html'], {
            minify: true,
            rejected: true,
        }))
    .pipe(gulp.dest('dist/'))
});

gulp.task('watch', function() {
    var watcher = gulp.watch(['index.html', './tags/*.jade'], ['riot-jade']);
    watcher.on('change', function (event) {
        console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
    });
})