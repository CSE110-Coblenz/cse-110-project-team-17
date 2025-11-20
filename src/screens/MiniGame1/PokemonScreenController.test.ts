import { describe, it, expect, beforeAll } from "vitest";
import { PokemonScreenModel } from "./PokemonScreenModel.ts";

beforeAll(() => {
  (globalThis as any).Image = class {
    src = "";
  };
});

describe("PokemonScreenModel", () => {
  it("starts with running set to false", () => {
    const model = new PokemonScreenModel(800, 600);
    expect(model.isRunning()).toBe(false);
    model.setRunning(true);
    expect(model.isRunning()).toBe(true);
  });

  it("reduces and restores boss health", () => {
    const model = new PokemonScreenModel(800, 600);
    expect(model.getBossHealth()).toBe(200);
    model.dealDamageToBoss(50);
    expect(model.getBossHealth()).toBe(150);
    model.resetBoss();
    expect(model.getBossHealth()).toBe(200);
  });

  it("provides a question with answers", () => {
    const model = new PokemonScreenModel(800, 600);
    const qa = model.generateNextQuestion();
    expect(qa.question.length > 0).toBe(true);
    expect(qa.answers.length > 0).toBe(true);
  });
});