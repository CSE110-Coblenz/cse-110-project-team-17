import { describe, it, expect, beforeEach, vi } from "vitest";
import { Player } from "../src/entities/player.ts"

const fakeHTMLImage = {
  width: 64,
  height: 64
} as unknown as HTMLImageElement;

describe("Player class methods/MovableEntity inherited methods", () => {
    let player: Player;

    beforeEach(() => {
        player = new Player("test", 100, 50, fakeHTMLImage);
    })


    it("return correct starting position", () => {
        expect(player.getX()).toBe(100);
        expect(player.getY()).toBe(50);
        expect(player.getPosition()).toEqual({ x: 100, y: 50 });
    });

    it("initial direction is right", () => {
        expect(player.getDirection()).toBe("right");
    });

    it("verify change in direction using faceDirection()", () => {
        player.faceDirection("up");
        expect(player.getDirection()).toBe("up");
    });

    it("getCurrentImage returns the active Konva.Image", () => {
        const img = player.getCurrentImage();
        expect(img).toBeDefined();
        expect(img.width).toBe(12);
    });

    it("verify position that is returned and the updated direction", () => {
        const next = player.getNextPosition(1, 0);

        expect(next).toEqual({ x: 102, y: 50 });
        expect(player.getDirection()).toBe("right");
    });

    it("check that all directions update correctly in getNextPosition()", () => {
        player.getNextPosition(0, -1);
        expect(player.getDirection()).toBe("up");

        player.getNextPosition(0, 1);
        expect(player.getDirection()).toBe("down");

        player.getNextPosition(-1, 0);
        expect(player.getDirection()).toBe("left");
    });

    it("move() function updates position of all player sprites", () => {
        player.move(104, 5);
        expect(player.getPosition()).toEqual({ x: 104, y: 50 });
    })
});