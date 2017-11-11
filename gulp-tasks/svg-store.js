/**
 *
 * @param {object} path - path
 * @param gulp
 * @param {object} plugins - gulp plugins
 * @returns {Function} - return task
 */

module.exports = function (path, gulp, plugins) {
  return function () {
    var svgSpritesName = ["sprite", "infoBlock", "stepsBar", "action", "seasons"];

    if (global.svgFileName !== undefined) {
      svgSpritesName = [global.svgFileName];
    }

    var svgStoreMerge = plugins.merge();

    svgSpritesName.forEach(function (item) {
      svgStoreMerge.add(gulp.src("./src/svg/**/" + item + "_*.svg")
        .pipe(plugins.svgmin(function (file) {
          var prefix = plugins.gpath.basename(file.relative, plugins.gpath.extname(file.relative));
          return {
            plugins: [{
              cleanupIDs: {
                prefix: prefix + "-",
                minify: true
              }
            }]
          }
        })) // Optimize svg-files
        .pipe(plugins.cheerio({
          run: function ($) {
            $("[fill]").removeAttr("fill");
            $("[style]").removeAttr("style");
            $("[class]").removeAttr("class");
          },
          parserOptions: {xmlMode: true}
        })) // Remove attributes fill, style, class from svg-files
        .pipe(plugins.replace("&gt;", ">")) // Replace &gt; to > (gulp-cheerio bug)
        .pipe(plugins.svgstore({inlineSvg: true})) // Generate svg-sprite
        .pipe(plugins.rename({
          basename: item,
          suffix: "_icons",
          extname: ".svg"
        })) // Rename svg-sprite
        .pipe(gulp.dest("./dist/images")));
    });

    return svgStoreMerge;
  }
};