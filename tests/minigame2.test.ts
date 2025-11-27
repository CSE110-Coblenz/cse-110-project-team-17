import { describe, it, expect, beforeEach } from "vitest";
import { MiniGame2ScreenModel } from "../src/screens/MiniGame2Screen/MiniGame2ScreenModel.ts";

describe("MiniGame2ScreenModel", () => {
  let model: MiniGame2ScreenModel;

  beforeEach(() => {
    model = new MiniGame2ScreenModel();
  });

  it("tracks a full carry and drop cycle", () => {
    model.addObject("object-1");

    expect(model.isObjectIdle("object-1")).toBe(true);

    model.carryObject("object-1");
    expect(model.isObjectCarried("object-1")).toBe(true);
    expect(model.getCurrentlyCarriedItem()).toBe("object-1");

    const dropped = model.dropObject();
    expect(dropped).toBe("object-1");
    expect(model.getCurrentlyCarriedItem()).toBeNull();
    expect(model.isObjectIdle("object-1")).toBe(true);
  });

  it("prevents picking up another object while already carrying one", () => {
    model.addObject("object-1");
    model.addObject("object-2");

    model.carryObject("object-1");
    model.carryObject("object-2");

    expect(model.getCurrentlyCarriedItem()).toBe("object-1");
    expect(model.isObjectIdle("object-2")).toBe(true);
  });

  it("marks objects as delivered and reports when all are delivered", () => {
    model.addObject("object-1");
    model.addObject("object-2");

    model.carryObject("object-1");
    model.deliverObject("object-1");
    expect(model.getDeliveredItems()).toEqual(["object-1"]);
    expect(model.isCarryingSomething()).toBe(false);
    expect(model.allObjectsDelivered()).toBe(false);

    model.deliverObject("object-2");
    expect(model.getDeliveredItems()).toEqual(["object-1", "object-2"]);
    expect(model.allObjectsDelivered()).toBe(true);
  });

  it("resets state so a new run can start cleanly", () => {
    model.addObject("object-1");
    model.carryObject("object-1");
    model.deliverObject("object-1");
    model.setRunning(true);

    model.reset();

    expect(model.getDeliveredItems()).toEqual([]);
    expect(model.isRunning()).toBe(false);
    expect(model.isCarryingSomething()).toBe(false);
    expect(model.getCurrentlyCarriedItem()).toBeNull();
  });

  it("ignores carry attempts for unknown objects", () => {
    model.carryObject("ghost-item");

    expect(model.getCurrentlyCarriedItem()).toBeNull();
    expect(model.isCarryingSomething()).toBe(false);
  });

  it("gracefully handles drop attempts when nothing is carried", () => {
    model.addObject("object-1");

    const dropped = model.dropObject();
    expect(dropped).toBeNull();
    expect(model.isObjectIdle("object-1")).toBe(true);
    expect(model.isCarryingSomething()).toBe(false);
  });

  it("returns copies of delivered items so callers cannot mutate internal state", () => {
    model.addObject("object-1");
    model.deliverObject("object-1");

    const delivered = model.getDeliveredItems();
    delivered.push("mutated");

    expect(model.getDeliveredItems()).toEqual(["object-1"]);
  });

  it("tracks running state toggles without leaking values", () => {
    expect(model.isRunning()).toBe(false);

    model.setRunning(true);
    expect(model.isRunning()).toBe(true);

    model.setRunning(false);
    expect(model.isRunning()).toBe(false);
  });

  it("ignores deliver attempts for unknown objects", () => {
    model.deliverObject("ghost-item");

    expect(model.getDeliveredItems()).toEqual([]);
    expect(model.allObjectsDelivered()).toBe(true);
  });
});
