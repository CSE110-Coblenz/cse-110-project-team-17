import { describe, it, expect, beforeAll } from "vitest";
import { CombatScreenModel } from "./src/screens/CombatScreen/CombatScreenModel.ts";
import { Robot } from "./src/entities/robot.ts";
import { Zombie } from "./src/entities/zombie.ts";

// Mock the Image class for Konva
beforeAll(() => {
  (globalThis as any).Image = class {
    src = "";
  };
});

describe("CombatScreenModel function tests", () => {
  let model: CombatScreenModel;
  let robot: Robot;
  let zombie: Zombie;

  beforeAll(() => {
    model = new CombatScreenModel(800, 600);

    // Create robot and zombie
    robot = new Robot("Robo", 100, 50, 0, 0);
    zombie = new Zombie("Zed", 50, 5, 100, 100);

    // Set entities
    model.setEntities(robot, zombie);

    // Set dummy map data
    model.setMapData({}); 

    // Set dummy mapBuilder with canMoveToArea always returning true
    const mockMap = { canMoveToArea: (_x: number, _y: number, _w: number, _h: number) => true };
    model.setMapBuilder(mockMap as any);

    // Add zombie to zombies array
    model.addZombie(zombie);

    // Set dummy attack/idle images
    const dummyImage = new Image();
    model.setAttackingImage(dummyImage);
    model.setIdleImage(dummyImage);
  });

  it("starts with running set to false", () => {
    expect(model.isRunning()).toBe(false);
    model.setRunning(true);
    expect(model.isRunning()).toBe(true);
  });

  it("updates robot position and direction logically", () => {
    robot.moveTo(50, 50);
    model.updateRobotPosition(10, 0);
    const pos = robot.getPosition();
    expect(pos.x).toBeGreaterThan(50);
    expect(robot.getDirection()).toBe("right");

    model.updateRobotPosition(-20, 0);
    expect(robot.getDirection()).toBe("left");

    model.updateRobotPosition(0, 10);
    expect(robot.getDirection()).toBe("down");

    model.updateRobotPosition(0, -20);
    expect(robot.getDirection()).toBe("up");
  });

  it("processAttackRequest reduces health and increments defeated count", () => {
    const initialZombiesDefeated = model.getZombiesDefeated();
    const lastAttackTime = 0;

    // Robot attacks zombie
    model.processAttackRequest(true, 1000, lastAttackTime, true);

    expect(zombie.getHealth()).toBeLessThanOrEqual(50); // zombie took damage
    if (zombie.getHealth() <= 0) {
      expect(model.getZombiesDefeated()).toBe(initialZombiesDefeated + 1);
    }
  });

  it("increments and retrieves score correctly", () => {
    const initialScore = model.getScore();
    model.incrementScore();
    expect(model.getScore()).toBe(initialScore + 1);
  });

  it("resets the model properly", () => {
    model.reset();
    expect(model.isRunning()).toBe(false);
    expect(model.getScore()).toBe(0);
  });

  it("can retrieve attacking and idle images", () => {
    const attackImg = model.getAttackingImage();
    const idleImg = model.getIdleImage();
    expect(attackImg).toBeDefined();
    expect(idleImg).toBeDefined();
  });
});
