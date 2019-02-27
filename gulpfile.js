var syntax        = 'sass', // Syntax: sass or scss;
	gulpversion   = '4'; // Gulp version: 3 or 4

var gulp          = require('gulp'),
		babel 				= require("gulp-babel"),
		pug 					= require('gulp-pug'),
		gutil         = require('gulp-util' ),
		sass          = require('gulp-sass'),
		browserSync   = require('browser-sync'),
		concat        = require('gulp-concat'),
		uglify        = require('gulp-uglify'),
		cleancss      = require('gulp-clean-css'),
		rename        = require('gulp-rename'),
		autoprefixer  = require('gulp-autoprefixer'),
		notify        = require('gulp-notify'),
		rsync         = require('gulp-rsync'),
		sourcemaps    = require('gulp-sourcemaps');

gulp.task('browser-sync', function() {
	browserSync({
		server: {
			baseDir: 'app/build'
		},
		notify: false,
		// open: false,
		// online: false, // Work Offline Without Internet Connection
		// tunnel: true, tunnel: "projectname", // Demonstration page: http://projectname.localtunnel.me
	})
});

gulp.task('pug', function() {
  return gulp.src("app/dev/**/*.pug")
		.pipe(pug({
			pretty: true
		}))
		.pipe(gulp.dest("./app/build"))
		.pipe(browserSync.stream());
});

gulp.task('styles', function() {
	return gulp.src('app/dev/assets/'+syntax+'/**/*.'+syntax+'')
	.pipe(sourcemaps.init())
	.pipe(sass({ outputStyle: 'expanded' }).on("error", notify.onError()))
	.pipe(rename({ suffix: '.min', prefix : '' }))
	.pipe(autoprefixer(['last 15 versions']))
	.pipe(cleancss( {level: { 1: { specialComments: 0 } } })) // Opt., comment out when debugging
	.pipe(sourcemaps.write('.'))
	.pipe(gulp.dest('app/build/assets/css'))
	.pipe(browserSync.stream())
});

gulp.task('scripts', function() {
	return gulp.src([
		'app/dev/assets/libs/jquery/dist/jquery.min.js',
		'app/dev/assets/js/common.js', // Always at the end
		])
	.pipe(babel({ presets: ['@babel/env'] }))
	.pipe(concat('scripts.min.js'))
	// .pipe(uglify()) // Mifify js (opt.)
	.pipe(gulp.dest('app/build/assets/js'))
	.pipe(browserSync.reload({ stream: true }))
});

gulp.task('code', function() {
	// return gulp.src('app/*.html')
	return gulp.src('app/dev/**/*.pug')
	.pipe(browserSync.reload({ stream: true }))
});

gulp.task('rsync', function() {
	return gulp.src('app/**')
	.pipe(rsync({
		root: 'app/',
		hostname: 'username@yousite.com',
		destination: 'yousite/public_html/',
		// include: ['*.htaccess'], // Includes files to deploy
		exclude: ['**/Thumbs.db', '**/*.DS_Store'], // Excludes files from deploy
		recursive: true,
		archive: true,
		silent: false,
		compress: true
	}))
});

if (gulpversion == 3) {
	gulp.task('watch', ['pug', 'styles', 'scripts', 'browser-sync'], function() {
		gulp.watch('app/dev/assets/'+syntax+'/**/*.'+syntax+'', ['styles']);
		gulp.watch(['app/dev/assets/libs/**/*.js', 'app/dev/assets/js/common.js'], ['scripts']);
		// gulp.watch('app/*.html', ['code'])
		gulp.watch('app/dev/**/*.pug', ['pug'])
	});
	gulp.task('default', ['watch']);
}

if (gulpversion == 4) {
	gulp.task('watch', function() {
		gulp.watch('app/dev/assets/'+syntax+'/**/*.'+syntax+'', gulp.parallel('styles'));
		gulp.watch(['app/dev/assets/libs/**/*.js', 'app/dev/assets/js/common.js'], gulp.parallel('scripts'));
		// gulp.watch('app/*.html', gulp.parallel('code'))
		gulp.watch('app/dev/**/*.pug', gulp.parallel('pug'))
	});
	gulp.task('default', gulp.parallel('pug', 'styles', 'scripts', 'browser-sync', 'watch'));
}
