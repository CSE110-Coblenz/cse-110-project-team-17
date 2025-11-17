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

		// alternative API:
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

		this.answerButton.forEach((button) => {
			button.on('click', () => {
				console.log(`Button ${button.id()} clicked`);
			})
			this.textBoxGroup.add(button);
		});
	}

	showAttackAnimation(): void {
		// Implementation for showing attack animation
		
	}

	handleEvent(evnt: any): void {
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
}
