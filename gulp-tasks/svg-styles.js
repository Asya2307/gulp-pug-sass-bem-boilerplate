/**
 *
 * @param {object} path - path
 * @param gulp
 * @param {object} plugins - gulp plugins
 * @returns {Function} - return task
 */

module.exports = function (path, gulp, plugins) {
  return function () {
    var config = {
      dest: ".",
      mode: {
        css: {
          dest: ".",
          prefix: "\&_%s",
          dimensions: "%s",
          sprite: path.svg.unnecessary,
          render: {
            sass: {
              template: path.svg.template,
              dest: path.svg.templateDest
            }
          }
        }
      }
    };

    return gulp.src(path.svg.svgFiles)
      .pipe(plugins.plumber({
        errorHandler: plugins.notify.onError({
          message: "<%= error.message %>",
          title: "SVG SASS Error!"
        })
      })) // Show error message on error
      .pipe(plugins.svgSprite(config)) // Generate styles for every svg-file
      .pipe(plugins.replace("&amp;", "&")) // Replace &gt; to >
      .pipe(gulp.dest("./src"));
  }
};