// combat.test.ts
import { describe, it, expect } from "vitest";
import { Robot } from "../src/entities/robot";
import { Zombie } from "../src/entities/zombie";
import { Combat } from "../src/combat";

describe("Combat Attack Logic", () => {

  it("should apply damage only when enemy is directly in front (32x32 offset)", () => {
    const robot = new Robot("Robo", 200, 20, 150, 150); // attack = 20
    const zombie = new Zombie("Zombie", 50, 15, 250, 250);
    const combat = new Combat();

    // Initially far away → no hit
    combat.performAttack({ attacker: robot }, { attacked: zombie });
    expect(zombie.getHealth()).toBe(30);

    // Move robot next to zombie (left of zombie)
    robot.moveTo(249, 250);
    robot.faceDirection("right");
    combat.performAttack({ attacker: robot }, { attacked: zombie });
    expect(zombie.getHealth()).toBe(10); // got hit once

    // Move robot above zombie
    robot.moveTo(250, 249);
    robot.faceDirection("down");
    combat.performAttack({ attacker: robot }, { attacked: zombie });
    expect(zombie.getHealth()).toBe(-10); // second hit

    // Move robot below zombie and face up
    robot.moveTo(250, 251);
    robot.faceDirection("up");
    combat.performAttack({ attacker: robot }, { attacked: zombie });
    expect(zombie.getHealth()).toBe(-10);
  });

});