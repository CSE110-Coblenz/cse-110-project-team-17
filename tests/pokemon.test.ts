/// tests/pokemon.test.ts
import { describe, it, expect, beforeAll } from "vitest";

let PokemonScreenModel: typeof import("../src/screens/MiniGame1/PokemonScreenModel.ts").PokemonScreenModel;

beforeAll(async () => {
  class AudioStub {
    src = "";
    loop = false;
    volume = 1;
    currentTime = 0;
    play = () => Promise.resolve();
    pause = () => {};
  }
  (globalThis as any).Audio = AudioStub;
  (globalThis as any).Image = class { src = ""; };

  ({ PokemonScreenModel } = await import("../src/screens/MiniGame1/PokemonScreenModel.ts"));
});

describe("PokemonScreenModel tests", () => {
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

  it("attacks the boss until its health is zero", () => {
    const model = new PokemonScreenModel(800, 600);
    model.dealDamageToBoss(200);
    expect(model.getBossHealth()).toBe(0);
    expect(model.isBossDefeated()).toBe(true);
    model.resetBoss();
    expect(model.getBossHealth()).toBe(200);
  });

  it("provides a question with answers", () => {
    const model = new PokemonScreenModel(800, 600);
    const qa = model.generateNextQuestion();
    expect(qa.question.length > 0).toBe(true);
    expect(qa.answers.length > 0).toBe(true);
  });

  it("verifies correct answer index and scoring", () => {
    const model = new PokemonScreenModel(800, 600);
    const qa = model.generateNextQuestion();
    const correctText = model.getCorrectAnswerText();
    const correctIndex = qa.answers.indexOf(correctText);

    expect(correctIndex).toBeGreaterThanOrEqual(0);
    expect(correctIndex).toBeLessThan(qa.answers.length);
    expect(model.checkAnswer(correctIndex)).toBe(true);

    for (let i = 0; i < qa.answers.length; i++) {
      if (i !== correctIndex) {
        expect(model.checkAnswer(i)).toBe(false);
      }
    }
  });
});
