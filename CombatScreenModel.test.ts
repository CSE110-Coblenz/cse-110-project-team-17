import { describe, it, expect, beforeAll } from "vitest";
import { CombatScreenModel } from "./src/screens/CombatScreen/CombatScreenModel.ts";
import { Robot } from "./src/entities/robot.ts";
import { Zombie } from "./src/entities/zombie.ts";

// Mock Konva.Image to prevent canvas errors
beforeAll(() => {
  (globalThis as any).Image = class { src = ""; };
});

describe("CombatScreenModel function tests", () => {

  it("starts with running set to false and can toggle", () => {
    const model = new CombatScreenModel(800, 600);
    expect(model.isRunning()).toBe(false);
    model.setRunning(true);
    expect(model.isRunning()).toBe(true);
  });

  it("can set and get robot/zombie entities", () => {
    const model = new CombatScreenModel(800, 600);
    const robot = new Robot("Robo", 100, 50, 0, 0);
    const zombie = new Zombie("Zed", 50, 5, 100, 100);

    model.setEntities(robot, zombie);
    expect(model.getRobot()).toBe(robot);
    expect(model.getZombie()).toBe(zombie);
  });

  it("processAttackRequest reduces health and increments defeated count", () => {
    const model = new CombatScreenModel(800, 600);
    const robot = new Robot("Robo", 100, 50, 0, 0);
    const zombie = new Zombie("Zed", 50, 5, 10, 0);

    model.setEntities(robot, zombie);
    model.addZombie(zombie);

    // Set dummy images to prevent errors
    const dummyImage = new Image();
    model.setAttackingImage(dummyImage);
    model.setIdleImage(dummyImage);

    expect(zombie.getHealth()).toBe(50);

    model.processAttackRequest(true, 1000, -1, true); // robot attacks
    expect(zombie.getHealth()).toBeLessThanOrEqual(0);
    expect(model.getZombiesDefeated()).toBe(1);
  });

  it("increments and gets zombies defeated", () => {
    const model = new CombatScreenModel(800, 600);
    expect(model.getZombiesDefeated()).toBe(0);
    model.incrementZombiesDefeated();
    expect(model.getZombiesDefeated()).toBe(1);
  });

  it("resets model state correctly", () => {
    const model = new CombatScreenModel(800, 600);
    const robot = new Robot("Robo", 100, 50, 0, 0);
    const zombie = new Zombie("Zed", 50, 5, 10, 0);

    model.setEntities(robot, zombie);
    model.addZombie(zombie);

    expect(model.getZombies().length).toBe(1);
    model.reset();
    expect(model.isRunning()).toBe(false);
    expect(model.getZombiesDefeated()).toBe(0);
  });

  it("updates robot position and direction logically", () => {
    const model = new CombatScreenModel(800, 600);
    const robot = new Robot("Robo", 100, 50, 0, 0);
    model.setEntities(robot, new Zombie("Zed", 50, 5, 100, 100));

    // Mock the map so movement check passes
    const mockMap = { canMoveToArea: (_x: number, _y: number, _w: number, _h: number) => true };
    model.setMapBuilder(mockMap as any);

    model.updateRobotPosition(10, 0); // move right
    expect(robot.getPosition().x).toBeGreaterThan(0);
    expect(robot.getDirection()).toBe("right");

    model.updateRobotPosition(-5, 5); // move left and down
    expect(robot.getDirection()).toBe("down");
  });
});
