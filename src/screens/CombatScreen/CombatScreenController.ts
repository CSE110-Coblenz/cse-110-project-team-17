import { ScreenController } from "../../types.ts";
import { CombatScreenModel } from "./CombatScreenModel.ts";
import { CombatScreenView } from "./CombatScreenView.ts";
import { InputManager } from "../../input.ts";
import { STAGE_WIDTH, STAGE_HEIGHT } from "../../constants.ts";
import { Player } from "../../entities/player.ts";
import { Zombie } from "../../entities/zombie.ts";
import { Combat } from "../../combat.ts";
import { Robot } from "../../entities/robot.ts";
import type { ScreenSwitcher } from "../../types.ts";


export class CombatScreenController extends ScreenController {
	private model: CombatScreenModel;
	private view: CombatScreenView;
	private screenSwitcher: ScreenSwitcher;
	private input!: InputManager;
	private robot!: Robot;
	private zombie!: Zombie;
	private running: boolean;
	private attack: boolean = false;
	private combat: Combat = new Combat();
	private attackingImage!: HTMLImageElement;
	private idleImage!: HTMLImageElement;
	private attackDuration: number = 500; // milliseconds

	/* Create model and view, instantiate reference to top-level App class */
	constructor(screenSwitcher: ScreenSwitcher) {
		super();
		this.screenSwitcher = screenSwitcher;
		this.model = new CombatScreenModel();
		this.view = new CombatScreenView();
		this.running = false;
	}

	/* Loads Map and Player data (on boot) */
	async init(): Promise<void> {
		const mapData = await this.loadMap("/porj0.json");
		const robotImage = await this.loadImage("/lemon.png");
		const zombieImage = await this.loadImage("/imagesTemp.jpg");
		this.attackingImage = await this.loadImage("/image.png");
		this.idleImage = await this.loadImage("/lemon.png");
		this.robot = new Robot("robot", null, 100, 50, STAGE_WIDTH / 2, STAGE_HEIGHT / 2, robotImage);
		this.zombie = new Zombie("zombie", null, 100, 50, STAGE_WIDTH / 2, STAGE_HEIGHT / 2, zombieImage);
		await this.view.build(mapData, this.robot, this.zombie, this.loadImage.bind(this));
	}

	/* Called by App class when switchToScreen("game") is executed */
	/* 	--> start gameLoop function 							   */
	/* 	--> create InputManager object to process user input 	   */
	/*  --> show CombatScreenView (all three Konva.Groups) 		   */
	startCombat(): void {
		this.running = true;
		this.input = new InputManager();
		this.view.show();
		requestAnimationFrame(this.gameLoop);
	}

	/* make all groups in CombatScreenView invisible */
	hide(): void {
		this.running = false;
		this.view.hide();
	}

	/* gameLoop runs 60 times/sec, updates position of Player sprite */
	private gameLoop = (): void => {
		if(!this.running) return;

		const { dx, dy } = this.input.getDirection();
		const y = this.robot.getPosition().y;
		const x = this.robot.getPosition().x;
		this.robot.moveTo(dx, dy);
		if (this.robot.getPosition().x != x) {
			if (this.robot.getPosition().x > x) {
				this.robot.faceDirection('right');
			} 
			else {
				this.robot.faceDirection('left');
			}
		}
		else if (this.robot.getPosition().y != y) {
			if (this.robot.getPosition().y > y) {
				this.robot.faceDirection('down');
			} 
			else {
				this.robot.faceDirection('up');
			}
		}
		console.log("direction: " + this.robot.getDirection());
		this.attack = this.input.getAttack();
		if (this.attack) {
			console.log("Attack initiated!");
			this.combat.performAttack({attacker: this.robot}, {attacked: this.zombie});
			console.log('Zombie health after attack:', this.zombie.getHealth());
			this.attack = false;
			this.robot.loadImage(this.attackingImage);
			setTimeout(() => {
				this.robot.loadImage(this.idleImage);
			}, this.attackDuration);
		}
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
}
