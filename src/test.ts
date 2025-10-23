import { Combat } from "./combat.ts";

class zombie{
	public currentHealth: number;
	public attackPoints: number;

	constructor(currentHealth: number, attackPoints: number) {
		this.currentHealth = currentHealth;
		this.attackPoints = attackPoints;
	}
}
class player{
	public currentHealth: number;
	public damagePoints: number;

	constructor(currentHealth: number, damagePoints: number) {
		this.currentHealth = currentHealth;
		this.damagePoints = damagePoints;
	}
}
const combat = new Combat();
const zombie1 = new zombie(100, 20);
const player1 = new player(100, 20);

combat.performAttack(player1, zombie1);
console.log(`Zombie Health after attack: ${zombie1.currentHealth}`);

combat.takeDamage(player1, zombie1);
console.log(`Player Health after taking damage: ${player1.currentHealth}`);