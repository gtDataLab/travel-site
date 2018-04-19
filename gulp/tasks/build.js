var gulp = require('gulp'),
imagemin = require('gulp-imagemin'),
del = require('del'),
usemin = require('gulp-usemin'),
rev = require('gulp-rev'),
cssnano = require('gulp-cssnano'),
uglify = require('gulp-uglify'),
browserSync = require('browser-sync').create();

var outputDir = "docs";  // use 'docs' when uploading to GitHub pages
//var outputDir = "dist"; // use 'dist' normally

// Opens the new distribution in a browser
gulp.task('previewDist', function() {
	browserSync.init({
		notify: false,
		server: {
			baseDir: outputDir
		}
	});
});

// Deletes the existing output folder; do this before launching the other tasks
// This task runs the icons task to ensure we have an icons sprite before regenerating the CSS with the styles task
gulp.task('deleteDistFolder', ['icons'], function() {
	return del("./" + outputDir);
});

// Copies any other files/folders for the app; ensure you exclude (!) the files you don't want to be part of this task
gulp.task('copyGeneralFiles', ['deleteDistFolder'], function() {
	var pathsToCopy = [
		'./app/**/*',
		'!./app/index.html',
		'!./app/assets/images/**',
		'!./app/assets/styles/**',
		'!./app/assets/scripts/**',
		'!./app/temp',
		'!./app/temp/**'
	]
	return gulp.src(pathsToCopy)
	.pipe(gulp.dest("./" + outputDir));
});

// Optimize images
// Ensure you exclude the icons if you're using an icon sprite
gulp.task('optimizeImages', ['deleteDistFolder'], function() {
	return gulp.src(['./app/assets/images/**/*', '!./app/assets/images/icons', '!./app/assets/images/icons/**/*'])
	.pipe(imagemin({
		progressive: true,
		interlaced: true,
		multipass: true
	}))
	.pipe(gulp.dest("./" + outputDir + "/assets/images"));
});

// Ensure usemin doesn't kick off until the delete previous folder task finishes
// (which will ensure we have the newest icons sprite -- since that's a dependency in the delete task)
gulp.task('useminTrigger', ['deleteDistFolder'], function() {
	gulp.start("usemin");
});

// Compress and minify CSS and JSS
// First run styles and scripts task to get a fresh copy of those files
gulp.task('usemin', ['styles', 'scripts'], function() {
	return gulp.src("./app/index.html")
	.pipe(usemin({
		css: [function() {return rev()}, function() {return cssnano()}],
		js: [function() {return rev()}, function() {return uglify()}]
	}))
	.pipe(gulp.dest("./" + outputDir));
});

// Full build task 
gulp.task('build', ['deleteDistFolder', 'copyGeneralFiles', 'optimizeImages', 'useminTrigger']);