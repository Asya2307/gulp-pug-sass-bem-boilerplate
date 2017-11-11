/**
 *
 * @param {object} path - path
 * @param gulp
 * @param {object} plugins - gulp plugins
 * @returns {Function} - return task
 */

module.exports = function (path, gulp, plugins) {
  return function () {
    return gulp.src(path.rev)
      .pipe(plugins.plumber({
        errorHandler: plugins.notify.onError({
          message: "<%= error.message %>",
          title: "REV Error!"
        })
      })) // Show error message on error
      .pipe(plugins.rev()) // Create new files with hash
      .pipe(gulp.dest(function (file) {
        return file.base; // Add new files with hash to the same destination where the original files
      }))
      .pipe(plugins.revDeleteOriginal()) // Delete original files
      .pipe(plugins.rev.manifest()) // Create rev-manifest.json
      .pipe(gulp.dest(path.build.pug))
      .on("end", function () {
        var manifest = gulp.src("dist/rev-manifest.json");

        return gulp.src(path.revReplace)
          .pipe(plugins.plumber({
            errorHandler: plugins.notify.onError({
              message: "<%= error.message %>",
              title: "REV Error!"
            })
          })) // Show error message on error
          .pipe(plugins.revReplace({manifest: manifest})) // Rewrite occurrences of new files
          .pipe(gulp.dest(function (file) {
            return file.base;
          }))
          .on("end", function () {
            plugins.del("dist/rev-manifest.json") // Remove rev-manifest.json
          });
      });
  };
};