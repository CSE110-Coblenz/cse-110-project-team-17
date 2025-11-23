import { Robot } from "../../entities/robot.ts";
import { Zombie } from "../../entities/zombie.ts";
import { MapModel } from "../MapScreen/MapModel.ts";
import { ChoiceDialogBox } from "./ChoiceDialogBox.ts";

/**
 * CombatScreenModel
 *
 * Holds combat-specific state: references to Robot and Zombie entities,
 * map data, running flag for the game loop, and attack animation images.
 * Extends MapModel so it can validate positions against map bounds.
 */
export class PokemonScreenModel extends MapModel{
	private choiceBox: ChoiceDialogBox;
	private running: boolean = false;
	private player : Robot;
	private boss: Zombie;
	private currentQuestion: { question: string; answers: string[] } | null = null;

	static readonly BOSS_MAX_HEALTH: number = 200;
	static readonly PLAYER_MAX_HEALTH: number = 100;

	constructor(width: number, height: number) {
		super(width, height);
		this.choiceBox = new ChoiceDialogBox();
		const pimg = new Image();
		pimg.src = '/sprites/idle-frame1.png';
		this.player = new Robot("player", PokemonScreenModel.PLAYER_MAX_HEALTH, 20, width / 2, height / 2, pimg);
		const bimg = new Image();
		bimg.src = '/sprites/imagesTemp.jpg';
		this.boss = new Zombie("boss", PokemonScreenModel.BOSS_MAX_HEALTH, 75, width / 2 + 100, height / 2, bimg);
	}

	getPlayer(): Robot {
		return this.player;
	}

	getBoss(): Zombie {
		return this.boss;
	}

	isRunning(): boolean {
		return this.running;
	}

	setRunning(running: boolean): void {
		this.running = running;
	}

	public resetGame(): void {
		this.player.setHealth(PokemonScreenModel.PLAYER_MAX_HEALTH);
		this.boss.setHealth(PokemonScreenModel.BOSS_MAX_HEALTH);
		this.choiceBox = new ChoiceDialogBox();
	}

	generateNextQuestion(): { question: string; answers: string[] } {
		this.choiceBox.selectNewQuestion();
		const qa = this.choiceBox.getQuestionAndAnswers();
		if (!qa) {
			throw new Error("Failed to load question data");
		}
		this.currentQuestion = qa;
		return qa;
	}

	getCurrentQuestion(): { question: string; answers: string[] } | null {
		return this.currentQuestion;
	}

	checkAnswer(index: number): boolean {
		return this.choiceBox.isAnswerCorrect(index);
	}

	getCorrectAnswerText(): string {
		return this.choiceBox.getCorrectAnswer() ?? "";
	}

	getBossHealth(): number {
		return this.boss.getHealth();
	}

	getPlayerHealth(): number {
		return this.player.getHealth();
	}

	dealDamageToBoss(damage: number): void {
		this.boss.takeDamage(damage);
	}

	dealDamageToPlayer(damage: number): void {
		this.player.takeDamage(damage);
	}

	isBossDefeated(): boolean {
		return this.boss.getHealth() <= 0;
	}

	isPlayerDefeated(): boolean {
		return this.player.getHealth() <= 0;
	}

	resetBoss(): void {
		this.boss.setHealth(200);
	}

	updateCurrentQuestionStatus(isCorrect: boolean): void {
		this.choiceBox.updateCurrentQuestionStatus(isCorrect);
	}
}