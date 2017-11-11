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
    return gulp.src(path.src.js)
      .pipe(plugins.plumber({
        errorHandler: plugins.notify.onError({
          message: "<%= error.message %>",
          title: "JS Error!"
        })
      })) // Show error message on error
      .pipe(plugins.if(dev, plugins.sourcemaps.init())) // If dev, init sourcemaps
      .pipe(plugins.babel({presets: ["env"]})) // Compile to ES5
      .pipe(plugins.include()) // Include scripts
      .pipe(plugins.if(dev, plugins.sourcemaps.write("../maps"))) // If dev, write sourcemaps
      .pipe(plugins.if(!dev, plugins.uglify())) // If build, compress scripts
      .pipe(gulp.dest(path.build.js));
  };
};