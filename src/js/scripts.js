const $document = $(document);

const loadSvgSprite = () => {
  if (typeof svgArray !== "undefined") {
    svgArray.forEach((value) => {
      const request = new XMLHttpRequest();

      request.open("GET", value, true);

      request.onload = () => {
        if (request.status >= 200 && request.status < 400) {
          const svgSprite = document.querySelector(".svg-sprite");

          svgSprite.innerHTML += request.responseText;
        }
      };

      request.send();
    });
  }
};


function App() {
  this.init = () => {
    loadSvgSprite();
  }
}


$document.ready(() => {
  const app = new App();
  app.init();
});