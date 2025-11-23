import Konva from "konva";
import { MapView } from "../MapScreen/MapView.ts";
import  { PokemonScreenModel } from "./PokemonScreenModel.ts";
import { Rect } from "konva/lib/shapes/Rect";
import type { ScreenSwitcher } from "../../types.ts";
import type { Group } from "konva/lib/Group";

/**
 * CombatScreenView
 *
 * Renders the combat screen: builds tiled map layers and maintains an entity
 * group containing Robot and Zombie images. The view exposes groups so the
 * top-level App can add them to the main entity layer.
 */
export class PokemonScreenView extends MapView {
	private bgGroup: Konva.Group;
	private textBoxGroup: Konva.Group;
	private screenGroup: Konva.Group;
	private playerGroup: Konva.Group;
	private bossGroup: Konva.Group;
	private introGroup: Konva.Group;
	private model: PokemonScreenModel;

	private answerButton: Konva.Rect[];
	private answerLabels: Konva.Text[];
	private questionText: Konva.Text;
	private feedbackText: Konva.Text;
	private bossHealthText: Konva.Text;
	private playerHealthText: Konva.Text;
	private victoryText: Konva.Text;
	private loseText: Konva.Text;
	private bossName: Konva.Text;
	private playerName: Konva.Text;
	private onAnswerSelected?: (index: number) => void;
	private onIntroClick?: () => void;

	static readonly TIME_BETWEEN_QUESTIONS = 2000; // 2 seconds

	constructor(screenSwitcher: ScreenSwitcher, model: PokemonScreenModel) {
		super(model);
		this.bgGroup = new Konva.Group({ visible: false });
		this.bgGroup.moveToBottom();
		this.textBoxGroup = new Konva.Group({ visible: false });
		this.playerGroup = new Konva.Group({ visible: false });
		this.bossGroup = new Konva.Group({ visible: false });
		this.introGroup = new Konva.Group({ visible: false });
		this.screenGroup = new Konva.Group({ visible: false });
		this.screenGroup.add(this.bgGroup);
		this.screenGroup.add(this.playerGroup);
		this.screenGroup.add(this.bossGroup);
		this.screenGroup.add(this.textBoxGroup);

		this.model = model;
		
		this.model.getPlayer().getCurrentImage().scale({x:5, y:5});
		this.playerGroup.add(this.model.getPlayer().getCurrentImage());
		this.model.getBoss().getCurrentImage().scale({x:10, y:10});
		this.bossGroup.add(this.model.getBoss().getCurrentImage());
		this.model.getPlayer().moveTo(-screenSwitcher.getStageWidth()/4 - 50, 0);
		this.model.getBoss().moveTo(800, 100);

		// Load the background
		const img = new Image();
		img.src = '/pokenotext.png';
		img.onload = () => {
			const konvaImage = new Konva.Image({
				image: img,
				x: 0,
				y: 0,
				scaleX: screenSwitcher.getStageWidth() / img.width,
				scaleY: screenSwitcher.getStageHeight() / img.height,
			});

			this.bgGroup.add(konvaImage);
		};

		// Set the pokemon background with text
		// This is what the user will interact with
		const textBox = new Rect({
			x: 50,
			y: screenSwitcher.getStageHeight() - 220,
			width: screenSwitcher.getStageWidth() - 100,
			height: 200,
			fill: 'white',
			stroke: 'black',
			strokeWidth: 4,
			radius: 30,
			cornerRadius: 30,
		});
		this.textBoxGroup.add(textBox);

		// Create question and feedback text elements
		this.questionText = new Konva.Text({
			x: textBox.x(),
			y: textBox.y(),
			width: textBox.width() / 2 - 40,
			height: textBox.height(),
			fontSize: 24,
			lineHeight: 1.3,
			fontFamily: 'Arial',
			fill: '#1b1b1b',
			align: 'center',
			verticalAlign: 'middle',
			wrap: 'word',
			listening: false,
		});
		// Feedback text for correct/incorrect answers
		this.feedbackText = new Konva.Text({
			x: textBox.x() + 20,
			y: textBox.y() + textBox.height() - 50,
			width: textBox.width() / 2 - 80,
			fontSize: 20,
			fontFamily: 'Arial',
			fill: '#1b1b1b',
			text: '',
			wrap: 'word',
			visible: false
		});
		this.textBoxGroup.add(this.questionText);
		this.textBoxGroup.add(this.feedbackText);

		// Boss health text in top left
		this.bossHealthText = new Konva.Text({
			x: 250,
			y: 70,
			fontSize: 25,
			fontFamily: 'Arial',
			fill: 'red',
			text: `${this.model.getBossHealth()}/200`
		});
		this.bossName = new Konva.Text({
			x: 80,
			y: 60,
			fontSize: 40,
			fontFamily: 'Arial',
			fill: 'black',
			text: 'Coblenz:'
		});
		this.screenGroup.add(this.bossHealthText);
		this.screenGroup.add(this.bossName);

		this.playerName = new Konva.Text({
			x: 70,
			y: 400,
			fontSize: 40,
			fontFamily: 'Arial',
			fill: 'black',
			text: 'Player:'
		});
				// Player health text
		this.playerHealthText = new Konva.Text({
			x: 70,
			y: this.playerName.y() + 50,
			fontSize: 25,
			fontFamily: 'Arial',
			fill: 'blue',
			text: `${this.model.getPlayerHealth()}/${PokemonScreenModel.PLAYER_MAX_HEALTH}`
		});
		this.screenGroup.add(this.playerHealthText);
		this.screenGroup.add(this.playerName);

		// Victory message
		this.victoryText = new Konva.Text({
			x: screenSwitcher.getStageWidth() / 2,
			y: screenSwitcher.getStageHeight() / 2,
			fontSize: 48,
			fontFamily: 'Impact',
			fill: 'violet',
			text: 'Victory! Boss Defeated!',
			align: 'center',
			visible: false
		});
		this.victoryText.offsetX(this.victoryText.width() / 2);
		this.victoryText.offsetY(this.victoryText.height() / 2);
		this.screenGroup.add(this.victoryText);

		// Lose message
		this.loseText = new Konva.Text({
			x: screenSwitcher.getStageWidth() / 2,
			y: screenSwitcher.getStageHeight() / 2,
			fontSize: 48,
			fontFamily: 'Impact',
			fill: 'red',
			text: 'Defeated! Try Again!',
			align: 'center',
			visible: false
		});
		this.loseText.offsetX(this.loseText.width() / 2);
		this.loseText.offsetY(this.loseText.height() / 2);
		this.screenGroup.add(this.loseText);

		// Create the answer buttons
		this.answerButton = [new Rect({
			id: 'answer1',
			x: 600,
			y: screenSwitcher.getStageHeight() - 190,
			width: 300,
			height: 70,
			fill: 'lightblue',
			stroke: 'black',
			strokeWidth: 2,
			cornerRadius: 10,
		}),
		new Rect({
			id: 'answer2',
			x: 900,
			y: screenSwitcher.getStageHeight() - 120,
			width: 300,
			height: 70,
			fill: 'lightblue',
			stroke: 'black',
			strokeWidth: 2,
			cornerRadius: 10,
		}),
		new Rect({
			id: 'answer3',
			x: 900,
			y: screenSwitcher.getStageHeight() - 190,
			width: 300,
			height: 70,
			fill: 'lightblue',
			stroke: 'black',
			strokeWidth: 2,
			cornerRadius: 10,
		}),
		new Rect({
			id: 'answer4',
			x: 600,
			y: screenSwitcher.getStageHeight() - 120,
			width: 300,
			height: 70,
			fill: 'lightblue',
			stroke: 'black',
			strokeWidth: 2,
			cornerRadius: 10,
		})];

		// Labels for answer buttons
		this.answerLabels = this.answerButton.map((button) => {
			const label = new Konva.Text({
				text: '',
				fontSize: 20,
				fontFamily: 'Arial',
				fill: '#111',
				width: button.width(),
				listening: false,
				align: 'center',
				verticalAlign: 'middle',
				wrap: 'word'
			});
			return label;
		});
		// Load the first question
		const qa = this.model.generateNextQuestion();
		this.updateQuestion(qa.question, qa.answers);

		this.answerButton.forEach((button, index) => {
			button.on('click', () => {
				if (this.onAnswerSelected) {
					this.onAnswerSelected(index);
				}
			});
			this.textBoxGroup.add(button);
			const label = this.answerLabels[index];
			label.position({
				x: button.x(),
				y: button.y()
			});
			label.height(button.height());
			this.textBoxGroup.add(label);
		});


		// Intro screen elements
		const introBg = new Konva.Rect({
			x: 0,
			y: 0,
			width: screenSwitcher.getStageWidth(),
			height: screenSwitcher.getStageHeight(),
			fill: 'white'
		});
		const titleText = new Konva.Text({
			x: screenSwitcher.getStageWidth() / 2,
			y: screenSwitcher.getStageHeight() / 4,
			fontSize: 48,
			fontFamily: 'Impact',
			fill: 'gold',
			text: 'Pokemon Boss Battle!',
			align: 'center'
		});
		titleText.offsetX(titleText.width() / 2);

		const instructionsText = new Konva.Text({
			x: screenSwitcher.getStageWidth() / 2,
			y: screenSwitcher.getStageHeight() / 2 - 50,
			fontSize: 24,
			fontFamily: 'Arial',
			fill: 'black',
			text: 'Answer questions correctly to damage the boss!\nWrong answers will hurt you.\nChoose the right answer by clicking the buttons.',
			align: 'center',
			lineHeight: 1.5
		});
		instructionsText.offsetX(instructionsText.width() / 2);

		const promptText = new Konva.Text({
			x: screenSwitcher.getStageWidth() / 2,
			y: screenSwitcher.getStageHeight() * 3 / 4,
			fontSize: 28,
			fontFamily: 'Arial',
			fill: 'black',
			text: 'Click the screen to continue',
			align: 'center'
		});
		promptText.offsetX(promptText.width() / 2);

		this.introGroup.add(introBg);
		this.introGroup.add(titleText);
		this.introGroup.add(instructionsText);
		this.introGroup.add(promptText);		// Add click listener to intro group
		this.introGroup.on('click', () => {
			if (this.onIntroClick) {
				this.onIntroClick();
			}
		});
	}

	showAttackAnimation(): void {
		// Implementation for showing attack animation
		
	}

	handleEvent(_event: any): void {
		// Implementation for handling events
	}

	generateTextBox(): void {
		// Implementation for generating text box
	}

	/* Expose the groups so the App can mix them into the stage layers. */
	getGroup(): Konva.Group {
		return this.screenGroup;
	}

	getMapGroup(): Group {
		return this.bgGroup;
	}

	getTextGroup(): Konva.Group {
		return this.textBoxGroup;
	}

	/**
	 * Gets all the entities
	 * @returns Group of entities in game
	 */
	getEntityGroup(): Konva.Group {
		return this.playerGroup;
	}

	show(): void {
		this.screenGroup.visible(true);
		this.textBoxGroup.visible(true);
		this.playerGroup.visible(true);
		this.bossGroup.visible(true);
		this.bgGroup.visible(true);
		this.introGroup.visible(true);
		// this.bgGroup.getLayer()?.draw();
	}

	hide(): void {
		this.screenGroup.visible(false);
		this.textBoxGroup.visible(false);
		this.playerGroup.visible(false);
		this.bossGroup.visible(false);
		this.bgGroup.visible(false);
		this.introGroup.visible(false);
		// this.bgGroup.getLayer()?.draw();
	}

	showIntro(): void {
		this.screenGroup.visible(true);
		this.screenGroup.add(this.introGroup);
		this.introGroup.moveToTop();
	}

	hideIntro(): void {
		this.introGroup.remove();
	}

	// Used in the screen controller to set answer handler
	setAnswerHandler(handler: (index: number) => void): void {
		this.onAnswerSelected = handler;
	}

	// Used in the screen controller to set intro click handler
	setIntroHandler(handler: () => void): void {
		this.onIntroClick = handler;
	}

	// Update question and answers
	updateQuestion(question: string, answers: string[]): void {
		this.questionText.text(question);
		answers.forEach((answer, index) => {
			if (!this.answerLabels[index] || !this.answerButton[index]) {
				return;
			}
			this.answerLabels[index].text(answer);
			this.positionAnswerLabel(index);
		});
		this.clearFeedbackMessage();
		this.hideVictoryMessage();
		this.hideLoseMessage();
		this.textBoxGroup.getLayer()?.batchDraw();
	}

	showFeedbackMessage(message: string, isCorrect: boolean): void {
		this.feedbackText.text(message);
		this.feedbackText.fill(isCorrect ? '#1b5e20' : '#b71c1c');
		this.feedbackText.visible(true);
		this.textBoxGroup.getLayer()?.batchDraw();
	}

	// Clear feedback message
	clearFeedbackMessage(): void {
		this.feedbackText.text('');
		this.feedbackText.visible(false);
		this.textBoxGroup.getLayer()?.batchDraw();
	}

	updateBossHealthText(health: number): void {
		this.bossHealthText.text(`${health}/${PokemonScreenModel.BOSS_MAX_HEALTH}`);
		this.screenGroup.getLayer()?.batchDraw();
	}

	updatePlayerHealthText(health: number): void {
		this.playerHealthText.text(`${health}/${PokemonScreenModel.PLAYER_MAX_HEALTH}`);
		this.screenGroup.getLayer()?.batchDraw();
	}

	showVictoryMessage(): void {
		this.victoryText.visible(true);
		this.screenGroup.getLayer()?.batchDraw();
	}

	hideVictoryMessage(): void {
		this.victoryText.visible(false);
		this.screenGroup.getLayer()?.batchDraw();
	}

	showLoseMessage(): void {
		this.loseText.visible(true);
		this.screenGroup.getLayer()?.batchDraw();
	}

	hideLoseMessage(): void {
		this.loseText.visible(false);
		this.screenGroup.getLayer()?.batchDraw();
	}

	// Animate button click
	playButtonClickAnimation(index: number, isCorrect: boolean): void {
		const button = this.answerButton[index];
		if (!button) return;
		const originalFill = button.fill();
		button.fill(isCorrect ? 'green' : 'red');
		button.getLayer()?.batchDraw();
		setTimeout(() => {
			button.fill(originalFill);
			button.getLayer()?.batchDraw();
		}, PokemonScreenView.TIME_BETWEEN_QUESTIONS);
	}

	playBossDamageAnimation(damage: number): void {
		const bossImage = this.model.getBoss().getCurrentImage();
		
		// Create red overlay
		const overlay = new Konva.Rect({
			x: bossImage.x(),
			y: bossImage.y(),
			width: bossImage.width() * bossImage.scaleX(),
			height: bossImage.height() * bossImage.scaleY(),
			fill: 'red',
			opacity: 0.5
		});
		this.bossGroup.add(overlay);
		
		// Create damage text indicator
		const damageText = new Konva.Text({
			x: bossImage.x() + bossImage.width() * bossImage.scaleX() / 2,
			y: bossImage.y() - bossImage.height() / 2 - 20,
			text: `-${damage}`,
			fontSize: 24,
			fontFamily: 'Arial',
			fill: 'red',
			align: 'center'
		});
		damageText.offsetX(damageText.width() / 2);
		this.screenGroup.add(damageText);
		
		// Wiggle animation using Konva.Animation with oscillation
		let startTime = Date.now();
		const anim = new Konva.Animation(() => {
			const elapsed = (Date.now() - startTime) / 1000; // seconds
			const amplitude = 15; // wiggle distance
			const frequency = 8; // oscillations per second
			const offset = Math.sin(elapsed * frequency * 2 * Math.PI) * amplitude;
			this.bossGroup.x(offset);
		}, this.bossGroup.getLayer());
		
		anim.start();
		
		// Stop animation and remove overlay and text after TIME_BETWEEN_QUESTIONS
		setTimeout(() => {
			anim.stop();
			this.bossGroup.x(0); // reset position
			overlay.destroy();
			damageText.destroy();
			this.bossGroup.getLayer()?.batchDraw();
		}, PokemonScreenView.TIME_BETWEEN_QUESTIONS);
	}

	playPlayerJumpAnimation(): void {
		// Jump animation: move up and down quickly
		let startTime = Date.now();
		const anim = new Konva.Animation(() => {
			const elapsed = (Date.now() - startTime) / 1000; // seconds
			const jumpHeight = 30; // jump distance
			const duration = 0.2; // total jump duration in seconds
			const t = Math.min(elapsed / duration, 1); // normalized time 0-1
			// Simple parabolic jump: up then down
			const yOffset = -jumpHeight * 4 * t * (1 - t); // parabolic curve
			this.playerGroup.y(yOffset);
		}, this.playerGroup.getLayer());
		
		anim.start();
		
		// Stop animation after jump duration
		setTimeout(() => {
			anim.stop();
			this.playerGroup.y(0); // reset position
			this.playerGroup.getLayer()?.batchDraw();
		}, 500); // 0.5 seconds
	}

	playPlayerDamageAnimation(damage: number): void {
		const playerImage = this.model.getPlayer().getCurrentImage();
		
		// Create red overlay
		const overlay = new Konva.Rect({
			x: playerImage.x(),
			y: playerImage.y(),
			width: playerImage.width() * playerImage.scaleX(),
			height: playerImage.height() * playerImage.scaleY(),
			fill: 'red',
			opacity: 0.5
		});
		this.playerGroup.add(overlay);
		
		// Create damage text indicator
		const damageText = new Konva.Text({
			x: playerImage.x() + playerImage.width() * playerImage.scaleX() / 2,
			y: playerImage.y() - 20,
			text: `-${damage}`,
			fontSize: 24,
			fontFamily: 'Arial',
			fill: 'red',
			align: 'center'
		});
		damageText.offsetX(damageText.width() / 2);
		this.screenGroup.add(damageText);
		
		// Shake animation using Konva.Animation with oscillation
		let startTime = Date.now();
		const anim = new Konva.Animation(() => {
			const elapsed = (Date.now() - startTime) / 1000; // seconds
			const amplitude = 10; // shake distance
			const frequency = 10; // oscillations per second
			const offset = Math.sin(elapsed * frequency * 2 * Math.PI) * amplitude;
			this.playerGroup.x(offset);
		}, this.playerGroup.getLayer());
		
		anim.start();
		
		// Stop animation and remove overlay and text after TIME_BETWEEN_QUESTIONS
		setTimeout(() => {
			anim.stop();
			this.playerGroup.x(0); // reset position
			overlay.destroy();
			damageText.destroy();
			this.playerGroup.getLayer()?.batchDraw();
		}, PokemonScreenView.TIME_BETWEEN_QUESTIONS);
	}

	private positionAnswerLabel(index: number): void {
		const button = this.answerButton[index];
		const label = this.answerLabels[index];
		if (!button || !label) {
			return;
		}
		label.width(button.width());
		label.height(button.height());
		label.x(button.x());
		const textRect = label.getSelfRect();
		label.y(button.y() + button.height() / 2 - textRect.height / 2);
	}
}
