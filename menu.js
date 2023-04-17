function toggleNav(id) {
    const nav = document.getElementById("leftslidenav");
    const form = document.getElementById(id);
    const selected = document.querySelector('.controls.selected');
    if (selected.id == id)
        nav.classList.toggle('open');
    else {
        nav.classList.add('open');
        selected.classList.remove('selected');
        form.classList.add('selected');
    }
    document.querySelectorAll('.toggleBtns button').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-form=${id}]`).classList.add('active');
}

var sheet = document.createElement('style');
document.body.appendChild(sheet);

function easeOutCuaic(t) { t--; return t * t * t + 1; }
function zoom(scaleChange) {
    //let newscale, prevscrollx, prevscrolly, offsetwidth, parentheight, clientheight, offsetheight;
    //let canv = document.querySelector('canvas');
    //prevscrollx = canv.offsetParent.scrollLeft;
    //prevscrolly = canv.offsetParent.scrollTop;

    const maxscale = 8, minscale = 0.2, tempscale = scale + scaleChange;
    if (scaleChange === 1 && scale < maxscale)
        newscale = scale + 0.1
    else if (scaleChange === -1 && scale > minscale)
        newscale = scale - 0.1;
    else if (scaleChange === 0)
        newscale = 1;
    else if (scaleChange && tempscale >= minscale && tempscale <= maxscale)
        newscale = scaleChange;
    else
        return false;
    sheet.innerHTML = `.zoomable{transform:scale(${newscale});}`;
    //let Left = prevscrollx - (prevscrollx * (scale - newscale));
    //let Top = prevscrolly - (prevscrolly * (scale - newscale));
    //canv.offsetParent.scrollBy({ top: Top, left: Left, behavior: 'smooth' });
    scale = newscale;
}

function rnd(ceil) {
    return Math.floor(Math.random() * ceil);
}
let map;
const genbutton = document.querySelectorAll('.generate').forEach(item => {
    item.addEventListener('click', event => {
        map = new MapGenerator();
        map.createWorld();
        const canv = document.getElementById('gameCanvas');
        canv.parentNode.scrollTop = canv.offsetTop;
        canv.parentNode.scrollLeft = canv.offsetLeft;
        showifs('view');
    })
});
const rembutton = document.querySelectorAll('.removemap').forEach(item => {
    item.addEventListener('click', event => {
        zoom(0);
        map = null;
        const canvas = document.getElementById('gameCanvas');
        const context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
        showifs('load');
    })
});
const stopeditbutton = document.querySelectorAll('.stopedit').forEach(item => {
    item.addEventListener('click', event => {
        map.unedit();
        const overlay = document.querySelector("canvas:not(#gameCanvas)");
        if (overlay)
            overlay.remove();
        showifs('view');
    })
});
function enforceMinMax(el) {
    if (el.value != "") {
        if (parseInt(el.value) < parseInt(el.min)) {
            el.value = el.min;
            el.classList.add("warning");
        }
        else if (parseInt(el.value) > parseInt(el.max)) {
            el.value = el.max;
            el.classList.add("warning");
        } else {
            el.classList.remove("warning");
        }
    }
}
let scale = 1;
let mode = "load";
function showifs(cls) {
    document.getElementById('leftslidenav').classList.remove('load', 'view', 'edit');
    document.getElementById('leftslidenav').classList.add(cls);
    mode = cls;

}
function handleMouseDown(event) {
    const canvas = document.querySelector('canvas');
    let canvasRect = canvas.getBoundingClientRect();

    const x = (event.clientX - canvasRect.left) / scale;
    const y = (event.clientY - canvasRect.top) / scale;
    map.clicked(x, y);
    showifs('edit');
}