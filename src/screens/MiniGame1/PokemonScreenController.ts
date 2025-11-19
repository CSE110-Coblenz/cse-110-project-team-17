import { ScreenController } from "../../types.ts";
import type { ScreenSwitcher } from "../../types.ts";
import { InputManager } from "../../input.ts";
import { PokemonScreenModel } from "./PokemonScreenModel.ts";
import { PokemonScreenView } from "./PokemonScreenView.ts";


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
		this.view.setAnswerHandler(this.handleAnswerSelection);
	}

	/**
     * startCombat
     *
     * Called when switching into combat screen. Creates an InputManager,
     * shows the combat view and starts the requestAnimationFrame loop.
     */
	startCombat(): void {
		this.input = new InputManager();
		this.presentNextQuestion();
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

	private presentNextQuestion(): void {
		const qa = this.model.generateNextQuestion();
		this.view.updateQuestion(qa.question, qa.answers);
	}

	private handleAnswerSelection = (index: number): void => {
		this.view.playButtonClickAnimation(index);
		const isCorrect = this.model.checkAnswer(index);
		const message = isCorrect
			? "Correct!"
			: `Incorrect! Correct answer: ${this.model.getCorrectAnswerText()}`;
		this.view.showFeedbackMessage(message, isCorrect);
		// Update boss health if correct (takes damage)
		if (isCorrect) {
			const damage = this.model.getPlayer().getMaxAttack();
			this.model.dealDamageToBoss(damage);
			this.view.updateBossHealthText(this.model.getBossHealth());
			if (this.model.isBossDefeated()) {
				this.view.showVictoryMessage();
				setTimeout(() => {
					this.model.resetBoss();
					this.presentNextQuestion();
					this.view.updateBossHealthText(this.model.getBossHealth());
				}, 2000);
			}
		}
		// Tweak to set delay between questions
		setTimeout(() => {
			if (!this.model.isBossDefeated()) {
				this.presentNextQuestion();
			}
		}, 1200);
	}

	getView(): PokemonScreenView {
		return this.view;
	}
}
