import Konva from "konva";
import type { Maps } from "../types.ts";

/* The Map class makes JSON parsing and map building from a tileset         */
/* completely transparent from the ScreenView classes. Now, individual      */
/* maps can be built in the Controller. The purpose of this is to separate  */
/* the Map layer, so it isn't accidentally drawn repeatedly in the gameLoop */
/* it also makes the ScreenView class more readable/scalable.				*/
export class Mapp implements Maps {
	private tileSize: number;
    private mapData: any;
	private loadImage: (src: string) => Promise<HTMLImageElement>;
    private collisionData: number[];
    private width: number;
    private height: number;

    private tilesets: {
        firstgid: number;
        image: HTMLImageElement;
        tilesPerRow: number;
        tileWidth: number,
        tileHeight: number,
        name: string
    }[] = [];

	constructor(tileSize: number, mapData: any, loadImage: (src: string) => Promise<HTMLImageElement>) {
        this.mapData = mapData;
        this.tileSize = tileSize;
		this.loadImage = loadImage;
		this.height = mapData.height;
		this.width = mapData.width;

		const objectLayer = mapData.layers[1];
		this.collisionData = objectLayer.data;
	}

	getTileSize(): number {
		return this.tileSize;
	}

	getMapData(): any {
		return this.mapData;
	}

	getWidth(){
		return this.width;
	}

	getHeight(){
		return this.height;
	}

    /* Store each tilesheet's data so it can be used to render map */
    /*  --> data stored in this.tilesets[j]                        */
    async loadTilesets() {
        this.tilesets = [];

        /* iterate through tilesets given in map's json file */
        for(const ts of this.mapData.tilesets){
            const response = await fetch(ts.source);
            const tsJson = await response.json();

            /* use the path hardcoded in the json to load image from '/public/tiles/*' */
            const image = await this.loadImage(tsJson.source);

            /* append tileset data to the end of this.tilesets array*/
            this.tilesets.push({
                firstgid: ts.firstgid,
                image,
                tileWidth: tsJson.tileWidth,
                tileHeight: tsJson.tileHeight,
                tilesPerRow: tsJson.columns,
                name: tsJson.name
            });
        }
    }

    /* identify which spriteSheet to use given gid */
    private getTilesetForGid(gid: number) {
        let found = null;

        /* once gid is less than a spritesheets first tileID, break loop  */
        for(const tileset of this.tilesets){
            if(gid >= tileset.firstgid){
                found = tileset;
            } else break;
        }
        return found;
    }

    // in src/entities/tempMap.ts
    buildCollisionOverlay(): Konva.Group {
        const g = new Konva.Group({ name: "collisionOverlay", listening: false });
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.isBlocked(x, y)) {
                    g.add(new Konva.Rect({
                    x: x * this.tileSize,
                    y: y * this.tileSize,
                    width: this.tileSize,
                    height: this.tileSize,
                    fill: "rgba(255,0,0,0.25)",
                    stroke: "red",
                    strokeWidth: 0.5,
                    listening: false,
                    }));
                }
            }
        }
        return g;
    }


    async buildMap(): Promise<Konva.Group> {
        const mapGroup = new Konva.Group();

        /* return if this.tilesets hasn't been initialized yet */
        if(this.tilesets.length === 0){
            console.log("Tilesets not loaded — call loadTilesets() first");
            return mapGroup;
        }

        /* iterate through the two layers defined in the map's json */
        for(const layer of this.mapData.layers){
            if(layer.type !== "tilelayer") continue;

            const layerGroup = new Konva.Group({ name: layer.name });

            /* 1D array representing all 16x16 tiles */
            const tiles = layer.data;

            /* map width in TILES */
            const mapWidth = layer.width;

            /* map height in TILES */
            const mapHeight = layer.height;

            /* iterate through every tile in the map's data array */
            for(let y = 0; y < mapHeight; y++){
                for(let x = 0; x < mapWidth; x++){
                    /* retrieve int stored at a specific tile */
                    const tileId = tiles[y * mapWidth + x];
                    if(tileId === 0) continue;

                    /* determine what tileset was used for this tile */
                    const ts = this.getTilesetForGid(tileId);
                    if(!ts) continue;

                    /* use the tilesets metadata from this.tilesets[] */
                    const tileWidth = ts.tileWidth;
                    const tileHeight = ts.tileHeight;

                    /* compute what tile (from the tilesheet) was placed at this tile */
                    const localId = tileId - ts.firstgid;

                    /* decide where in the tileset to retrieve 16x16 sprite */
                    const cropX = (localId % ts.tilesPerRow) * tileWidth;
                    const cropY = Math.floor(localId / ts.tilesPerRow) * tileHeight;

                    /* place corresponding tile at the correct position on screen */
                    const tile = new Konva.Image({
                        x: x * tileWidth,
                        y: y * tileHeight,
                        width: tileWidth,
                        height: tileHeight,
                        image: ts.image,
                        crop: {
                            x: cropX,
                            y: cropY,
                            width: tileWidth,
                            height: tileHeight
                        }
                    });
                    /* add all tiles from this layer to layerGroup */
                    layerGroup.add(tile);
                }
            }
            /* add each layerGroup (including all tiles from that layer) to mapGroup */
            mapGroup.add(layerGroup);
        }
        /* return mapGroup to be used in the Screen View so the map can be visible */
        return mapGroup;
    }

    /* given pixel coordinates, compute the corresponding tile */
	getTileAtPixel(x: number, y: number) {
		const tileX = Math.floor(x / this.tileSize);
		const tileY = Math.floor(y / this.tileSize);

		return { tileX, tileY };
	}

    /* verify that the tile has no obstacle on it */
	isBlocked(tileX: number, tileY: number): boolean {
		const index = tileY * this.width + tileX;
		return this.collisionData[index] !== 0;
	}

    /* returns true if the player/robot is allowed to move to the pixel coordinates given */
	canMoveToPixel(x: number, y: number): boolean {
		const { tileX, tileY } = this.getTileAtPixel(x, y);
		return !this.isBlocked(tileX, tileY);
	}

    /* provide: position of sprite (x, y), and size of sprite (w*h) */
    /* receive: boolean telling you if you can move to (x,y)        */
    canMoveToArea(x: number, y: number, w: number, h: number): boolean {
        const tileSize = this.tileSize;

        /* using pixel coordinates, obtain four tiles that sprite overlaps with */
        const leftTile = Math.floor(x / tileSize);
        const rightTile = Math.floor((x + w) / tileSize);
        const topTile = Math.floor(y / tileSize);
        const bottomTile = Math.floor((y + h) / tileSize);

        /* check if any of the tiles contain an object */
        for(let ty = topTile; ty <= bottomTile; ty++){
            for(let tx = leftTile; tx <= rightTile; tx++){
                if(this.isBlocked(tx, ty)){
                    return false;
                }
            }
        }
        return true;
    }
}
