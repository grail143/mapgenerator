class World {
    constructor(width, height) {
        this.worldWidth = parseInt(width, 10);
        this.worldHeight = parseInt(height, 10);
        if (isNaN(this.worldWidth)) {
            this.worldWidth = 10;
        }
        if (isNaN(this.worldHeight)) {
            this.worldHeight = 10;
        }

        this.world = Array(this.worldWidth).fill().map(() => Array(this.worldHeight).fill(0));
        this.len = this.world.length;
    }
    dup(filler, startX, startY, lengthX, lengthY) {
        for (let x = startX; x < startX + lengthX; x++) {
            if (!Array.isArray(this[x])) {
                this[x] = new Array();
            }
            for (let y = startY; y < startY + lengthY; y++) {
                this[x][y] = filler;
            }
        }
    }
    shuffle() {
        let j, temp;
        for (let i = 0; i < this.length; i++) {
            j = rnd(this.length);
            temp = this[i];
            this[i] = this[j];
            this[j] = temp;
        }
        return (this);
    }
    freeRect(filler, startX, startY, lengthX, lengthY) {
        for (let x = startX; x < startX + lengthX; x++) {
            for (let y = startY; y < startY + lengthY; y++) {
                if (this[x][y] == filler) {
                    return false;
                }
            }
        }
        return true;
    }
    biggestFree(filler, startX, startY, lengthX, lengthY) {
        let found = new Array();
        for (let biggest = Math.min(lengthX, lengthY); biggest > 0; biggest--) {
            for (let x = startX; x <= startX + lengthX - biggest; x++) {
                for (let y = startY; y <= startY + lengthY - biggest; y++) {
                    if (this.freeRect(filler, x, y, biggest, biggest)) {
                        found.push({
                            x: x,
                            y: y
                        });
                    }
                }
            }
            if (found.length > 0) {
                found.shuffle();
                return {
                    biggest: biggest,
                    x: found[0].x,
                    y: found[0].y
                };
            }
        }
    }
}
class Room {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.delete = "no";
        this.corners = this.setCorners();
    }
    setCorners() {
        let corners = [];
        corners.push({ position: 'NW', x: this.x - 1, y: this.y - 1 });
        corners.push({ position: 'NE', x: this.x + this.width, y: this.y - 1 });
        corners.push({ position: 'SW', x: this.x - 1, y: this.y + this.height });
        corners.push({ position: 'SE', x: this.x + this.width, y: this.y + this.height });
        return corners;
    }
    perimeter(corners = false) {
        let per = new Array();
        for (let x = this.x; x < this.x + this.width; x++) {
            per.push({
                x: x,
                y: this.y - 1
            });
            per.push({
                x: x,
                y: this.y + this.height
            });
        }
        for (let y = this.y; y < this.y + this.height; y++) {
            per.push({
                x: this.x - 1,
                y: y
            });
            per.push({
                x: this.x + this.width,
                y: y
            });
        }
        if (corners) {
            for (let corner = 0; corner < this.corners.length; corner++)
                per.push({
                    x: corner.x,
                    y: corner.y
                });
        }
        return per;
    }
}

class Floor {
    constructor(src) {
        this.img = src;
    }
    draw(ctx, width, height) {
        const ptrn = ctx.createPattern(this.img, 'repeat');
        ctx.fillStyle = ptrn;
        ctx.fillRect(0, 0, width, height);
        ctx.fill();
    }
}
class Sprite {
    constructor(
        tile = {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            direction: 0,
            mirrorh: 1,
            mirrorv: 1
        },
        sprite = {
            sheet: null,
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            spritesize: 0,
            spritetype: 0,
            tilesPer: 0
        }
    ) {
        this.tile = tile;
        this.sprite = sprite;
    }
    getSpriteName() {
        const types = ["none", "wall", "door", "obstacle", "treasure", "monster"];
        return types[this.sprite.spritetype];
    }
    getSpriteWorldInd() {
        return this.sprite.spritetype;
    }
    getSpriteSheet() {
        return this.sprite.sheet;
    }
    draw(ctx, tileSize, tilesPer = 1) {
        if (!this.sprite.tilesPer)
            return false;
        this.x = this.x || this.tile.x * tileSize;
        this.y = this.y || this.tile.y * tileSize;
        ctx.save();
        this.rotate(ctx, tileSize, tilesPer);

        ctx.drawImage(this.sprite.getCanvas(),
            0, 0,
            this.sprite.spriteWidth, this.sprite.spriteHeight,
            0, 0,
            this.tile.width, this.tile.height);

        ctx.restore();
    }
    getTileAreaCenter() {
        const centerX = this.tile.height / 2;
        const centerY = this.tile.height / 2;
        return { 'centerX': centerX, 'centerY': centerY };
    }
    getBlockCenter(tilex, tiley) {
        const centerX = tilex + this.tile.height / 2;
        const centerY = tiley + this.tile.height / 2;
        return { 'centerX': centerX, 'centerY': centerY };

    }
    rotate(ctx, tileSize, tilesPer) {
        const tilex = this.x;
        const tiley = this.y;
        const angle = this.tile.direction * Math.PI / 180;
        const tileCenters = this.getTileAreaCenter(tilesPer);
        const centerX = tileCenters['centerX'];
        const centerY = tileCenters['centerY'];
        const blockCenters = this.getBlockCenter(tilex, tiley);
        const blockCenterX = blockCenters['centerX'];
        const blockCenterY = blockCenters['centerY'];

        ctx.translate(blockCenterX, blockCenterY);
        ctx.rotate(angle);
        ctx.scale(this.tile.mirrorh || 1, this.tile.mirrorv || 1);
        ctx.translate(-centerX, -centerY);
    }
    clone() {
        let tile = Object.assign(Object.create(Object.getPrototypeOf(this.tile)), this.tile);
        let sprite = Object.assign(Object.create(Object.getPrototypeOf(this.sprite)), this.sprite);
        return new Sprite(tile, sprite)
    }
}

class Wall extends Sprite {
    constructor(tile, sprite, type) {
        super(tile, sprite);
        this.walltype = type;
        this.sprite.spritetype = 1;
    }
}
class Door extends Sprite {
    constructor(x, y, dir, tileSize, sheet, double = false) {
        let tile = {
            x: x,
            y: y,
            width: double ? tileSize * 2 : tileSize,
            height: tileSize,
            mirrorh: 1,
            mirrorv: -1
        }
        let sprite = {
            sheet: sheet,
            x: 0,
            y: 0,
            width: 150,
            height: 150,
            spritesize: 150,
            spritetype: 2,
            tilesPer: 0
        }
        super(tile, sprite);
        this.tile.direction = this.setDirection(dir);
        this.setSprite();
    }
    setDirection(dir) {
        const rand = Math.floor(Math.random() * 2);
        return dir ? [90, 270][rand] : [0, 180][rand];
    }
    setSprite() {
        let sprites, rand = Math.random(), sprite, spriteRatio = this.tile.height / this.tile.width;
        sprites = spriteSheets.door[0].spriteimages.filter((sprite) => sprite.spriteHeight / sprite.spriteWidth == spriteRatio);
        sprite = sprites[Math.floor(rand * sprites.length)];
        this.sprite = sprite;
        this.sprite.spritetype = 2;
    }
    setDouble(adjoiningdoors, double = true) {
        if (double) {
            this.tile.width = this.tile.height * 2;
            this.tile.direction = adjoiningdoors.includes('S') ? 90 : 0;
        } else
            this.tile.width = this.tile.height;
        this.setSprite();
        return adjoiningdoors.includes('S') ? { x: this.tile.x, y: this.tile.y + 1 } : { x: this.tile.x + 1, y: this.tile.y }
    }
}

class MapGenerator {
    constructor() {
        this.background = null;
        this.loaded = false;
        this.numOfSprites = 0;
        this.rooms = [];
        this.doors = [];
        this.sprites = [];
        this.selectedObject = null;
        this.mapEditor = null;
        this.init();
    }
    init() {
        this.bgcanvas = createCanvas('bgCanvas', ['zoomable'], 1, 1);
        this.canvas = createCanvas('gameCanvas', ['zoomable'], 1, 1);
        this.bgctx = this.bgcanvas.getContext("2d");
        this.ctx = this.canvas.getContext("2d");
        let mapfield = document.querySelector('.mapfield');
        mapfield.append(this.bgcanvas);
        mapfield.append(this.canvas);
        this.attachMouseEvent();
    }
    destroy() {
        document.querySelector('.mapfield').removeChild(this.canvas);
        document.querySelector('.mapfield').removeChild(this.bgcanvas);
        scale = 1;
        mode = "load";
        tempstylesheet.innerHTML = '';
    }
    attachMouseEvent() {
        document.getElementById('gameCanvas').addEventListener('click', event => {
            if (map.mapEditor) {
                debugger;
            }
            const canvas = event.target;
            let canvasRect = canvas.getBoundingClientRect();

            const x = (event.clientX - canvasRect.left) / scale;
            const y = (event.clientY - canvasRect.top) / scale;
            map.clicked(x, y);
            showifs('edit');
        });
    }
    getWallSpritePiece(type, length, sheetidx = 0) {
        let sprites = spriteSheets.wall[sheetidx].spriteimages.filter((sprite) => sprite.typeidx === type);
        if (type === 0) {
            let longsprites = sprites.filter((sprite) => sprite.spriteWidth <= (length * spriteSheets.wall[sheetidx].spriteSize));
            if (longsprites.length)
                return longsprites.reduce(function (prev, current) {
                    return (prev.width > current.width) ? prev : current
                });
            return longsprites[0] || sprites[0];
        } else {
            return sprites[0];
        }
        return false;
    }
    assignWallSprites(walltiles, walllengths) {
        const wallSprites = {};
        let tilesadded = [];
        for (let xtiles = 0; xtiles < this.world.len; xtiles++) {
            yloop: for (let ytiles = 0; ytiles < this.world[xtiles].length; ytiles++) {

                if ((this.world[xtiles][ytiles] !== 1) || tilesadded.filter((coords) => coords.x === xtiles && coords.y === ytiles).length) {
                    continue;
                }

                for (let i = 0; i < walllengths.length; i++) {
                    if (walllengths[i].x == xtiles && walllengths[i].y == ytiles && walltiles[i].type === 0) {
                        const { x, y, length, direction } = walllengths[i];
                        const spritePiece = this.getWallSpritePiece(0, length);
                        let map = {
                            x: x,
                            y: y,
                            width: length * this.tileSize,
                            height: this.tileSize,
                            direction: direction || 0
                        }
                        let sprite = spritePiece;
                        let type = spritePiece.type;

                        wallSprites[walllengths[i].x] = wallSprites[walllengths[i].x] || {};
                        wallSprites[walllengths[i].x][walllengths[i].y] = new Wall(map, sprite, type);
                        for (let j = 0; j < spritePiece.width; j += 100) {
                            let a, b;
                            if (direction == 0 || direction == 180) {
                                a = x + (j / 100);
                                b = y;
                            } else {
                                a = x;
                                b = y + (j / 100);
                            }
                            for (let k = 0; k < walltiles.length; k++) {
                                if (walltiles[k].x == a && walltiles[k].y === b) {
                                    if (walltiles[k].type === 0)
                                        tilesadded.push({ x: a, y: b });
                                    else
                                        continue yloop;
                                }
                            }
                        }
                        continue yloop;
                    }
                }
                for (let i = 0; i < walltiles.length; i++) {
                    if (walltiles[i].x == xtiles && walltiles[i].y == ytiles) {
                        const { x, y, direction } = walltiles[i];
                        const spritePiece = this.getWallSpritePiece(walltiles[i].type, 1);
                        let map = {
                            x: x,
                            y: y,
                            width: this.tileSize,
                            height: this.tileSize,
                            direction: direction || 0
                        }
                        let sprite = spritePiece;
                        let type = spritePiece.typeidx;
                        wallSprites[walltiles[i].x] = wallSprites[walltiles[i].x] || {};
                        wallSprites[walltiles[i].x][walltiles[i].y] = new Wall(map, sprite, type);
                        tilesadded.push({ x: xtiles, y: ytiles });
                        continue yloop;
                    }
                };
            }
        }
        this.walls = wallSprites;
    }

    getWallLengths(walltiles) {
        let walllengths = [];

        for (let y = 0; y < this.worldHeight; y++) {
            const row = walltiles.filter((tile) => tile.y === y && tile.type === 0 && tile.direction == 0);
            let consecutiveCount = 0;
            for (let i = 0; i < row.length; i++) {
                if (i === 0 || row[i].x === row[i - 1].x + 1) {
                    consecutiveCount++;
                } else if (consecutiveCount) {
                    walllengths.push({ x: row[i - 1].x - consecutiveCount + 1, y: y, length: consecutiveCount, direction: 0 });
                    consecutiveCount = 0;
                } else {
                    walllengths.push({ x: row[i - 1].x, y: y, length: 1, direction: 0 });
                    consecutiveCount = 0;
                }
            }
            if (row && row.length && consecutiveCount) {
                walllengths.push({ x: row[row.length - 1].x - consecutiveCount + 1, y: y, length: consecutiveCount, direction: 0 });
            }
        }

        for (let x = 0; x < this.worldWidth; x++) {
            const col = walltiles.filter((tile) => tile.x === x && tile.type === 0 && tile.direction == 90);
            let consecutiveCount = 0;
            for (let i = 0; i < col.length; i++) {
                if (i === 0 || col[i].y === col[i - 1].y + 1) {
                    consecutiveCount++;
                } else if (consecutiveCount) {
                    walllengths.push({ x: x, y: col[i - 1].y - consecutiveCount + 1, length: consecutiveCount, direction: 90 });
                    consecutiveCount = 0;
                } else {
                    walllengths.push({ x: x, y: col[i - 1].y, length: 1, direction: 90 });
                    consecutiveCount = 0;
                }
            }
            if (col && col.length && consecutiveCount) {
                walllengths.push({ x: x, y: col[col.length - 1].y - consecutiveCount + 1, length: consecutiveCount, direction: 90 });
            }
        }

        this.assignWallSprites(walltiles, walllengths);
    }

    createWallTiles() {
        let walltiles = [];
        let neededType = 0, direction = 0;
        for (let x = 0; x < this.world.len; x++) {
            for (let y = 0; y < this.world[x].length; y++) {
                if (this.world[x][y] === 1) {
                    const connections = this.checkSurrounding(x, y);
                    switch (connections.length) {
                        case 2:
                            neededType = (connections.includes('N') && connections.includes('S')) || (connections.includes('E') && connections.includes('W')) ? 0 : 5;
                            if (neededType == 0)
                                direction = connections.includes('N') ? 90 : 0;
                            else {
                                direction = connections.includes('N') && connections.includes('E') ? 270 :
                                    connections.includes('E') && connections.includes('S') ? 0 :
                                        connections.includes('S') && connections.includes('W') ? 90 :
                                            180;

                            } break;
                        case 1:
                            neededType = 1;
                            direction = connections.includes('E') ? 0 :
                                connections.includes('S') ? 90 :
                                    connections.includes('W') ? 180 :
                                        270;
                            break;
                        case 3:
                            neededType = 4;
                            direction = !connections.includes('N') ? 0 :
                                !connections.includes('E') ? 90 :
                                    !connections.includes('S') ? 180 :
                                        270;
                            break;
                        case 4:
                            neededType = 6;
                            direction = 0;
                            break;
                        default:
                            continue;
                    }
                    walltiles.push({ x: x, y: y, type: neededType, direction: direction });
                }
            }
        }

        this.getWallLengths(walltiles);
    }

    checkSurrounding(x, y, types = [1, 2], checks = ['N', 'W', 'E', 'S']) {
        let connections = [];
        if (checks.includes('W') && this.world[x - 1] && types.includes(this.world[x - 1][y])) {
            connections.push('W');
        }
        if (checks.includes('N') && this.world[x] && types.includes(this.world[x][y - 1])) {
            connections.push('N');
        }
        if (checks.includes('E') && this.world[x + 1] && types.includes(this.world[x + 1][y])) {
            connections.push('E');
        }
        if (checks.includes('S') && this.world[x] && types.includes(this.world[x][y + 1])) {
            connections.push('S');
        }
        return connections;
    }
    assignValue(id, fieldtype, value) {
        switch (fieldtype) {
            case 'checkbox':
            case 'radio':
                const box = document.querySelector(`input[name="${id}"]`);
                box.value = value;
                break;
            default:
                document.getElementById(id).value = value;
        }
    }

    getValue(id, fieldtype) {
        let ret;
        switch (fieldtype) {
            case 'checkbox':
                ret = document.querySelector(`#${id}`).checked;
                break;
            case 'radio':
                const radio = document.querySelector(`input[name="${id}"]:checked`);
                ret = radio.value;
                break;
            case 'number':
                ret = parseInt(document.getElementById(id).value);
                break;
            default:
                ret = document.getElementById(id).value;
        }
        this[id] = ret;
        return ret;
    }

    getValues() {
        const inputs = [
            { id: 'worldWidth', fieldtype: 'number' },
            { id: 'worldHeight', fieldtype: 'number' },
            { id: 'tileSize', fieldtype: 'number' },
            { id: 'includeTreasure', fieldtype: 'checkbox' },
            { id: 'includeObstacles', fieldtype: 'checkbox' },
            { id: 'includeMonsters', fieldtype: 'checkbox' },
            { id: 'freqMonsters', fieldtype: 'number' },
            { id: 'freqTreasure', fieldtype: 'number' },
            { id: 'freqObstacles', fieldtype: 'number' },
            { id: 'roomInterval', fieldtype: 'number' },
            { id: 'minRoom', fieldtype: 'number' },
            { id: 'maxouterdoors', fieldtype: 'number' },
            { id: 'minouterdoors', fieldtype: 'number' },
            { id: 'mapContext', fieldtype: 'radio' }
        ];

        for (const { id, fieldtype } of inputs) {
            this.getValue(id, fieldtype);
        }

        this.maxouterdoors = this.maxouterdoors < this.worldHeight / 2 || this.maxouterdoors < this.worldWidth / 2 ? this.maxouterdoors : Math.min(this.worldHeight, this.worldWidth) / 4;
        this.roomInterval = this.roomInterval < this.worldWidth && this.roomInterval < this.worldHeight ? this.roomInterval : Math.min(this.worldWidth, this.worldHeight);
        this.minRoom = this.minRoom < this.roomInterval - 2 && this.minRoom > 0 ? this.minRoom : this.roomInterval - 2;
        this.extraDoors = Math.random() * (this.roomInterval * 2) || 2;

        const updates = ['roomInterval', 'minRoom', 'maxouterdoors'];
        for (const update of updates) {
            this.assignValue(update, 'number', this[update]);
        }

        this.canvas.width = this.worldWidth * this.tileSize;
        this.canvas.height = this.worldHeight * this.tileSize;
        this.bgcanvas.width = this.worldWidth * this.tileSize;
        this.bgcanvas.height = this.worldHeight * this.tileSize;

    }
    prepWorld() {
        this.world = new World(this.worldWidth, this.worldHeight);


        arrayInstruments();
        if (!this.isBlank)
            this.genDungeon();


    }

    createRooms() {
        let roomX, roomY;
        this.world.dup(1, 0, 0, this.worldWidth, this.worldHeight);
        let seeds = new Array();
        while (true) {
            let free = this.world.biggestFree(0, 0, 0, this.worldWidth, this.worldHeight);
            if (free.biggest < this.roomInterval) {
                break;
            } else {
                roomX = free.x + 1 + rnd(free.biggest - 1 - this.minRoom);
                roomY = free.y + 1 + rnd(free.biggest - 1 - this.minRoom);
                this.world.dup(0, roomX, roomY, this.minRoom, this.minRoom);
                seeds.push(new Room(roomX, roomY, this.minRoom, this.minRoom));
            }
        }

        let rooms = [];

        while (seeds.length > 0) {
            for (let i = 0; i < seeds.length; i++) {
                let dirs = [];
                if (seeds[i].x >= 2 && this.world.freeRect(0, seeds[i].x - 2, seeds[i].y - 1, 1, seeds[i].height + 2)) {
                    dirs.push('left');
                }
                if (seeds[i].x + seeds[i].width < this.worldWidth - 1 &&
                    this.world.freeRect(0, seeds[i].x + seeds[i].width + 1, seeds[i].y - 1, 1, seeds[i].height + 2)) {
                    dirs.push('right');
                }
                if (seeds[i].y >= 2 && this.world.freeRect(0, seeds[i].x - 1, seeds[i].y - 2, seeds[i].width + 2, 1)) {
                    dirs.push('up');
                }
                if (seeds[i].y + seeds[i].height < this.worldHeight - 1 && this.world.freeRect(0, seeds[i].x - 1, seeds[i].y + seeds[i].height + 1, seeds[i].width + 2, 1)) {
                    dirs.push('down');
                }

                if (dirs.length > 0) {
                    dirs.shuffle();
                    if (dirs[0] == 'left') {
                        this.world.dup(0, seeds[i].x - 1, seeds[i].y, 1, seeds[i].height);
                        seeds[i].x--;
                        seeds[i].width++;
                    }
                    if (dirs[0] == 'right') {
                        this.world.dup(0, seeds[i].x + seeds[i].width, seeds[i].y, 1, seeds[i].height);
                        seeds[i].width++;
                    }
                    if (dirs[0] == 'up') {
                        this.world.dup(0, seeds[i].x, seeds[i].y - 1, seeds[i].width, 1);
                        seeds[i].y--;
                        seeds[i].height++;
                    }
                    if (dirs[0] == 'down') {
                        this.world.dup(0, seeds[i].x, seeds[i].y + seeds[i].height, seeds[i].width, 1);
                        seeds[i].height++;
                    }
                } else {
                    seeds[i].delete = "yes";
                    rooms.push(new Room(seeds[i].x, seeds[i].y, seeds[i].width, seeds[i].height));
                }
                seeds = seeds.filter(o => o.delete == "no");
            }
        }
        return rooms;
    }

    genDungeon() {
        this.rooms = this.createRooms();
        let startRoom = this.rooms[0];
        startRoom.parentRoom = startRoom;
        this.connectToOutside();
        this.connectToOtherRooms(this.rooms, startRoom);

        let i = this.extraDoors;
        let limiter = 100;
        while (i > 0 && limiter > 0) {
            if (this.connectToRandom(this.rooms)) {
                i--;
            }
            limiter--;
        }
        let removed = [];
        this.doors.sort((a, b) => (a.tile.x > b.tile.x) ? 1 : (a.tile.x === b.tile.x) ? ((a.tile.y > b.tile.y) ? 1 : -1) : -1);
        for (let xd = 0; xd < this.doors.length; xd++) {
            if (removed.includes(this.doors[xd]))
                continue;
            let adjoiningdoors = this.checkSurrounding(this.doors[xd].tile.x, this.doors[xd].tile.y, [2], ['E', 'S']);
            if (adjoiningdoors.length) {
                let remdoor = this.doors[xd].setDouble(adjoiningdoors);
                removed.push(remdoor);

            }
        }
        let removedind = [];
        for (let door = 0; door < removed.length; door++)
            removedind.push(this.doors.findIndex(i => removed[door].x == i.tile.x && removed[door].y == i.tile.y));

        removedind.sort().reverse();
        for (let i = 0; i < removedind.length; i++)
            this.doors.splice(removedind[i], 1);
        this.placeObjectsInRooms(this.rooms);
        this.createWallTiles();

        this.sprites = [...this.sprites, ...this.doors];
    }
    connectToOutside() {
        let room = new Room(1, 1, this.worldWidth - 2, this.worldHeight - 2);
        this.outerDoors = Math.floor(Math.random() * (this.maxouterdoors - this.minouterdoors) + this.minouterdoors)
        this.makeDoor(room, room, true);
    }
    connectToOtherRooms(rooms, currentRoom) {
        let adjacentRoom = this.connectToAdjacent(rooms, currentRoom);
        if (adjacentRoom) {
            this.connectToOtherRooms(rooms, adjacentRoom);
        } else {
            if (currentRoom.parentRoom == currentRoom) {
                return;
            } else {
                this.connectToOtherRooms(rooms, currentRoom.parentRoom);
            }
        }
    }
    connectToAdjacent(rooms, room) {
        let nonVisitedRooms = rooms.filter(o => o != room && !o.parentRoom);
        for (let i = 0; i < nonVisitedRooms.length; i++) {
            let nonVisitedRoom = nonVisitedRooms[i];
            if (this.makeDoor(room, nonVisitedRoom)) {
                nonVisitedRoom.parentRoom = room;
                return nonVisitedRoom;
            }
        }
    }
    connectToRandom(allRooms) {
        let room = rnd(allRooms.length);
        for (let i = 0; i < allRooms.length; i++) {
            if (this.makeDoor(allRooms[room], allRooms[i])) {
                return true;
            }
        }
        return false;
    }
    checkDoorSuitable(walls) {
        if (!walls.length)
            return false;
        let dirs = this.checkSurrounding(walls[0].x, walls[0].y);

        if (this.world[walls[0].x][walls[0].y] == 2 || dirs.length != 2 || !(['N', 'S'].every(dir => dirs.includes(dir)) || ['W', 'E'].every(dir => dirs.includes(dir)))) {
            walls.shift();
            this.checkDoorSuitable(walls);
        } else {
            return { wall: walls[0], dir: dirs };
        }
    }
    makeDoor(room1, room2, outer = false, doorsheetidx = 0) {
        let walls = this.commonWalls(room1, room2);
        let goodwall = {};
        let found = walls ? this.foundDoors(walls) : 0;
        let wallinfo = {};
        if (!outer && walls && !found) {
            walls.shuffle();
            wallinfo = this.checkDoorSuitable(walls);
            if (wallinfo) {
                goodwall = wallinfo.wall;
                const direction = wallinfo.dir.includes('S') ? 90 : 0;
                let door = new Door(goodwall.x, goodwall.y, direction, this.tileSize, spriteSheets.door[doorsheetidx].spriteInfo);
                this.world[goodwall.x][goodwall.y] = door.getSpriteWorldInd();
                this.doors.push(door);
                return true;
            } else return false;
        } else if (outer && walls && found < this.maxouterdoors) {
            walls.shuffle();
            wallinfo = this.checkDoorSuitable(walls);
            if (wallinfo) {
                goodwall = wallinfo.wall;
                const direction = wallinfo.dir.includes('S') ? 90 : 0;
                let door = new Door(goodwall.x, goodwall.y, direction, this.tileSize, spriteSheets.door[doorsheetidx].spriteInfo);
                this.world[goodwall.x][goodwall.y] = door.getSpriteWorldInd();
                this.doors.push(door);
            }
            if (this.doors.length < this.outerDoors) {
                this.makeDoor(room1, room2, true);
            } else {
                return true;
            }
        } else {
            return false;
        }
    }
    foundDoors(walls) {
        let found = 0;
        for (let wall of walls) {
            if (this.world[wall.x][wall.y] == 2)
                found++;
        }
        return found;
    }
    testClearArea(initialspace, xspacerequired, yspacerequired) {
        let unclearspot = 0;
        for (let j = 0; j < xspacerequired; j++) {
            for (let k = 0; k < yspacerequired; k++) {
                if (this.world[initialspace.x + j] && this.world[initialspace.x + j][initialspace.y + k]) {
                    unclearspot++;
                }
            }
        }
        if (unclearspot) {
            return false;
        } else
            return true;
    }
    placeObjectsInRooms(rooms) {
        const SPRITE_WIDTH = 1;
        const SPRITE_HEIGHT = 1;
        for (let i = 0; i < rooms.length; i++) {
            let room = rooms[i];
            let roomWidth = room.width - 1;
            let roomHeight = room.height - 1;
            let roomSize = roomWidth * roomHeight;

            let obstacleProb = this.includeObstacles ? 0.1 * this.freqObstacles / roomSize : 0;
            let treasureProb = this.includeTreasure ? obstacleProb + (0.1 * this.freqTreasure / roomSize) : 0;
            let monsterProb = this.includeMonsters ? treasureProb + (0.1 * this.freqMonsters / roomSize) : 0;


            for (let j = 0; j < roomSize; j++) {
                let x = room.x + 1 + j % roomWidth;
                let y = room.y + 1 + Math.floor(j / roomWidth);
                let spriteWidth = SPRITE_WIDTH;
                let spriteHeight = SPRITE_HEIGHT;
                let spriteIndex;
                let spriteType = 0;
                let rand = Math.random();
                if (rand < obstacleProb && this.world[x][y] == 0) {
                    const obstaclespriteidx = 0;
                    spriteIndex = Math.floor(Math.random() * (32 - 3) + 3);
                    if (!this.testClearArea({ x: x, y: y }, spriteWidth, spriteHeight))
                        spriteIndex = 0;
                    else if (spriteIndex) {
                        let direction = Math.floor(Math.random() * 360);
                        let tile = {
                            x: x,
                            y: y,
                            width: this.tileSize,
                            height: this.tileSize,
                            direction: direction
                        };
                        let tilesprite = spriteSheets.obstacle[obstaclespriteidx].spriteimages[spriteIndex];
                        const obst = new Sprite(tile, tilesprite);

                        this.sprites.push(obst);
                        spriteType = obst.sprite.spritetype;
                    }
                } else if (rand < treasureProb && this.world[x][y] == 0) {
                    const treasurespriteidx = 0;
                    let randnum = Math.floor(Math.random() * spriteSheets.treasure[treasurespriteidx].numOfSprites);
                    spriteIndex = randnum % 2 ? randnum + 1 : randnum;
                    spriteWidth = 2;
                    spriteHeight = 2;
                    if (!this.testClearArea({ x: x, y: y }, spriteWidth, spriteHeight))
                        spriteIndex = 0;
                    else if (spriteIndex) {
                        let direction = Math.floor(Math.random() * 360);
                        let tile = {
                            x: x,
                            y: y,
                            width: spriteWidth * this.tileSize,
                            height: spriteHeight * this.tileSize,
                            direction: direction
                        };

                        let tilesprite = spriteSheets.treasure[treasurespriteidx].spriteimages[spriteIndex];
                        const treasure = new Sprite(tile, tilesprite);

                        this.sprites.push(treasure);
                        spriteType = treasure.sprite.spritetype;
                    }
                } else if (rand < monsterProb && this.world[x][y] == 0) {
                    let monster = this.getMonster(x, y);
                    spriteHeight = monster.height;
                    spriteWidth = monster.width;
                    spriteIndex = monster.index;
                    let monst = monster.mon;
                    if (!this.testClearArea({ x: x, y: y }, spriteWidth, spriteHeight))
                        spriteIndex = 0;
                    else if (spriteIndex) {
                        const mon = new Sprite(monst.tile, monst.tilesprite);

                        this.sprites.push(mon);
                        spriteType = mon.getSpriteWorldInd();
                    }
                }

                if (spriteIndex)
                    for (let k = 0; k < spriteWidth; k++)
                        for (let l = 0; l < spriteHeight; l++) {
                            this.world[x + k][y + l] = spriteType;
                        }
            }

        }
    }
    getMonster(x, y) {
        let totalmonstersprites = 0;
        for (let i = 0; i < spriteSheets.monster.length; i++) {
            totalmonstersprites += spriteSheets.monster[i].spriteimages.length;
        }
        let spriteIndex = Math.floor(Math.random() * totalmonstersprites);
        let monster;
        let spriteHeight = 1;
        let spriteWidth = 1;
        let spriteOnSheet = 0;
        if (spriteIndex - 1 < spriteSheets.monster[0].spriteimages.length) {
            spriteOnSheet = spriteIndex;
            monster = spriteSheets.monster[0];
        } else if (spriteIndex - 1 < spriteSheets.monster[0].spriteimages.length + spriteSheets.monster[1].spriteimages.length) {
            spriteWidth = 2;
            spriteHeight = 2;
            spriteOnSheet = spriteIndex - spriteSheets.monster[0].spriteimages.length;
            monster = spriteSheets.monster[1];
        } else if (spriteIndex - 1 < spriteSheets.monster[0].spriteimages.length + spriteSheets.monster[1].spriteimages.length + spriteSheets.monster[2].spriteimages.length) {
            spriteWidth = 4;
            spriteHeight = 4;
            spriteOnSheet = spriteIndex - 1 - spriteSheets.monster[0].spriteimages.length - spriteSheets.monster[1].spriteimages.length;
            monster = spriteSheets.monster[2];
        } else {
            spriteIndex = 0;
        }
        let mon;
        if (spriteIndex) {
            let direction = Math.floor(Math.random() * 360);
            let tile = {
                x: x,
                y: y,
                width: this.tileSize * monster.tilesPerSprite,
                height: this.tileSize * monster.tilesPerSprite,
                direction: direction
            };
            let tilesprite = monster.spriteimages[spriteOnSheet];
            mon = { "tile": tile, "tilesprite": tilesprite };
        }
        return { "height": spriteHeight, "width": spriteWidth, "index": spriteIndex, "mon": mon };
    }

    commonWalls(room1, room2) {
        let walls = new Array();
        let per1 = room1.perimeter();
        let per2 = room2.perimeter();
        for (let i = 0; i < per1.length; i++) {
            let common = per2.filter(o => o.x == per1[i].x && o.y == per1[i].y);
            if (common.length > 0) {
                walls.push(common[0]);
            }
        }
        if (walls.length > 0) {
            return walls;
        } else {
            return false;
        }
    }

    createWorld(isBlank = false) {
        this.isBlank = isBlank;
        this.getValues();
        this.prepWorld();
        this.drawWorld();
    }
    drawWorld() {
        this.testworld = [];
        this.background = new Floor(loader.images['background']);
        this.background.draw(this.ctx, this.canvas.width, this.canvas.height);
        this.bgctx.fillStyle = "#00ff00";
        this.bgctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.bgctx.fillStyle = "#000000";
        this.drawWalls();
        this.drawFromLists();
    }
    drawFromLists() {
        Object.keys(this.sprites).forEach(sprt => {
            const sprite = this.sprites[sprt];
            sprite.draw(this.bgctx, this.tileSize);
            this.bgctx.fillRect(sprite.x, sprite.y, sprite.tile.width, sprite.tile.height);
            this.testworld.push(
                mapSprite(sprite.x,
                    sprite.y,
                    sprite.tile.width,
                    sprite.tile.height,
                    sprite.sprite.spritetype,
                    sprt
                )
            );
            sprite.draw(this.ctx, this.tileSize);
        });
    }
    drawWalls() {
        for (const xaxis in this.walls) {
            for (const yaxis in this.walls[xaxis]) {
                if (this.walls[xaxis] && this.walls[xaxis][yaxis]) {
                    const x = parseInt(xaxis);
                    const y = parseInt(yaxis);
                    const wall = this.walls[x][y];
                    wall.draw(this.bgctx, this.tileSize);
                    this.testworld.push(
                        mapSprite(wall.x,
                            wall.y,
                            wall.tile.width,
                            wall.tile.height,
                            "wall",
                            `${x}.${y}`
                        )
                    );
                    wall.draw(this.ctx, this.tileSize);
                }
            }
        }
    }
    selectObject(x = 0, y = 0, tilex = 0, tiley = 0) {
        if (!isSprite(x, y)) return false;
        let test = this.testworld.filter(pxl => (
            pxl.startx <= (x)
            && pxl.endx >= (x)
            && pxl.starty <= (y)
            && pxl.endy >= (y)
        ));

        if (!test.length) return false;
        const type = test[0].type;
        const list = type === "wall" ? "walls" : this.sprites;
        if (list === "walls") return this.walls[tilex][tiley];
        return Object.assign(list[test[0].idx], { 'idx': test[0].idx });
    }
    removeObject(object) {
        if (!object) return;
        let type = object.sprite.spritetype;
        let list = type === 1
            ? this.walls : this.sprites;
        if (list != this.walls)
            this.sprites = list.filter(obj =>
                !(obj.sprite.x == object.sprite.x
                    && obj.sprite.y == object.sprite.y
                    && obj.tile.x == object.tile.x
                    && obj.tile.y == object.tile.y)
            );
        else
            delete this.walls[object.tile.x][object.tile.y];

    }
    updateObject(oldobject, object) {
        this.removeObject(oldobject);
        let type = object.sprite.spritetype;
        let list = type === 1
            ? this.walls : this.sprites;
        if (list != this.walls)
            list.push(object);
        else
            this.walls[object.tile.x][object.tile.y] = object;
        this.drawWorld();
    }
    clicked(mousex, mousey) {
        const x = mousex;
        const y = mousey;
        const tilex = Math.floor(x / this.tileSize);
        const tiley = Math.floor(y / this.tileSize);
        this.selectedObject = this.selectObject(x, y, tilex, tiley);
        this.mapEditor = new MapEditor(
            this.selectedObject,
            this.tileSize,
            this.selectedObject ? this.selectedObject.tile.x : x,
            this.selectedObject ? this.selectedObject.tile.y : y,
            this.selectedObject ? this.selectedObject.sprite.spritetype : 0,
            this.selectedObject && this.selectedObject.idx >= 0 ? this.selectedObject.idx : -1);
    }
    unedit() {
        this.mapEditor.destroy();
        this.selectedObject = this.selectObject(null);
        this.mapEditor.sprite = null;
        this.mapEditor = null;
        showifs('view');
    }

}
class MapEditor {
    constructor(sprite, tileSize, x, y, type, idx) {
        this.sprite = null;
        this.origsprite = null;
        this.highlightcanvas = createCanvas('highlight', ['zoomable', 'editcanvas'], map.canvas.width, map.canvas.height);
        this.canvas = createCanvas('sprite', ['zoomable', 'editcanvas'], map.canvas.width, map.canvas.height);
        this.hlctx = this.highlightcanvas.getContext('2d');
        this.ctx = this.canvas.getContext('2d');
        this.tileSize = tileSize;
        this.startx = x;
        this.starty = y;
        this.type = type;
        this.idx = idx;
        this.setSprite(sprite);
        this.spriteSize = this.sprite ? this.sprite.sprite.tilesPer * this.tileSize : this.tileSize;
        this.init();
    }
    init() {
        let tilecenter = this.sprite.getBlockCenter(this.startx * this.tileSize, this.starty * this.tileSize);
        document.querySelector('.mapfield').appendChild(this.highlightcanvas);
        document.querySelector('.mapfield').appendChild(this.canvas);
        this.renderOverlay();
        this.renderHighlight(tilecenter['centerX'], tilecenter['centerY'], this.spriteSize, this.spriteSize);
        if (this.sprite.sprite.tilesPer) this.setRotation(this.sprite.tile.direction, true);
        this.handleUI();
    }
    showSheets() {
        const appdiv = document.querySelector('#sheets');
        appdiv.innerHTML = '';
        for (const [idx, type] of Object.entries(spriteSheets)) {
            let group = document.createElement('h3');
            group.classList.add('w_100');
            group.innerHTML = idx;
            appdiv.append(group);
            for (const sheet in type) {
                if (type.hasOwnProperty(sheet)) {
                    let opt = document.createElement('button');
                    opt.innerHTML = `${spriteSheets[idx][sheet].name}`;
                    opt.dataset.type = idx;
                    opt.dataset.sheet = sheet;
                    opt.classList.add('sheetbtn')
                    appdiv.append(opt);
                    opt.addEventListener('click', () => {
                        this.showSprites(spriteSheets[idx][sheet].spriteimages);
                        this.selectedSheet = spriteSheets[idx][sheet];
                    });
                }
            }
        }
    }
    drawSprite(sprite) {
        var newCanvas = document.createElement('canvas');
        var context = newCanvas.getContext('2d');
        newCanvas.width = sprite.width;
        newCanvas.height = sprite.height;
        context.drawImage(sprite, 0, 0);
        return newCanvas;
    }
    showSprites(images) {
        document.querySelector('.spritediv').innerHTML = '';
        for (const [idx, img] of Object.entries(images)) {
            let orig_image = img.getCanvas();
            let image = this.drawSprite(orig_image);
            image.addEventListener('click', () => {
                this.sprite.sprite = this.selectedSheet.spriteimages[idx];
                this.type = this.selectedSheet.type;
                this.renderSprite();
            });
            document.querySelector('.spritediv').append(image);
        }
    }
    handleUI() {
        toggleNav('edittile', true);
        document.querySelector('#orig_rotation').innerHTML = this.sprite.tile.direction || 0;
        zoom(1.5, this.startx * this.tileSize, this.starty * this.tileSize, this.tileSize);

        this.showSheets();
        this.selectedSheet = spriteSheets['monster'][0];
        if (this.sprite.sprite.tilesPer) {
            this.selectedSheet = this.sprite.sprite.parent;
        }
        this.showSprites(this.selectedSheet.spriteimages);

        this.checkFlip();
    }
    setSprite(sprite) {
        if (!sprite)
            this.sprite = new Sprite(
                {
                    x: this.startx / this.tileSize,
                    y: this.starty / this.tileSize,
                    width: this.tileSize,
                    height: this.tileSize,
                    direction: 0,
                    mirrorh: 1,
                    mirrorv: 1

                });
        else {
            this.origsprite = sprite.clone();
            this.sprite = sprite.clone();
        }
    }
    renderOverlay() {
        this.hlctx.globalCompositeOperation = 'source-over';
        this.hlctx.fillStyle = 'rgba(0,0,0, 0.5)';
        this.hlctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.hlctx.fill();
    }
    fillcircle(x, y, width, height, opacity, size) {
        this.hlctx.fillStyle = `rgba(255,255,255, ${opacity})`;
        this.hlctx.arc(x, y, (width + this.tileSize) / size, 0, 2 * Math.PI, false);
        this.hlctx.fill();
    }
    renderHighlight(x, y, width, height) {
        this.hlctx.beginPath();
        this.hlctx.globalCompositeOperation = 'destination-out';
        this.fillcircle(x, y, width, height, 1, 3);
        this.hlctx.globalCompositeOperation = 'source-over';
        this.fillcircle(x, y, width, height, 0.15, 3);
        this.fillcircle(x, y, width, height, 0.15, 1.75);
        this.fillcircle(x, y, width, height, 0.15, 1.25);
    }
    reclaimCanvas(ctx = this.hlctx) {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = 'rgba(0,0,0, 0)';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    renderSprite() {
        this.reclaimCanvas(this.ctx);
        this.sprite.draw(this.ctx, this.tileSize, this.sprite.sprite.tilesPer);
    }
    destroy() {
        document.querySelector('.mapfield').removeChild(this.canvas);
        document.querySelector('.mapfield').removeChild(this.highlightcanvas);
    }
    resetRotation(elem) {
        const orig = parseInt(elem.innerHTML);
        this.setRotation(orig, true);
    }
    setRotation(rotation, raw = false) {
        let direction = this.sprite.tile.direction;
        direction = rotation && !raw ? direction + rotation : rotation;
        direction = direction > 360 ? direction - 360 : direction < 0 ? direction + 360 : direction;
        this.sprite.tile.direction = direction;
        document.getElementById('tile_rotation_value').value = this.sprite.tile.direction;
        this.renderSprite();
    }
    checkFlip() {
        if (this.sprite.tile.mirrorh == -1)
            document.querySelector('#flip_sprite_h').classList.add('active');
        else
            document.querySelector('#flip_sprite_h').classList.remove('active');

        if (this.sprite.tile.mirrorv == -1)
            document.querySelector('#flip_sprite_v').classList.add('active');
        else
            document.querySelector('#flip_sprite_v').classList.remove('active');
    }
    flipSprite(mir) {
        if (mir === 'h') {
            this.sprite.tile.mirrorh = -1 * (this.sprite.tile.mirrorh || 1);
        } else {
            this.sprite.tile.mirrorv = -1 * (this.sprite.tile.mirrorv || 1);
        }
        this.checkFlip();
        this.renderSprite();
    }
    nudgeSize(size, amt = 0, dir = "x") {
        const nudgeamt = amt == 1 ? 2 : .2 * this.tileSize;
        const nudgedir = xysizelock ? ['NW', 'SE'] : dir == 'x' ? ['W', 'E'] : ['N', 'S'];
        const width = dir == "x" || xysizelock ? nudgeamt : 0;
        const height = dir == "y" || xysizelock ? nudgeamt : 0;
        switch (size) {
            case 1:
                this.sprite.tile.width += width;
                this.sprite.tile.height += height;
                this.nudgeSprite(nudgedir[0], amt);
                break;
            case -1:
                this.sprite.tile.width -= width;
                this.sprite.tile.height -= height;
                this.nudgeSprite(nudgedir[1], amt);
                break;
            default:
                this.sprite.tile.width = this.tileSize * (this.sprite.sprite.tilesPer || 1);
                this.sprite.tile.height = this.tileSize * (this.sprite.sprite.tilesPer || 1);
                this.nudgeSprite('0');
        }
    }
    nudgeSprite(dir, amt = 2) {
        const nudgeamt = amt == 1 ? 1 : .1 * this.tileSize;
        switch (dir) {
            case 'NW':
                this.sprite.x = this.sprite.x - nudgeamt;
                this.sprite.y = this.sprite.y - nudgeamt;
                break;
            case 'N':
                this.sprite.y = this.sprite.y - nudgeamt;
                break;
            case 'NE':
                this.sprite.x = this.sprite.x + nudgeamt;
                this.sprite.y = this.sprite.y - nudgeamt;
                break;
            case 'W':
                this.sprite.x = this.sprite.x - nudgeamt;
                break;
            case 'E':
                this.sprite.x = this.sprite.x + nudgeamt;
                break;
            case 'SW':
                this.sprite.x = this.sprite.x - nudgeamt;
                this.sprite.y = this.sprite.y + nudgeamt;
                break;
            case 'S':
                this.sprite.y = this.sprite.y + nudgeamt;
                break;
            case 'SE':
                this.sprite.x = this.sprite.x + nudgeamt;
                this.sprite.y = this.sprite.y + nudgeamt;
                break;
            default:
                this.sprite.x = this.sprite.tile.x * this.tileSize;
                this.sprite.y = this.sprite.tile.y * this.tileSize;
        }
        this.renderSprite();
    }
    switchSprite(sprite) {
        this.sprite.sprite = this.sprite.sprite.parent.spriteimages[sprite];
        this.renderSprite();
    }
    removeSprite() {
        this.sprite.sprite = {
            sheet: null,
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            spritesize: 0,
            spritetype: 0,
            tilesPer: 0
        };
        this.renderSprite();

    }
    saveTile() {
        map.updateObject(this.origsprite, this.sprite);
        zoom(0, 0, 0)
        map.unedit();
    }
}
function arrayInstruments() {
    Array.prototype.shuffle = function () {
        let j, temp;
        for (let i = 0; i < this.length; i++) {
            j = rnd(this.length);
            temp = this[i];
            this[i] = this[j];
            this[j] = temp;
        }
        return (this);
    }
    Array.prototype.dup = function (filler, startX, startY, lengthX, lengthY) {
        for (let x = startX; x < startX + lengthX; x++) {
            if (!Array.isArray(this[x])) {
                this[x] = new Array();
            }
            for (let y = startY; y < startY + lengthY; y++) {
                this[x][y] = filler;
            }
        }
    }
    Array.prototype.freeRect = function (filler, startX, startY, lengthX, lengthY) {
        for (let x = startX; x < startX + lengthX; x++) {
            for (let y = startY; y < startY + lengthY; y++) {
                if (this[x][y] == filler) {
                    return false;
                }
            }
        }
        return true;
    }
    Array.prototype.biggestFree = function (filler, startX, startY, lengthX, lengthY) {
        let found = new Array();
        for (biggest = Math.min(lengthX, lengthY); biggest > 0; biggest--) {
            for (let x = startX; x <= startX + lengthX - biggest; x++) {
                for (let y = startY; y <= startY + lengthY - biggest; y++) {
                    if (this.freeRect(filler, x, y, biggest, biggest)) {
                        found.push({
                            x: x,
                            y: y
                        });
                    }
                }
            }
            if (found.length > 0) {
                found.shuffle();
                return {
                    biggest: biggest,
                    x: found[0].x,
                    y: found[0].y
                };
            }
        }
    }
}


function createCanvas(id, classes, width, height) {
    const newCanvas = document.createElement('canvas');
    newCanvas.width = width;
    newCanvas.height = height;
    classes.forEach(cls => newCanvas.classList.add(cls));
    newCanvas.id = id;
    return newCanvas;

}

function isSprite(x, y) {
    let data = map.bgctx.getImageData(x, y, 1, 1).data;
    let r = data[0];
    let g = data[1];
    let b = data[2];
    if (r > 255 || g > 255 || b > 255)
        throw "Invalid color component";
    return !(r === 0 && g === 255 && b === 0);
}

function mapSprite(x, y, width, height, type, idx) {
    let map = {
        startx: x,
        starty: y,
        endx: x + width,
        endy: y + height,
        type: type,
        idx: idx
    };
    return map;
}