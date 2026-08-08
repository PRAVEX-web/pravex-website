/* =============== OUR WORK =============== */
const reel = document.querySelector(".reel");
const cards = [...document.querySelectorAll(".reel-card")];

/* REFLECTION setup */
const reflectionLayer = document.querySelector(".reflection-layer");
cards.forEach(card => {
    const clone = card.cloneNode(true);
    clone.classList.add("reflection-card");
    reflectionLayer.appendChild(clone);
});
const reflections = [...document.querySelectorAll(".reflection-card")];
/* end of reflection setup */

const TOTAL = cards.length;
const RADIUS = 500;

cards.forEach((card,i)=>{
    const angle = (360/TOTAL)*i;
    card.style.transform = `
        rotateY(${angle}deg)
        translateZ(${RADIUS}px)
    `;
});

let rotation = 0;
let paused = false;
let dragging = false;
let startX = 0;
let dragRotation = 0;

function layout(){
    cards.forEach((card,i)=>{
        const angle = (360/TOTAL)*i - rotation;
        const transform = ` rotateY(${angle}deg) translateZ(${RADIUS}px) `;
        card.style.transform = transform;
        reflections[i].style.transform = transform + "scaleY(-1) translateY(-630px)";
    });
}
function animate(){
    if(!paused && !dragging){
        rotation += 0.09;
    }
    layout();
    requestAnimationFrame(animate);
}
animate();

/* ========= DRAG SUPPORT ========= */
const stage = document.querySelector(".reel-stage");
cards.forEach(card=>{
    card.addEventListener("mouseenter",()=>{
        paused = true;
    });
    card.addEventListener("mouseleave",()=>{
        paused = false;
    });
});
stage.addEventListener("pointerdown", e=>{
    dragging = true;
    startX = e.clientX;
    dragRotation = rotation;
    stage.classList.add("dragging");
});
window.addEventListener("pointermove", e=>{
    if(!dragging) return;
    const dx = e.clientX - startX;
    rotation = dragRotation + dx * -0.1;
});
window.addEventListener("pointerup", ()=>{
    dragging = false;
    stage.classList.remove("dragging");
});