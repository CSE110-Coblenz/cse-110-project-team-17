import { describe, it, expect } from "vitest";
import { Robot } from "./src/entities/robot";
import { Zombie } from "./src/entities/zombie";
import { CombatScreenModel } from "./src/screens/CombatScreen/CombatScreenModel";

describe("CombatScreenModel Attack Logic", () => {

  it("should damage zombies only when directly in front of the robot", () => {
    const model = new CombatScreenModel(800, 600);

    const robot = new Robot("Robo", 200, 30, 150, 150);
    const zombie = new Zombie("Zombie", 50, 15, 250, 250);

    model.setEntities(robot, zombie);
    model.addZombie(zombie); // important: model attacks ALL zombies in array

    // 1. Not in front → no hit
    model.processAttackRequest(true, 1000, 0);
    expect(zombie.getHealth()).toBe(50);

    // 2. Move robot next to zombie on the left & face right → hit
    robot.moveTo(249, 250);
    robot.faceDirection("right");
    model.processAttackRequest(true, 2000, 1000);
    expect(zombie.getHealth()).toBe(20);

    // 3. Move robot above zombie & face down → hit
    robot.moveTo(250, 249);
    robot.faceDirection("down");
    model.processAttackRequest(true, 3000, 2000);
    expect(zombie.getHealth()).toBe(5);

    // 4. Move robot below zombie & face up → hit and kill
    robot.moveTo(250, 251);
    robot.faceDirection("up");
    model.processAttackRequest(true, 4000, 3000);
    expect(zombie.getHealth()).toBeLessThanOrEqual(0);

    // 5. Ensure zombie defeat count increased
    expect(model.getZombiesDefeated()).toBe(1);
  });

});
