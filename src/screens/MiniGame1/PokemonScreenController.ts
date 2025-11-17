import { ScreenController } from "../../types.ts";
import type { ScreenSwitcher } from "../../types.ts";
import { InputManager } from "../../input.ts";
import { STAGE_WIDTH, STAGE_HEIGHT } from "../../constants.ts";
import { Zombie } from "../../entities/zombie.ts";
import { Robot } from "../../entities/robot.ts";
import { PokemonScreenModel } from "./PokemonScreenModel.ts";
import { PokemonScreenView } from "./PokemonScreenView.ts";
import type { Player } from "../../entities/player.ts";


/**
 * CombatScreenController
 *
 * Coordinates the combat gameplay: initializes model + view, processes input,
 * runs the combat game loop, and updates rendering via the ScreenSwitcher.
 */
export class PokemonScreenController extends ScreenController {
	private model: PokemonScreenModel;
	private view: PokemonScreenView;
	private screenSwitcher: ScreenSwitcher;
	private input!: InputManager;

	/* Create model and view, instantiate reference to top-level App class */
	constructor(screenSwitcher: ScreenSwitcher) {
		super();
		this.screenSwitcher = screenSwitcher;
		this.model = new PokemonScreenModel(screenSwitcher.getStageWidth(), screenSwitcher.getStageHeight());
		this.view = new PokemonScreenView(this.screenSwitcher, this.model);
	}

	/**
     * startCombat
     *
     * Called when switching into combat screen. Creates an InputManager,
     * shows the combat view and starts the requestAnimationFrame loop.
     */
	startCombat(): void {
		this.input = new InputManager();
		this.view.show();

		// set running variable to active
		this.model.setRunning(true);

		// start the frame loop
		requestAnimationFrame(this.gameLoop);
	}

	/**  * hide
	 *
	 * Called when switching away from combat screen. Stops the game loop
	 * by setting running to false and hides the combat view.
	 */
	hide(): void {
		this.model.setRunning(false);
		this.view.hide();
	}

	/**
     * gameLoop
     *
     * Runs every frame while combat is active. Reads player input,
     * updates model (movement, attack), then asks the top-level app
     * to redraw the entity layer.
     */
	private gameLoop = (): void => {
		// stop condition: model not running or input not initialized
		if (!this.model.isRunning() || !this.input) {
			return;
		}
		
		// schedule next frame
		requestAnimationFrame(this.gameLoop);
	};

	/* Utility: load tiled map JSON */
	private async loadMap(jsonPath: string): Promise<any> {
		const res = await fetch(jsonPath);
		return await res.json();
	}

	/* Utility: load image into HTMLImageElement */
	private loadImage(src: string): Promise<HTMLImageElement> {
		return new Promise((resolve, reject) => {
		const img = new Image();
		img.src = src;
		img.onload = () => resolve(img);
		img.onerror = () => reject(`Failed to load image: ${src}`);
		});
	}
	
	getView(): PokemonScreenView {
		return this.view;
	}
}
