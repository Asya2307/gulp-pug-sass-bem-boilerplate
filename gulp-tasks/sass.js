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
    return gulp.src(path.src.sass)
      .pipe(plugins.plumber({
        errorHandler: plugins.notify.onError({
          message: "<%= error.message %>",
          title: "SASS Error!"
        })
      })) // Show error message on error
      .pipe(plugins.if(dev, plugins.sourcemaps.init())) // If dev, init sourcemaps
      .pipe(plugins.sass({
        precision: 20
      })) // Compile sass-files
      .pipe(plugins.postcss([
        require("css-mqpacker"), // Concat all media-queries with the same condition into one media-query
        require("autoprefixer")({
          browsers: ["> 1%", "last 20 versions", "Firefox ESR", "Opera 12.1"],
          cascade: true
        }) // Add prefixes
      ]))
      .pipe(plugins.if(dev, plugins.sourcemaps.write("../maps"))) // If dev, write sourcemaps
      .pipe(plugins.if(!dev, plugins.cssnano({
        autoprefixer: {remove: false}
      }))) // If build, compress css-files
      .pipe(gulp.dest(path.build.sass));
  };
};