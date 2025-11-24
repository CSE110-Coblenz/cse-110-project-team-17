import { describe, it, expect, beforeEach } from "vitest";
import { MiniGame2ScreenModel } from "../src/screens/MiniGame2Screen/MiniGame2ScreenModel.ts";

describe("MiniGame2ScreenModel additional coverage", () => {
  let model: MiniGame2ScreenModel;

  beforeEach(() => {
    model = new MiniGame2ScreenModel();
  });

  it("ignores delivering unknown objects", () => {
    model.deliverObject("ghost");
    expect(model.getDeliveredItems()).toEqual([]);
    expect(model.isCarryingSomething()).toBe(false);
    expect(model.allObjectsDelivered()).toBe(true); // no objects tracked
  });

  it("does not allow carry when already carrying", () => {
    model.addObject("one");
    model.addObject("two");
    model.carryObject("one");
    model.carryObject("two");
    expect(model.getCurrentlyCarriedItem()).toBe("one");
    expect(model.isObjectIdle("two")).toBe(true);
  });

  it("dropObject returns null when nothing is carried", () => {
    model.addObject("item");
    expect(model.dropObject()).toBeNull();
    expect(model.isCarryingSomething()).toBe(false);
  });

  it("allObjectsDelivered respects delivered state", () => {
    model.addObject("one");
    model.addObject("two");
    expect(model.allObjectsDelivered()).toBe(false);
    model.deliverObject("one");
    expect(model.allObjectsDelivered()).toBe(false);
    model.deliverObject("two");
    expect(model.allObjectsDelivered()).toBe(true);
  });
});
