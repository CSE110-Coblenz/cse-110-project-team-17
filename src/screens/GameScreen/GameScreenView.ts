import Konva from "konva";
import { Player } from "../../entities/player.ts";
import type { View } from "../../types.ts";
import { STAGE_WIDTH, STAGE_HEIGHT } from "../../constants.ts";

/**
 * GameScreenView - Renders the game UI using Konva
 */
export class GameScreenView implements View {
	private group: Konva.Group;
	private playerSprite: Konva.Image | Konva.Circle | null = null;

	constructor() {
		this.group = new Konva.Group({ visible: false });
	}

	async build(
		mapData: any,
		player: Player,
		loadImage: (src: string) => Promise<HTMLImageElement>
	): Promise<void> {
		const tilesetInfo = mapData.tilesets[0];
		const tileWidth = mapData.tilewidth;
		const tileHeight = mapData.tileheight;
		const tileset = await loadImage("/tiles/main.png");
		const tilesPerRow = Math.floor(tileset.width / tileWidth);

		for (const layer of mapData.layers) {
		if (layer.type !== "tilelayer") continue;
		const mapGroup = new Konva.Group();
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
			mapGroup.add(tile);
			}
		}
		this.group.add(mapGroup);
		}

		this.group.add(player.getCurrentImage());
	}

	show(): void {
		this.group.visible(true);
		this.group.getLayer()?.draw();
	}

	hide(): void {
		this.group.visible(false);
		this.group.getLayer()?.draw();
	}

	getGroup(): Konva.Group {
		return this.group;
	}
}
