import { Robot } from "./entities/robot";
import { Zombie } from "./entities/zombie";

const TOLERANCE = 40; // allow small offset so attack feels natural

export class Combat {
    /**
     * Perform an attack from the player to the enemy
     */
    performAttack(player: { attacker: Zombie | Robot }, enemy: { attacked: Zombie | Robot }): void {
        const attackerPos = player.attacker.getPosition();
        const enemyPos = enemy.attacked.getPosition();

        console.log('Attacker Position: ', attackerPos);
        console.log('Enemy Position: ', enemyPos);

        let hit = false;

        switch (player.attacker.getDirection()) {
            case 'up':
                hit = enemyPos.y - (attackerPos.y) > 0 &&
                      Math.abs(enemyPos.x - attackerPos.x) <= TOLERANCE;
                console.log(hit);
                break;
            case 'down':
                hit = (attackerPos.y) - enemyPos.y > 0 &&
                      Math.abs(enemyPos.x - attackerPos.x) <= TOLERANCE;
                console.log(hit);
                break;
            case 'left':
                hit = (attackerPos.x) - enemyPos.x > 0 &&
                      Math.abs(enemyPos.y - attackerPos.y) <= TOLERANCE;
                console.log(hit);
                break;
            case 'right':
                hit = enemyPos.x - (attackerPos.x) > 0 &&
                      Math.abs(enemyPos.y - attackerPos.y) <= TOLERANCE;
                console.log(hit);
                break;
        }

        if (hit) {
            enemy.attacked.takeDamage(player.attacker.getMaxAttack());
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
