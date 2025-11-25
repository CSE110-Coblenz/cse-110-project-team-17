import { describe, it, expect, beforeEach } from "vitest";
import { ExplorationScreenModel } from "../src/screens/ExplorationScreen/ExplorationScreenModel.ts";
import { STAGE_WIDTH, EDGE_THRESHOLD } from "../src/constants.ts";

describe("ExplorationScreenModel", () => {
  let model: ExplorationScreenModel;

  beforeEach(() => {
    model = new ExplorationScreenModel();
  });

  it("reset clears state", () => {
    model.addObject("key");
    model.collectObject("key");
    model.reset();
    expect(model.getCollectedItems()).toEqual([]);
    expect(model.allObjectsCollected()).toBe(false);
  });

  it("collects objects once and tracks collected list", () => {
    model.addObject("key");
    model.collectObject("key");
    expect(model.getCollectedItems()).toEqual(["key"]);

    // collecting again should not duplicate
    model.collectObject("key");
    expect(model.getCollectedItems()).toEqual(["key"]);
  });

  it("reports object collected status", () => {
    model.addObject("key");
    expect(model.isObjectCollected("key")).toBe(false);
    model.collectObject("key");
    expect(model.isObjectCollected("key")).toBe(true);
  });

  it("allObjectsCollected is true only when every object is collected", () => {
    model.addObject("one");
    model.addObject("two");
    expect(model.allObjectsCollected()).toBe(false);
    model.collectObject("one");
    expect(model.allObjectsCollected()).toBe(false);
    model.collectObject("two");
    expect(model.allObjectsCollected()).toBe(true);
  });

  it("getCollectedItems returns a copy", () => {
    model.addObject("key");
    model.collectObject("key");
    const items = model.getCollectedItems();
    items.push("mutate");
    expect(model.getCollectedItems()).toEqual(["key"]);
  });

  it("shouldTransitionToCombat only when at right edge and all collected", () => {
    model.addObject("one");
    model.addObject("two");
    model.collectObject("one");
    model.collectObject("two");
    const rightEdgeX = STAGE_WIDTH - EDGE_THRESHOLD;
    expect(model.shouldTransitionToCombat(rightEdgeX)).toBe(true);

    // Not at edge
    expect(model.shouldTransitionToCombat(10)).toBe(false);
  });
});
