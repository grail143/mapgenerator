let spritemap, loader, spriteSheets = {};
fetch('sprites/spritemaps.json')
    .then((response) => response.json())
    .then((json) => {
        spritemap = json;
        prepImages();
    });


class ImageLoader {
    constructor(imagePaths) {
        this.images = {};
        this.imagePaths = imagePaths;
    }

    loadImages() {
        const promises = [];
        for (const [name, path] of Object.entries(this.imagePaths)) {
            const promise = new Promise((resolve, reject) => {
                const img = new Image();
                img.src = path;
                img.onload = () => {
                    this.images[name] = img;
                    resolve();
                };
                img.onerror = reject;
            });
            promises.push(promise);
        }
        return Promise.all(promises);
    }

    getImage(name) {
        return this.images[name];
    }
}
class SpriteSheets {
    constructor(sheetInfo, sheetIdx) {
        let sheet = sheetInfo.sheets[sheetIdx];
        this.img = loader.getImage(sheet.filename);
        if (!this.img) {
            throw new Error(`Sprite sheet "${sheetIdx}" not found`);
        }
        this.spriteSize = sheet.spritesize;
        this.settings = sheetInfo.settings;
        this.piecemap = sheet.piecemap;
        this.sheetWidth = this.img.width;
        this.sheetHeight = this.img.height;
        this.spritesPerRow = Math.floor(this.sheetWidth / this.spriteSize);
        this.tilesPerSprite = sheet.maptilearea;
        this.spriteimages = this.createSpriteImages();
    }
    createSpriteImages() {
        const spriteimages = [];
        const spriteCount = this.piecemap.length;
        for (let i = 0; i < spriteCount; i++) {
            spriteimages.push(new SpriteImage(this, i));
        }
        return spriteimages;
    }
    retrieveSprite(idx) {
        return this.spriteimages[idx];
    }
}

class SpriteImage {
    constructor(spritesheet, spriteIndex) {
        const spriteInfo = spritesheet.piecemap[spriteIndex];
        this.spriteWidth = spriteInfo.width || spritesheet.spriteSize;
        this.spriteHeight = spriteInfo.height || spritesheet.spriteSize;
        this.tilesPer = spritesheet.tilesPerSprite || 1;
        this.x = spriteInfo.x;
        this.y = spriteInfo.y;
        this.typeidx = spriteInfo.type;
        this.typename = spritesheet.settings.types[this.typeidx];
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.spriteWidth;
        this.canvas.height = this.spriteHeight;
        this.ctx = this.canvas.getContext('2d');
        this.createSpriteImage(spritesheet);
    }
    createSpriteImage(spritesheet) {
        this.ctx.drawImage(spritesheet.img, this.x, this.y, this.spriteWidth, this.spriteHeight, 0, 0, this.spriteWidth, this.spriteHeight);
    }
    getCanvas() {
        return this.canvas;
    }
}

function prepImages() {
    let objTypes = ["monster", "treasure", "obstacle", "wall", "door", "floor"];
    let imagePaths = {};
    for (const type of objTypes) {
        if (spritemap.spritesheets[type]) {
            let sheets = spritemap.spritesheets[type].sheets;
            for (let i = 0; i < sheets.length; i++) {
                sheet = sheets[i];
                imagePaths[sheet.filename] = sheet.filename;
            }
        }
        else if (type == "floor") {
            imagePaths["background"] = "floor.png";
        }
    }
    loader = new ImageLoader(imagePaths);
    loader.loadImages(objTypes).then(() => {
        for (const type of objTypes) {
            if (spritemap.spritesheets[type]) {
                let sheets = spritemap.spritesheets[type].sheets;
                spriteSheets[type] = [];
                for (let i = 0; i < sheets.length; i++) {
                    spriteSheets[type].push(new SpriteSheets(spritemap.spritesheets[type], i));
                }
            }
        }
    });
}
