/**
 *
 * @param {object} path - path
 * @param gulp
 * @param {object} plugins - gulp plugins
 * @returns {Function} - return task
 */

module.exports = function (path, gulp, plugins) {
  return function () {
    return gulp.src(path.gzip)
      .pipe(plugins.plumber({
        errorHandler: plugins.notify.onError({
          message: "<%= error.message %>",
          title: "gzip Error!"
        })
      }))
      .pipe(plugins.gzip({gzipOptions: {level: 9}})) // Create gziped files
      .pipe(gulp.dest(function (file) {
        return file.base; // Add gziped files to the same destination where the original files
      }));
  };
};