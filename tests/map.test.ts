import { describe, it, expect, beforeEach, vi } from "vitest";
import { Mapp } from "../src/entities/tempMap.ts";

const mockMapData = {
    width: 5,
    height: 5,
    layers: [
        {
            //...
        },
        {
            data: [
                0, 0, 1, 0, 0,
                0, 1, 1, 1, 0,
                0, 0, 0, 0, 0,
                1, 1, 0, 1, 1,
                0, 0, 0, 0, 0
            ]
        }
    ],
    tilesets: [
        {
         "firstgid":1,
         "source":"/tiles/Dark-Green_TileSet.json"
        }, 
        {
         "firstgid":409,
         "source":"/tiles/Brick-Wall_TileSet.json"
        }
    ]
};


describe("Mapp class", () => {
    let map: Mapp;
    let mockLoadImage: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        mockLoadImage = vi.fn().mockResolvedValue({
        width: 128,
        height: 128
        } as unknown as HTMLImageElement);
    
    map = new Mapp(16, mockMapData, mockLoadImage);
    });

    it("computes corresponding tile from pixel coordinates", () => {
        const result = map.getTileAtPixel(32, 16);
        expect(result).toEqual({ tileX: 2, tileY: 1 });
    });

    it("returns true for blocked tiles", () => {
        expect(map.isBlocked(2,0)).toBe(true);
        expect(map.isBlocked(0,0)).toBe(false);
        expect(map.isBlocked(1,1)).toBe(true);
    });

    it("allow movement if sprite is within tiles with no objects", () => {
        /* 15x15 sprite in the first tile (0,0) is okay */
        expect(map.canMoveToArea(0, 0, 15, 15)).toBe(true);

        /* 16x16 sprite not allowed to move to tile (2,0) bc there is an object */
        expect(map.canMoveToArea(32, 0, 16, 16)).toBe(false);

        /* 32x16 sprite can't move to tile (1,0), overlaps with invalid tile */
        expect(map.canMoveToArea(16, 0, 32, 16)).toBe(false);

        /* 32x15 sprite can move to tile (0,2) */
        expect(map.canMoveToArea(0, 32, 32, 15)).toBe(true);

        /* 16x16 sprite cannot move to tile (1,1) */
        expect(map.canMoveToArea(16, 16, 16, 16)).toBe(false);

        /* 48x48 sprite at tile (0,0) will overlap with invalid tile */
        expect(map.canMoveToArea(0, 0, 48, 48)).toBe(false);
    });
});

