document.addEventListener("DOMContentLoaded", function () {
  var replacers = document.querySelectorAll("[data-replace]");
  for (var i = 0; i < replacers.length; i++) {
    let element = replacers[i] as HTMLElement;
    let replaceClasses = JSON.parse(
      element.dataset.replace!.replace(/'/g, '"')
    );
    Object.keys(replaceClasses).forEach(function (key) {
      replacers[i].classList.remove(key);
      replacers[i].classList.add(replaceClasses[key]);
    });
  }
});
