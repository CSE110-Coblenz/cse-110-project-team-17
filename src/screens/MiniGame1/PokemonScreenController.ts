import { ScreenController } from "../../types.ts";
import type { ScreenSwitcher } from "../../types.ts";
import { PokemonScreenModel } from "./PokemonScreenModel.ts";
import { PokemonScreenView } from "./PokemonScreenView.ts";
import { STAGE_WIDTH, STAGE_HEIGHT } from "../../constants.ts";
import { audioManager } from "../../audioManager.ts";


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
	private waitForQuestion: boolean = false;

	/* Create model and view, instantiate reference to top-level App class */
	constructor(screenSwitcher: ScreenSwitcher) {
		super();
		this.screenSwitcher = screenSwitcher;
		this.model = new PokemonScreenModel(STAGE_WIDTH, STAGE_HEIGHT);
		this.view = new PokemonScreenView(this.model);
		this.view.setAnswerHandler(this.handleAnswerSelection);
		this.view.setIntroHandler(this.handleIntroClick);
	}

	/**
     * startCombat
     *
     * Called when switching into combat screen. Creates an InputManager,
     * shows the combat view and starts the requestAnimationFrame loop.
     */
	startCombat(): void {
		// Must show the screen to begin with
		this.view.show();
		// Show the intro
		this.view.showIntro();
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
	// private gameLoop = (): void => {
	// 	// stop condition: model not running or input not initialized
	// 	if (!this.model.isRunning() || !this.input) {
	// 		return;
	// 	}
		
	// 	// schedule next frame
	// 	requestAnimationFrame(this.gameLoop);
	// };

	private handleIntroClick = (): void => {
		this.view.hideIntro();
		// set running variable to active
		this.model.resetGame();
		this.waitForQuestion = false;
		this.presentNextQuestion();
		this.view.updateBossHealthText(this.model.getBossHealth());
		this.view.updatePlayerHealthText(this.model.getPlayerHealth());
	};

	private presentNextQuestion(): void {
		const qa = this.model.generateNextQuestion();
		this.view.updateQuestion(qa.question, qa.answers);
	}

	private handleAnswerSelection = (index: number): void => {
		if (this.waitForQuestion) {
			return;
		}
		const isCorrect = this.model.checkAnswer(index);
		this.model.updateCurrentQuestionStatus(isCorrect);
		this.view.playButtonClickAnimation(index, isCorrect);
		const message = isCorrect
			? "Correct!"
			: `Incorrect! Correct answer: ${this.model.getCorrectAnswerText()}`;
		this.view.showFeedbackMessage(message, isCorrect);
		// Update boss health if correct (takes damage)
		if (isCorrect) {
			// TODO: CHANGE DAMAGE FORMULA (THIS IS JUST FOR TESTING)
			const damage = this.model.getPlayer().getMaxAttack();
			this.model.dealDamageToBoss(damage);
			this.view.updateBossHealthText(this.model.getBossHealth());
			this.view.playBossDamageAnimation(damage);
			this.view.playPlayerJumpAnimation();

		} else {
			// Incorrect answer: player takes damage
			const damage = 20; // Fixed damage for incorrect answers
			this.model.dealDamageToPlayer(damage);
			this.view.updatePlayerHealthText(this.model.getPlayerHealth());
			this.view.playPlayerDamageAnimation(damage);
			if (this.model.isPlayerDefeated()) {
				this.view.showLoseMessage();
				audioManager.playSfx("minigame_lose");
				this.waitForQuestion = true;
				setTimeout(() => {
					this.screenSwitcher.switchToScreen({ type: "exploration" });
				}, 2000);
				return; // Don't proceed to next question
			}
		}
		if (this.model.isBossDefeated()) {
			this.view.showVictoryMessage();
			this.waitForQuestion = true;
			setTimeout(() => {
				this.screenSwitcher.switchToScreen({ type: "exploration" });
			}, 2000);
		} else if (this.model.isPlayerDefeated()) {
			// this.view.showDefeatMessage();
			setTimeout(() => {
				this.screenSwitcher.switchToScreen({ type: "exploration" });
			}, 2000);
		}
		this.waitForQuestion = true;
		// Tweak to set delay between questions
		setTimeout(() => {
			if (!this.model.isBossDefeated() && !this.model.isPlayerDefeated()) {
				this.waitForQuestion = false;
				this.presentNextQuestion();
			}
		}, PokemonScreenView.TIME_BETWEEN_QUESTIONS);
	}

	getView(): PokemonScreenView {
		return this.view;
	}
}
