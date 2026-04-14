const track = document.querySelector(".track");
const items = document.querySelectorAll(".item");

let index = 0;
const itemsPerView = 3;

document.querySelector(".next").addEventListener("click", () => {
    if (index < items.length - itemsPerView) {
        index++;
        move();
    }
});

document.querySelector(".prev").addEventListener("click", () => {
    if (index > 0) {
        index--;
        move();
    }
});

function move() {
    track.style.transform = `translateX(-${index * (100 / itemsPerView)}%)`;
}
