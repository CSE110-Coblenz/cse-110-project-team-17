import {Robot} from './entities/robot';
import { Zombie } from './entities/zombie';
import { Combat } from './combat';

// Test code to create a screen and add entities
// const screen = new Screen('gameContainer', 800, 600);

const robot = new Robot('Robo', 200, 200, 100, 20);
const zombie = new Zombie('Zombie', 50, 15, 300, 300);

console.log("Health at beginning: " + robot.getHealth()); // Should print 200
console.log("Health at beginning: " + zombie.getHealth()); // Should print 50

robot.moveTo(150, 150);
zombie.moveTo(250, 250);

console.log('Robot position:', robot.getPosition()); // Should print {x: 150, y: 150}
console.log('Zombie position:', zombie.getPosition()); // Should print {x: 250, y: 250}

const combat = new Combat();

// Simulate an attack from robot to zombie
console.log("Robot direction: " + robot.getDirection());
combat.performAttack({ attacker: robot }, { attacked: zombie });
console.log('Zombie health after attempted attack:', zombie.getHealth());


robot.moveTo(249, 250); // Move robot left next to zombie
console.log('Robot position:', robot.getPosition()); // Should print {x: 249, y: 250}
console.log('Zombie position:', zombie.getPosition()); // Should print {x: 250, y: 250}
console.log("Robot direction: " + robot.getDirection());
combat.performAttack({ attacker: robot }, { attacked: zombie });
console.log('Zombie health after second attack:', zombie.getHealth()); // Should print 20 if hit

// Move robot above zombie and attack again
robot.moveTo(250, 249); // Move robot above zombie
console.log('Robot position:', robot.getPosition()); // Should print {x: 249, y: 250}
console.log('Zombie position:', zombie.getPosition()); // Should print {x: 250, y: 250}
console.log("Robot direction: " + robot.getDirection());
combat.performAttack({ attacker: robot }, { attacked: zombie });
console.log('Zombie health after third attack:', zombie.getHealth()); // Should print 5 if hit

// Move robot below zombie and attack again
robot.moveTo(250, 251); // Move robot below zombie
robot.faceDirection('up');
console.log('Robot position:', robot.getPosition()); // Should print {x: 249, y: 250}
console.log('Zombie position:', zombie.getPosition()); // Should print {x: 250, y: 250}
console.log("Robot direction: " + robot.getDirection());
combat.performAttack({ attacker: robot }, { attacked: zombie });
console.log('Zombie health after fourth attack:', zombie.getHealth()); // Should print -10 and "You have died" if hit