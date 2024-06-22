interface TouchObject {
  ImageContainer: HTMLElement;
  BackgroundElement: HTMLElement;
  CoverElement: HTMLElement;
  LinkElement: HTMLAnchorElement;
  Visible: boolean;
}

const imageContainers = document.querySelectorAll("#image-container");

let touchObjectsArray: TouchObject[] = [];

imageContainers.forEach((container) => {
  let touchObject: TouchObject = {
    ImageContainer: container as HTMLElement,
    BackgroundElement: container.querySelector("#background") as HTMLElement,
    CoverElement: container.querySelector("#cover") as HTMLElement,
    LinkElement: container.querySelector("#link") as HTMLAnchorElement,
    Visible: true,
  };
  touchObjectsArray.push(touchObject);
});

const isTouchDevice = "ontouchstart" in document.documentElement;

touchObjectsArray.forEach((touchObject) => {
  if (isTouchDevice) {
    let startX: number, startY: number, endX: number, endY: number;

    touchObject.ImageContainer.addEventListener(
      "touchstart",
      function (event: TouchEvent) {
        if (event.touches.length === 1) {
          startX = event.touches[0].clientX;
          startY = event.touches[0].clientY;
        }
      }
    );

    touchObject.ImageContainer.addEventListener(
      "touchend",
      function (event: TouchEvent) {
        if (event.changedTouches.length === 1) {
          endX = event.changedTouches[0].clientX;
          endY = event.changedTouches[0].clientY;

          const deltaX = Math.abs(endX - startX);
          const deltaY = Math.abs(endY - startY);

          // Check if the touch movement is small
          if (deltaX < 10 && deltaY < 10) {
            event.preventDefault();
            if (touchObject.Visible) {
              touchObjectsArray.forEach((touchObj) => {
                touchObj.CoverElement.style.opacity = "1";
                touchObj.BackgroundElement.style.opacity = "1";
                touchObj.Visible = true;
              });
              // First tap, change opacity of image
              touchObject.CoverElement.style.opacity = "0";
              touchObject.BackgroundElement.style.opacity = "0";
              touchObject.Visible = false;
            } else {
              // Second tap, redirect to link
              window.location.href = touchObject.LinkElement.href;
            }
          }
        }
      }
    );
  } else {
    touchObject.ImageContainer.addEventListener("mouseenter", function () {
      touchObject.CoverElement.classList.add("opacity-0");
      touchObject.BackgroundElement.classList.add("opacity-0");
    });
    touchObject.ImageContainer.addEventListener("mouseleave", function () {
      touchObject.CoverElement.classList.remove("opacity-0");
      touchObject.BackgroundElement.classList.remove("opacity-0");
    });
  }
});
