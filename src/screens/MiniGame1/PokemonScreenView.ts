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
	private entityGroup: Konva.Group;
	private model: PokemonScreenModel;

	private answerButton: Konva.Rect[];
	private answerLabels: Konva.Text[];
	private questionText: Konva.Text;
	private feedbackText: Konva.Text;
	private bossHealthText: Konva.Text;
	private victoryText: Konva.Text;
	private onAnswerSelected?: (index: number) => void;

	constructor(screenSwitcher: ScreenSwitcher, model: PokemonScreenModel) {
		super(model);
		this.bgGroup = new Konva.Group({ visible: false });
		this.bgGroup.moveToBottom();
		this.textBoxGroup = new Konva.Group({ visible: false });
		this.entityGroup = new Konva.Group({ visible: false });
		this.screenGroup = new Konva.Group({ visible: false });
		this.screenGroup.add(this.bgGroup);
		this.screenGroup.add(this.entityGroup);
		this.screenGroup.add(this.textBoxGroup);

		this.model = model;
		
		this.model.getPlayer().getCurrentImage().scale({x:10, y:10});
		this.entityGroup.add(this.model.getPlayer().getCurrentImage());
		this.model.getBoss().getCurrentImage().scale({x:10, y:10});
		this.entityGroup.add(this.model.getBoss().getCurrentImage());
		this.model.getPlayer().moveTo(-500, -100);
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
		// TODO: replace with attack animation
		this.feedbackText = new Konva.Text({
			x: textBox.x() + 20,
			y: textBox.y() + textBox.height() - 50,
			width: textBox.width() - 40,
			fontSize: 20,
			fontFamily: 'Arial',
			fill: '#1b1b1b',
			text: '',
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

		// Victory message
		this.victoryText = new Konva.Text({
			x: screenSwitcher.getStageWidth() / 2 - 100,
			y: screenSwitcher.getStageHeight() / 2 - 50,
			fontSize: 48,
			fontFamily: 'Arial',
			fill: 'gold',
			text: 'Victory! Boss Defeated!',
			visible: false
		});
		this.screenGroup.add(this.victoryText);

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
			fill: 'lightgreen',
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
			fill: 'lightcoral',
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
			fill: 'white',
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

	getEntityGroup(): Konva.Group {
		return this.entityGroup;
	}

	show(): void {
		this.screenGroup.visible(true);
		this.textBoxGroup.visible(true);
		this.entityGroup.visible(true);
		this.bgGroup.visible(true);
		// this.bgGroup.getLayer()?.draw();
	}

	hide(): void {
		this.screenGroup.visible(false);
		this.textBoxGroup.visible(false);
		this.entityGroup.visible(false);
		this.bgGroup.visible(false);
		// this.bgGroup.getLayer()?.draw();
	}

	// Used in the screen controller to set answer handler
	setAnswerHandler(handler: (index: number) => void): void {
		this.onAnswerSelected = handler;
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
		this.bossHealthText.text(`${health}/200`);
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

	// Animate button click
	playButtonClickAnimation(index: number): void {
		const button = this.answerButton[index];
		if (!button) return;
		const originalFill = button.fill();
		button.fill('#79b986ff');
		button.getLayer()?.batchDraw();
		setTimeout(() => {
			button.fill(originalFill);
			button.getLayer()?.batchDraw();
		}, 150);
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
