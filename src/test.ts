import {Robot} from './entities/robot';
import { Zombie } from './entities/zombie';
import { Combat } from './combat';

// Test code to create a screen and add entities
// const screen = new Screen('gameContainer', 800, 600);

const robot = new Robot('Robo', 200, 30, 100, 20);
const zombie = new Zombie('Zombie', 50, 15, 300, 300);

assertTrue(robot.getHealth() === 200, "Robot initial health should be 200");
assertTrue(zombie.getHealth() === 50, "Zombie initial health should be 50");

robot.moveTo(150, 150);
zombie.moveTo(250, 250);

assertTrue(robot.getPosition().x === 150 && robot.getPosition().y === 150, "Robot position should be (150, 150)");
assertTrue(zombie.getPosition().x === 250 && zombie.getPosition().y === 250, "Zombie position should be (250, 250)");

const combat = new Combat();

robot.moveTo(249, 250);
robot.faceDirection('right');
combat.performAttack({ attacker: robot }, { attacked: zombie });
assertTrue(zombie.getHealth() === 20, "Zombie health should be 20 after being hit from the left");

robot.moveTo(100, 600);
robot.faceDirection('down');
assertTrue(robot.getPosition().y == 600, "Robot Y position should be 600");
combat.performAttack({ attacker: robot }, { attacked: zombie });
assertTrue(zombie.getHealth() === 20, "Zombie health should remain 20 when robot is not in front");

zombie.moveTo(250, 250);
robot.moveTo(250, 249);
robot.faceDirection('down');
combat.performAttack({ attacker: robot }, { attacked: zombie });
assertTrue(zombie.getHealth() === -10, "Zombie health should be -10 after being hit from above");

robot.moveTo(250, 251);
robot.faceDirection('up');
combat.performAttack({ attacker: robot }, { attacked: zombie });
assertTrue(zombie.getHealth() <= -10, "Zombie health should be less than or equal to -10 after final hit");

combat.performAttack({ attacker: robot }, { attacked: zombie });
assertTrue(zombie.getHealth() <= -10, "Zombie health should remain less than or equal to -10 after attacking dead zombie");


function assertTrue(condition: unknown, message?: string): asserts condition {
  if (!condition) {
    throw new Error(message || "Assertion failed: condition is not true");
  }
}