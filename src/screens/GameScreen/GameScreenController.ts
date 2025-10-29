import { ScreenController } from "../../types.ts";
import { GameScreenModel } from "./GameScreenModel.ts";
import { GameScreenView } from "./GameScreenView.ts";
import { InputManager } from "../../input.ts";
import { STAGE_WIDTH, STAGE_HEIGHT } from "../../constants.ts";
import { Player } from "../../entities/player.ts";
import type { ScreenSwitcher } from "../../types.ts";

/**
 * The game renders slowly because we are re-drawing the layer every frame (60 fps)
 * 
 * Since the layer contains multiple screens, all screens are re-drawn every frame
 * even if they are not visible. This makes the game move/feel very slow.
 * 
 * Potential Solution: new PlayerLayer, so we can redraw that layer ONLY.
 */
export class GameScreenController extends ScreenController {
	private model: GameScreenModel;
	private view: GameScreenView;
	private screenSwitcher: ScreenSwitcher;
	private input!: InputManager;
	private player!: Player;
	private running: boolean;

	constructor(screenSwitcher: ScreenSwitcher) {
		super();
		this.screenSwitcher = screenSwitcher;
		this.model = new GameScreenModel();
		this.view = new GameScreenView();
		this.running = false;
	}

	async init(): Promise<void> {
		const mapData = await this.loadMap("/porj0.json");
		const playerImage = await this.loadImage("/lemon.png");
		this.player = new Player("player", STAGE_WIDTH / 2, STAGE_HEIGHT / 2, playerImage);
		await this.view.build(mapData, this.player, this.loadImage.bind(this));
	}

	getView(): GameScreenView {
		return this.view;
	}

	startGame(): void {
		this.running = true;
		this.input = new InputManager();
		this.view.show();
		requestAnimationFrame(this.gameLoop);
	}

	hide(): void {
		this.running = false;
		this.view.hide();
	}

	private gameLoop = (): void => {
		if(!this.running) return;

		const { dx, dy } = this.input.getDirection();
		this.player.move(dx, dy);
		this.screenSwitcher.redraw();
		
		requestAnimationFrame(this.gameLoop);
	};

	private async loadMap(jsonPath: string): Promise<any> {
		const res = await fetch(jsonPath);
		return await res.json();
	}

	private loadImage(src: string): Promise<HTMLImageElement> {
		return new Promise((resolve, reject) => {
		const img = new Image();
		img.src = src;
		img.onload = () => resolve(img);
		img.onerror = () => reject(`Failed to load image: ${src}`);
		});
	}
}
