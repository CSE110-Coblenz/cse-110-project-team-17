import { ScreenController } from "../../types.ts";
import type { ScreenSwitcher } from "../../types.ts";
import { GameScreenModel } from "./GameScreenModel.ts";
import { GameScreenView } from "./GameScreenView.ts";
import { GAME_DURATION } from "../../constants.ts";

/**
 * GameScreenController - Coordinates game logic between Model and View
 */
export class GameScreenController extends ScreenController {
	private model: GameScreenModel;
	private view: GameScreenView;
	private screenSwitcher: ScreenSwitcher;
	private gameTimer: number | null = null;

	private squeezeSound: HTMLAudioElement;

	constructor(screenSwitcher: ScreenSwitcher) {
		super();
		this.screenSwitcher = screenSwitcher;

		this.model = new GameScreenModel();
		this.view = new GameScreenView();

		this.squeezeSound = new Audio("/squeeze.mp3"); // Placeholder
	}

	/**
	 * Start the game
	 */
	startGame(): void {
		// Reset model state
		this.model.reset();
		this.view.show();
	}

	/**
	 * Stop the timer
	 */
	private stopTimer(): void {
		if (this.gameTimer !== null) {
			clearInterval(this.gameTimer);
		}
	}

	/**
	 * Get final score
	 */
	getFinalScore(): number {
		return this.model.getScore();
	}

	/**
	 * Get the view group
	 */
	getView(): GameScreenView {
		return this.view;
	}
}
