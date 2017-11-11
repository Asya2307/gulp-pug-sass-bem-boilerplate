/**
 *
 * @param {object} path - path
 * @param gulp
 * @param {object} plugins - gulp plugins
 * @param {boolean} dev - flag
 * @returns {Function} - return task
 */

module.exports = function (path, gulp, plugins, dev) {
  return function () {
    var png = gulp.src(path.src.images.png) // Task for png-files
      .pipe(plugins.cache(
        plugins.if(!dev,
          plugins.imagemin({
            use: [plugins.pngquant()]
          })
        ) // If build, optimize files
      )) // Cache files
      .pipe(gulp.dest(path.build.images));

    var jpg = gulp.src(path.src.images.jpg) // Task for jpg-files
      .pipe(plugins.cache(
        plugins.if(!dev,
          plugins.imagemin({
            progressive: true
          })
        ) // If build, optimize files
      )) // Cache files
      .pipe(gulp.dest(path.build.images));

    var gif = gulp.src(path.src.images.gif) // Task for gif-files
      .pipe(plugins.cache(
        plugins.if(!dev,
          plugins.imagemin({
            interlaced: true,
            optimizationLevel: 3
          })
        ) // If build, optimize files
      )) // Cache files
      .pipe(gulp.dest(path.build.images));

    var svg = gulp.src(path.src.images.svg) // Task for svg-files
      .pipe(plugins.cache(
        plugins.if(!dev,
          plugins.svgmin()
        ) // If build, optimize files
      )) // Cache files
      .pipe(gulp.dest(path.build.images));

    return plugins.merge(png, jpg, gif, svg); // Merge all tasks
  }
};