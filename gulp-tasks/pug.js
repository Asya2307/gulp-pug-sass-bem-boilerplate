/**
 *
 * @param {object} path - path
 * @param gulp
 * @param {object} plugins - gulp plugins
 * @param {object} global - global variables
 * @param {boolean} dev - flag
 * @returns {Function} - return task
 */

module.exports = function (path, gulp, plugins, global, dev) {
  if (dev) {
    return function () {
      return new Promise(function (resolve, reject) {
        plugins.emitty.scan(global.changedStyleFile).then(function () { // Use emmity for incremental compilation (for more information - https://www.npmjs.com/package/emitty)
          gulp.src(path.src.pug)
            .pipe(plugins.plumber({
              errorHandler: plugins.notify.onError({
                message: "<%= error.message %>",
                title: "PUG Error!"
              })
            })) // Show error message on error
            .pipe(plugins.if(global.watch, plugins.emitty.filter(global.emittyChangedFile))) // Watch pug-files
            .pipe(plugins.pug({pretty: true})) // Compile pug-files
            .pipe(gulp.dest(path.build.pug))
            .on("end", resolve)
            .on("error", reject);
        });
      });
    }
  } else {
    return function () {
      return gulp.src(path.src.pug)
        .pipe(plugins.plumber({
          errorHandler: plugins.notify.onError({
            message: "<%= error.message %>",
            title: "PUG Error!"
          })
        })) // Show error message on error
        .pipe(plugins.pug()) // Compile pug-files
        .pipe(plugins.htmlmin({collapseWhitespace: true})) // Compress html-files
        .pipe(gulp.dest(path.build.pug));
    }
  }
};