import { describe, it, expect, beforeAll } from "vitest";
import { PokemonScreenModel } from "./PokemonScreenModel.ts";

beforeAll(() => {
    // Mock the Image class for Konva image loading
  (globalThis as any).Image = class {
    src = "";
  };
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
    expect(model.getBossHealth()).toBe(200);
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

  it("Checks to make sure each index of questions is correct", () => {
    const model = new PokemonScreenModel(800, 600);
    const qa = model.generateNextQuestion();
    const correctAnswerText = model.getCorrectAnswerText();
    const correctIndex = qa.answers.indexOf(correctAnswerText);
    // Check that the correct answer index is valid
    expect(correctIndex).toBeGreaterThanOrEqual(0);
    expect(correctIndex).toBeLessThan(qa.answers.length);
    // Check that the correct answer is identified correctly by the correct index
    expect(model.checkAnswer(correctIndex)).toBe(true);
    // Check incorrect answers
    for (let i = 0; i < qa.answers.length; i++) {
      if (i !== correctIndex) {
        // Make sure all the other answers are marked incorrect
        expect(model.checkAnswer(i)).toBe(false);
      }
    }
  });
});