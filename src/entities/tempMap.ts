import Konva from "konva";
import type { Maps } from "../types.ts";

export class Map implements Maps {
	private tilePath: string;
	private mapSize: number;
    private mapData: any;
	private loadImage: (src: string) => Promise<HTMLImageElement>;

	constructor(tilePath: string, size: number, mapData: any, loadImage: (src: string) => Promise<HTMLImageElement>) {
		this.tilePath = tilePath;
		this.mapSize = size;
        this.mapData = mapData;
		this.loadImage = loadImage;
	}

	getTilesetPath(): string {
		return this.tilePath;
	}

	getSize(): number {
		return this.mapSize;
	}

	/**
	 * Builds a Konva.Group representing the map layers and tiles
	 */
	async buildMap(mapData: any): Promise<Konva.Group> {
		const mapGroup = new Konva.Group();

		if(!mapData?.tilesets?.length){
			console.warn("No tilesets found in map data");
			return mapGroup;
		}

		const tilesetInfo = mapData.tilesets[0];
		const tileWidth = mapData.tilewidth;
		const tileHeight = mapData.tileheight;

		const tileset = await this.loadImage(this.tilePath);
		const tilesPerRow = Math.floor(tileset.width / tileWidth);

		for(const layer of mapData.layers){
			if(layer.type !== "tilelayer") continue;

			const layerGroup = new Konva.Group({ name: layer.name });
			const tiles = layer.data;
			const mapWidth = layer.width;
			const mapHeight = layer.height;

			for (let y = 0; y < mapHeight; y++) {
				for (let x = 0; x < mapWidth; x++) {
					const tileId = tiles[y * mapWidth + x];
					if (tileId === 0) continue;

					const gid = tileId - tilesetInfo.firstgid;

					const tile = new Konva.Image({
						x: x * tileWidth,
						y: y * tileHeight,
						width: tileWidth,
						height: tileHeight,
						image: tileset,
						crop: {
							x: (gid % tilesPerRow) * tileWidth,
							y: Math.floor(gid / tilesPerRow) * tileHeight,
							width: tileWidth,
							height: tileHeight,
						},
					});
					layerGroup.add(tile);
				}
			}

			mapGroup.add(layerGroup);
		}

		return mapGroup;
	}
}
