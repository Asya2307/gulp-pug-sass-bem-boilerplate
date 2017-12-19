var gulp = require("gulp"),
  plugins = require("gulp-load-plugins")(),
  browserSync = require("browser-sync"),
  ftp = require("vinyl-ftp");
plugins.emitty = require("emitty").setup("src", "pug");
plugins.path = require("path");
plugins.merge = require("merge-stream");
plugins.del = require("del");
plugins.gpath = require("path");
plugins.pngquant = require("imagemin-pngquant");

global.svgFileName = undefined;

var serverConfig = { // Config for browser-sync
  server: {
    baseDir: "./dist"
  },
  ui: false,
  host: "localhost",
  port: 3000,
  open: false,
  notify: false,
  ReloadOnRestart: true,
  ghostMode: {
    clicks: false,
    forms: false,
    scroll: false
  }
};

var path = {
  svg: {
    svgFiles: "./src/svg/**/*.svg",
    unnecessary: "unnecessary-svg/svg-sprite.svg",
    template: "./src/sass/templates/_template_svg.sass",
    templateDest: "sass/parts/_sprite.sass"
  },
  build: {
    pug: "dist",
    sass: "dist/css",
    js: "dist/js",
    fonts: "dist/fonts",
    images: "dist/images",
    videos: "dist/videos"
  },
  src: {
    pug: "src/*.pug",
    sass: [
      "src/sass/**/*.sass",
      "src/sass/**/*.scss"
    ],
    js: "./src/js/*.js",
    fonts: "src/fonts/**/*.*",
    images: {
      png: "src/images/**/*.png",
      jpg: "src/images/**/*.jpg",
      gif: "src/images/**/*.gif",
      svg: "src/images/**/*.svg"
    },
    videos: "src/videos/**"
  },
  watch: {
    svgFiles: "./src/svg/**/*.svg",
    pug: "src/**/*.pug",
    sass: [
      "src/sass/**/*.sass",
      "src/sass/**/*.scss"
    ],
    js: "src/js/**/*.js",
    fonts: "src/fonts/**/*.*",
    images: "src/images/**/*.*",
    videos: "src/videos/**/*.*"
  },
  rev: [
    "dist/css/**/*.css",
    "dist/js/**/*.js",
    "dist/images/**/*"
  ],
  revReplace: [
    "dist/**/*.html",
    "dist/css/**/*.css"
  ],
  gzip: [
    "dist/css/**/*.css",
    "dist/js/**/*.js",
    "dist/images/**/*",
    "dist/fonts/**/*",
    "dist/*.html"
  ]
};

var ftpConfig = ftp.create({ // Config for FTP
  host: "",
  user: "",
  password: "",
  parallel: 10,
  log: plugins.util.log
});

gulp.task("webserver", function () {
  browserSync(serverConfig);
});

gulp.task("reload", function (cb) {
  browserSync.reload();
  cb();
});

gulp.task("clean-dist", function () {
  return plugins.del("dist");
});

gulp.task("clean-svg", function () {
  return plugins.del(["src/unnecessary-svg"]);
});

gulp.task("clean-cache", function (done) {
  return plugins.cache.clearAll(done);
});

gulp.task("pug:dev", require("./gulp-tasks/pug")(path, gulp, plugins, global, true));
gulp.task("pug:prod", require("./gulp-tasks/pug")(path, gulp, plugins, global, false));

gulp.task("sass:dev", require("./gulp-tasks/sass")(path, gulp, plugins, true));
gulp.task("sass:prod", require("./gulp-tasks/sass")(path, gulp, plugins, false));

gulp.task("js:dev", require("./gulp-tasks/js")(path, gulp, plugins, true));
gulp.task("js:prod", require("./gulp-tasks/js")(path, gulp, plugins, false));

gulp.task("images:dev", require("./gulp-tasks/images")(path, gulp, plugins, true));
gulp.task("images:prod", require("./gulp-tasks/images")(path, gulp, plugins, false));

gulp.task("svg-styles", require("./gulp-tasks/svg-styles")(path, gulp, plugins));
gulp.task("svg-store", require("./gulp-tasks/svg-store")(path, gulp, plugins, svgFileName));

gulp.task("fonts", require("./gulp-tasks/transfer")(gulp, plugins, path.src.fonts, path.build.fonts));
gulp.task("videos", require("./gulp-tasks/transfer")(gulp, plugins, path.src.videos, path.build.videos));

gulp.task("rev", require("./gulp-tasks/rev")(path, gulp, plugins));

gulp.task("gzip", require("./gulp-tasks/gzip")(path, gulp, plugins));

gulp.task("watch", function () {
  global.watch = true;

  gulp.watch(path.watch.pug, gulp.series("pug:dev", "reload"))
    .on("all", function (event, filepath) {
      global.emittyChangedFile = filepath;
    });

  gulp.watch(path.watch.sass, gulp.series("sass:dev", "reload"));
  gulp.watch(path.watch.js, gulp.series("js:dev", "reload"));
  gulp.watch(path.watch.images, gulp.series("images:dev", "reload"));
  gulp.watch(path.watch.fonts, gulp.series("fonts", "reload"));
  gulp.watch(path.watch.videos, gulp.series("videos", "reload"));

  gulp.watch(path.watch.svgFiles, gulp.series("svg-styles", "svg-store", "sass:dev", "reload"))
    .on("all", function (event, filepath) {
      console.log(filepath);
      var myregexp = /.*[\/\\]([^_]+)/;
      var match = myregexp.exec(filepath);
      global.svgFileName = match[1];
    });
});

gulp.task("ftp-deploy", function () {
  var html = [
      "dist/**/*.html"
    ],
    other = [
      "dist/**/*",
      "!dist/**/*.html"
    ];

  ftpConfig.rmdir("/path/css", function () {
  });
  ftpConfig.rmdir("/path/js", function () {
  });

  return gulp.src(html, {buffer: false})
    .pipe(ftpConfig.dest("/path"))
    .on("end", function () {
      return gulp.src(other, {buffer: false})
        .pipe(ftpConfig.differentSize("/path"))
        .pipe(ftpConfig.dest("/path"));
    });
});

gulp.task("ftp-clean", function () {
  ftpConfig.rmdir("/path", function () {
  });
});

gulp.task("build:dev", gulp.series(
  "clean-dist",
  "clean-svg",
  "pug:dev",
  "svg-styles",
  "svg-store",
  "sass:dev",
  gulp.parallel(
    "js:dev",
    "fonts",
    "videos",
    "images:dev"
  )
));

gulp.task("build:prod", gulp.series(
  "clean-dist",
  "clean-svg",
  "pug:prod",
  "svg-styles",
  "svg-store",
  "sass:prod",
  "clean-svg",
  gulp.parallel(
    "js:prod",
    "fonts",
    "videos",
    "images:prod"
  ),
  "rev"
));

gulp.task("dev", gulp.series(
  "build:dev",
  gulp.parallel("watch", "webserver")
));

gulp.task("build", gulp.series(
  "build:prod"
));

gulp.task("default", gulp.series(
  "dev"
));