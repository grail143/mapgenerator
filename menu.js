function toggleNav(id, open = false) {
    const nav = document.getElementById("leftslidenav");
    const form = document.getElementById(id);
    const selected = document.querySelector('.controls.selected');
    if (selected.id == id && !open)
        nav.classList.toggle('open');
    else if (selected.id != id) {
        nav.classList.add('open');
        selected.classList.remove('selected');
        form.classList.add('selected');
    } else {
        nav.classList.add('open');
    }
    document.querySelectorAll('.toggleBtns button').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-form=${id}]`).classList.add('active');
}

var tempstylesheet = document.createElement('style');
document.body.appendChild(tempstylesheet);

function zoom(scaleChange, x = 0, y = 0, tileSize = 32) {
    let canv = document.querySelector('#gameCanvas');
    const prevscrollx = x || (canv.offsetParent.scrollLeft / scale);
    const prevscrolly = y || (canv.offsetParent.scrollTop / scale);

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
    tempstylesheet.innerHTML = `.zoomable{transform:scale(${newscale});}`;
    scale = newscale;
    const newscrollx = prevscrollx == x ? (x * scale) + tileSize / 2 - canv.offsetParent.clientWidth / 2 + canv.offsetLeft : prevscrollx * scale;
    const newscrolly = prevscrolly == y ? (y * scale) + tileSize / 2 - canv.offsetParent.clientHeight / 2 + canv.offsetTop : prevscrolly * scale;
    canv.parentNode.scrollTo(newscrollx, newscrolly);
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
        map.destroy();
        map = null;
        showifs('load');
    })
});
const stopeditbutton = document.querySelectorAll('.stopedit').forEach(item => {
    item.addEventListener('click', event => {
        map.unedit();
        console.log(`${JSON.stringify(map.mapEditor)}`);
        showifs('view');
    })
});
const savetilebutton = document.querySelectorAll('.savetile').forEach(item => {
    item.addEventListener('click', event => {
        map.mapEditor.saveTile();
    })
});
const remtilebutton = document.querySelectorAll('.remtile').forEach(item => {
    item.addEventListener('click', event => {
        map.mapEditor.removeSprite();
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
