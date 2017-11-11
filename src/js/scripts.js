let $document = $(document),
    $window = $(window);

function loadSvgSprite() {
  if (typeof(svgArray) !== "undefined") {
    $.each(svgArray, function (index, value) {
      $.ajax({
        url: value,
        cache: true,
        success: function (data) {
          $(".svg-sprite").append(new XMLSerializer().serializeToString(data.documentElement));
        }
      });
    });
  }
}


function App() {
  this.init = function () {
    loadSvgSprite();
  }
}


$document.ready(function () {
  let app = new App();
  app.init();
});