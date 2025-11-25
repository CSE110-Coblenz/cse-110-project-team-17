import { Robot } from "./entities/robot";
import { Zombie } from "./entities/zombie";
import { audioManager } from "./audioManager.ts";

let TOLERANCE = 100; // allow small offset so attack feels natural

export class Combat {
    /**
     * Perform an attack from the player to the enemy
     */
    performAttack(player: { attacker: Zombie | Robot }, enemy: { attacked: Zombie | Robot }): void {
        if (player.attacker.getIsZombie() == true) {
            TOLERANCE = 50; // zombies have shorter reach
        }
        else {
            TOLERANCE = 100; // robots have longer reach
        }
        const attackerPos = player.attacker.getPosition();
        const enemyPos = enemy.attacked.getPosition();

        console.log('Attacker Position: ', attackerPos);
        console.log('Enemy Position: ', enemyPos);

        let hit = false;

        switch (player.attacker.getDirection()) {
            case 'up':
                hit = attackerPos.y - (enemyPos.y) > 0 &&
                      Math.abs(enemyPos.x - attackerPos.x) <= TOLERANCE &&
                      Math.abs(enemyPos.y - attackerPos.y) <= TOLERANCE;
                console.log(hit);
                break;
            case 'down':
                hit = (enemyPos.y) - attackerPos.y > 0 &&
                      Math.abs(enemyPos.x - attackerPos.x) <= TOLERANCE &&
                      Math.abs(enemyPos.y - attackerPos.y) <= TOLERANCE;
                console.log(hit);
                break;
            case 'left':
                hit = (attackerPos.x) - enemyPos.x > 0 &&
                      Math.abs(enemyPos.y - attackerPos.y) <= TOLERANCE &&
                      Math.abs(enemyPos.x - attackerPos.x) <= TOLERANCE;
                console.log(hit);
                break;
            case 'right':
                hit = enemyPos.x - (attackerPos.x) > 0 &&
                      Math.abs(enemyPos.y - attackerPos.y) <= TOLERANCE &&
                      Math.abs(enemyPos.x - attackerPos.x) <= TOLERANCE; // extra range for right attack
                console.log(hit);
                break;
        }

        if (hit) {
            enemy.attacked.takeDamage(player.attacker.getMaxAttack());
            if (player.attacker.getIsZombie()) {
                audioManager.playSfx("robot_damage");
            } else {
                audioManager.playSfx("robot_punch", { volume: 0.35 });
            }
            console.log('Hit!');
            if (enemy.attacked.getHealth() <= 0) {
                console.log('Enemy defeated!');
                enemy.attacked.hide();
                enemy.attacked.moveTo(-1000, -1000);
            }
        } else {
            console.log('Did not hit anyone');
        }
    }
}
