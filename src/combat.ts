import { Robot } from "./entities/robot";
import { Zombie } from "./entities/zombie";

export class Combat {
    /**
     * Perform an attack from the player to the enemy
     */
    performAttack(player: { attacker: Zombie | Robot }, enemy: { attacked: Zombie | Robot }): void {
        switch (player.attacker.getDirection()) {
            case 'up':
                if (player.attacker.getPosition().y < enemy.attacked.getPosition().y && 
                    enemy.attacked.getPosition().y - player.attacker.getPosition().y <= 2 &&
                    player.attacker.getPosition().x == enemy.attacked.getPosition().x) {
                    enemy.attacked.takeDamage(player.attacker.getMaxAttack());
                    console.log('Hit!');
                    console.log(typeof enemy);
                    if (enemy.attacked.getHealth() <= 0) {
                        console.log('Enemy defeated!');
                        enemy.attacked.hide();
                        enemy.attacked.moveTo(-1000, -1000);
                    }
                }
                else {
                    console.log('Did not hit anyone');
                }
                break;
            case 'down':
                if (enemy.attacked.getPosition().y < player.attacker.getPosition().y && 
                    player.attacker.getPosition().y - enemy.attacked.getPosition().y <= 2 &&
                    player.attacker.getPosition().x == enemy.attacked.getPosition().x) {
                    enemy.attacked.takeDamage(player.attacker.getMaxAttack());
                    console.log('Hit!');
                    if (enemy.attacked.getHealth() <= 0) {
                        console.log('Enemy defeated!');
                        enemy.attacked.hide();
                        enemy.attacked.moveTo(-1000, -1000);
                    }
                }
                else {
                    console.log('Did not hit anyone');
                }
                break;
            case 'left':
                if (player.attacker.getPosition().x > enemy.attacked.getPosition().x && 
                    player.attacker.getPosition().x - enemy.attacked.getPosition().x <= 2 &&
                    player.attacker.getPosition().y == enemy.attacked.getPosition().y) {
                    enemy.attacked.takeDamage(player.attacker.getMaxAttack());
                    console.log('Hit!');
                    if (enemy.attacked.getHealth() <= 0) {
                        console.log('Enemy defeated!');
                        enemy.attacked.hide();
                        enemy.attacked.moveTo(-1000, -1000);
                    }
                }
                else {
                    console.log('Did not hit anyone');
                }
                break;
            case 'right':
                if (enemy.attacked.getPosition().x > player.attacker.getPosition().x && 
                    enemy.attacked.getPosition().x - player.attacker.getPosition().x <= 2 &&
                    player.attacker.getPosition().y == enemy.attacked.getPosition().y) {
                    enemy.attacked.takeDamage(player.attacker.getMaxAttack());
                    console.log('Hit!');                    
                    if (enemy.attacked.getHealth() <= 0) {
                        console.log('Enemy defeated!');
                        enemy.attacked.hide();
                        enemy.attacked.moveTo(-1000, -1000);
                    }
                }
                else {
                    console.log('Did not hit anyone');
                }
                break;
            default:
                console.log('Did not hit anyone');
                break;
        }
    }
}