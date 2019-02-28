var syntax        = 'sass'; // Syntax: sass or scss;

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
		del          = require('del'),
		imagemin     = require('gulp-imagemin'),
		pngquant     = require('imagemin-pngquant'),
		cache        = require('gulp-cache'),
		sourcemaps    = require('gulp-sourcemaps');

gulp.task('browser-sync', function() {
	browserSync({
		server: {
			baseDir: 'app'
		},
		notify: false,
		// open: false,
		// online: false, // Work Offline Without Internet Connection
		// tunnel: true, tunnel: "projectname", // Demonstration page: http://projectname.localtunnel.me
	})
});

gulp.task('pug', function() {
  return gulp.src("app/*.pug")
		.pipe(pug({
			pretty: true
		}))
		.pipe(gulp.dest("./app"))
		.pipe(browserSync.stream());
});

gulp.task('styles', function() {
	return gulp.src('app/assets/'+syntax+'/**/*.'+syntax+'')
	.pipe(sourcemaps.init())
	.pipe(sass({ outputStyle: 'expanded' }).on("error", notify.onError()))
	.pipe(rename({ suffix: '.min', prefix : '' }))
	.pipe(autoprefixer(['last 15 versions']))
	.pipe(cleancss( {level: { 1: { specialComments: 0 } } })) // Opt., comment out when debugging
	.pipe(sourcemaps.write('.'))
	.pipe(gulp.dest('app/assets/css'))
	.pipe(browserSync.stream())
});

gulp.task('babel', function(){
	return gulp.src('app/assets/js/common.js')
	.pipe(babel({ presets: ['@babel/env'] }))
	.pipe(concat('app/assets/js/common_dist.js'))
	.pipe(gulp.dest('./'))
});

gulp.task('scripts', gulp.series('babel', function() {
	return gulp.src([
		'app/assets/libs/jquery/dist/jquery.min.js',
		'app/assets/js/common_dist.js', // Always at the end
		])
	.pipe(concat('scripts.min.js'))
	// .pipe(uglify()) // Mifify js (opt.)
	.pipe(gulp.dest('app/assets/js'))
	.pipe(browserSync.reload({ stream: true }))
}));

gulp.task('code', function() {
	// return gulp.src('app/*.html')
	return gulp.src('app/**/*.pug')
	.pipe(browserSync.reload({ stream: true }))
});

gulp.task('clean', async function() {
	return del.sync('dist'); // Удаляем папку dist перед сборкой
});

gulp.task('img', function() {
	return gulp.src('app/assets/img/**/*') // Берем все изображения из app
		.pipe(cache(imagemin({ // С кешированием
		// .pipe(imagemin({ // Сжимаем изображения без кеширования
			interlaced: true,
			progressive: true,
			svgoPlugins: [{removeViewBox: false}],
			use: [pngquant()]
		}))/**/)
		.pipe(gulp.dest('dist/assets/img')); // Выгружаем на продакшен
});

gulp.task('prebuild', async function() {

	var buildCss = gulp.src([ // Переносим библиотеки в продакшен
		'app/assets/css/main.min.css'
		])
	.pipe(gulp.dest('dist/assets/css'))

	var buildFonts = gulp.src('app/assets/fonts/**/*') // Переносим шрифты в продакшен
	.pipe(gulp.dest('dist/assets/fonts'))

	var buildJs = gulp.src('app/assets/js/**/*') // Переносим скрипты в продакшен
	.pipe(gulp.dest('dist/assets/js'))

	var buildHtml = gulp.src('app/*.html') // Переносим HTML в продакшен
	.pipe(gulp.dest('dist'));

});

gulp.task('clear', function (callback) {
	return cache.clearAll();
})

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

gulp.task('watch', function() {
	gulp.watch('app/assets/'+syntax+'/**/*.'+syntax+'', gulp.parallel('styles'));
	gulp.watch(['app/assets/libs/**/*.js', 'app/assets/js/common.js'], gulp.parallel('scripts'));
	// gulp.watch('app/*.html', gulp.parallel('code'))
	gulp.watch('app/**/*.pug', gulp.parallel('pug'))
});
gulp.task('default', gulp.parallel('pug', 'styles', 'scripts', 'browser-sync', 'watch'));
gulp.task('build', gulp.parallel('pug', 'prebuild', 'clean', 'img', 'styles', 'scripts'));