import { ScreenController } from "../../types.ts";
import type { ScreenSwitcher } from "../../types.ts";
import { CombatScreenModel } from "./CombatScreenModel.ts";
import { CombatScreenView } from "./CombatScreenView.ts";
import { InputManager } from "../../input.ts";
import { STAGE_WIDTH, STAGE_HEIGHT } from "../../constants.ts";
import { Zombie } from "../../entities/zombie.ts";
import { Robot } from "../../entities/robot.ts";
import { Map } from "../../entities/tempMap.ts";




export class CombatScreenController extends ScreenController {
	private model: CombatScreenModel;
	private view: CombatScreenView;
	private screenSwitcher: ScreenSwitcher;
	private robot!: Robot;
	private input!: InputManager;
	private running: boolean;
	private logicTickInterval?: number;

	/* Create model and view, instantiate reference to top-level App class */
	constructor(screenSwitcher: ScreenSwitcher) {
		super();
		this.screenSwitcher = screenSwitcher;
		this.model = new CombatScreenModel(STAGE_WIDTH, STAGE_HEIGHT);
		this.view = new CombatScreenView(this.model);
		this.running = false;
	}

	/* Loads Map and Player data (on boot) */
	async init(): Promise<void> {
		const mapData = await this.loadMap("/porj0.json");
		const mapBuilder = new Map("/tiles/colony.png", 1000, mapData, this.loadImage.bind(this));
		const mapGroup = await mapBuilder.buildMap(mapData);
		this.view.getMapGroup().add(mapGroup);

		const robotImage = await this.loadImage("/lemon.png");
		const zombieImage = await this.loadImage("/imagesTemp.jpg");
		const attackingImage = await this.loadImage("/image.png");
		const idleImage = await this.loadImage("/lemon.png");

		this.robot = new Robot("robot", 100, 50, STAGE_WIDTH / 2, STAGE_HEIGHT / 2, robotImage);
		const zombie = new Zombie("zombie", 100, 50, STAGE_WIDTH / 2, STAGE_HEIGHT / 2, zombieImage);

		this.model.setEntities(this.robot, zombie);
		this.model.setAttackingImage(attackingImage);
		this.model.setIdleImage(idleImage);

		await this.view.build(this.robot, this.model.getZombie());
	}

	/* Called by App class when switchToScreen("game") is executed */
	/* 	--> start gameLoop function 							   */
	/* 	--> create InputManager object to process user input 	   */
	/*  --> show CombatScreenView (all three Konva.Groups) 		   */
	startCombat(): void {
		this.running = true;
		this.input = new InputManager();
		this.startLogicLoop();
		this.view.show();

		this.model.setRunning(true);

		requestAnimationFrame(this.gameLoop);
	}

	/* make all groups in CombatScreenView invisible */
	hide(): void {
		this.model.setRunning(false);
		this.view.hide();
		this.stopLogicLoop();
	}

	/* gameLoop runs 60 times/sec, updates position of Robot sprite directly */
	private gameLoop = (): void => {
		if(!this.running){
			return;
		}

		const { dx, dy } = this.input.getDirection();
		this.robot.move(dx, dy);

		this.screenSwitcher.redrawCombatEntities();
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
	
	getView(): CombatScreenView {
		return this.view;
	}

	private startLogicLoop(): void {
		this.logicTickInterval = window.setInterval(() => {
			const attack = this.input.getAttack();
			if(attack){
				this.model.processAttackRequest(attack);
			}
		}, 100);
	}

	private stopLogicLoop(): void {
		if (this.logicTickInterval) {
			clearInterval(this.logicTickInterval);
			this.logicTickInterval = undefined;
		}
	}
}
