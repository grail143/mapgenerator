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
function createWorld(isBlank) {
    map = new MapGenerator();
    map.createWorld(isBlank);
    const canv = document.getElementById('gameCanvas');
    canv.parentNode.scrollTop = canv.offsetTop;
    canv.parentNode.scrollLeft = canv.offsetLeft;

}
let map;
document.querySelectorAll('.generate').forEach(item => {
    item.addEventListener('click', event => {
        createWorld(false);
        showifs('view');
    })
});
document.querySelectorAll('.generateblank').forEach(item => {
    item.addEventListener('click', event => {
        createWorld(true);
        showifs('view');
    })
});
document.querySelectorAll('.removemap').forEach(item => {
    item.addEventListener('click', event => {
        map.destroy();
        map = null;
        showifs('load');
    })
});
document.querySelectorAll('.stopedit').forEach(item => {
    item.addEventListener('click', event => {
        map.unedit();
        showifs('view');
    })
});
document.querySelectorAll('.savetile').forEach(item => {
    item.addEventListener('click', event => {
        map.mapEditor.saveTile();
    })
});
document.querySelectorAll('.remtile').forEach(item => {
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
let xysizelock = true;
function showifs(cls) {
    document.getElementById('leftslidenav').classList.remove('load', 'view', 'edit');
    document.getElementById('leftslidenav').classList.add(cls);
    document.getElementById('rightdragnav').classList.remove('load', 'view', 'edit');
    document.getElementById('rightdragnav').classList.add(cls);
    mode = cls;
    if (mode != 'edit')
        hidedrag(true);
    else
        hidedrag(false);
}

var lockxytoggle = document.querySelectorAll('.toggle').forEach(item => {
    item.addEventListener('change', function () {
        if (this.value === "true") {
            document.querySelectorAll("#nudge_y button").forEach(button => {
                button.disabled = true;
                xysizelock = true;
            })
        } else {
            document.querySelectorAll("#nudge_y button").forEach(button => {
                button.disabled = false;
                xysizelock = false;
            })
        }
    });
});
document.querySelectorAll('h3.withSub').forEach(h3 => {
    h3.addEventListener('click', function (ev) {
        document.querySelector(`[data-sub=${ev.currentTarget.dataset.for}]`).classList.toggle('hide');
    });
});

const dragel = document.getElementById("rightdragnav");
dragElement(dragel);
function dragElement(elmnt) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    if (document.querySelector(`${elmnt.id} h3`)) {
        document.getElementById(`${elmnt.id} h3`).onmousedown = dragMouseDown;
    } else {
        elmnt.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
        e = e || window.event;
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

function hidedrag(hide = true) {
    if (hide) {
        dragel.style.top = 0;
        dragel.style.left = '-500px';
        document.querySelectorAll('.drag .collapsible').forEach(item => {
            item.classList.add('hide');
        });
    }
    else {
        dragel.style.top = 0;
        dragel.style.left = 'calc( 100vw - 230px )';
    }
}