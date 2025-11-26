/// tests/pokemon.test.ts
import { describe, it, expect, beforeAll } from "vitest";
import { ChoiceDialogBox } from "../src/screens/MiniGame1/ChoiceDialogBox.ts";

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

describe("ChoiceDialogBox tests", () => {
  it("answers all questions correctly and checks incorrect set is empty", () => {
    const box = new ChoiceDialogBox();
    const totalQuestions = box.getTotalQuestionsCount(); // Based on the initializeQuestions array length

    for (let i = 0; i < totalQuestions; i++) {
      box.selectNewQuestion();
      const qa = box.getQuestionAndAnswers();
      expect(qa).not.toBeNull();
      expect(qa!.question.length).toBeGreaterThan(0);
      expect(qa!.answers.length).toBe(4);

      const correctText = box.getCorrectAnswer();
      expect(correctText).not.toBeNull();

      const correctIndex = qa!.answers.indexOf(correctText!);
      expect(correctIndex).toBeGreaterThanOrEqual(0);
      expect(correctIndex).toBeLessThan(qa!.answers.length);
      expect(box.isAnswerCorrect(correctIndex)).toBe(true);

      box.updateCurrentQuestionStatus(true);
    }

    // After answering all correctly, the incorrect questions set should be empty
    expect(box.getIncorrectQuestionsCount()).toBe(0);
    expect(box.getCorrectQuestionsCount()).toBe(totalQuestions);
  
    box.selectNewQuestion();
  });
  it("answers some questions incorrectly and checks incorrect set", () => {
    const box = new ChoiceDialogBox();
    const totalQuestions = box.getTotalQuestionsCount(); 
    let correctAnswers = 0;
    let incorrectAnswers = 0;

    for (let i = 0; i < totalQuestions; i++) {
      box.selectNewQuestion();
      const qa = box.getQuestionAndAnswers();
      expect(qa).not.toBeNull();
      expect(qa!.question.length).toBeGreaterThan(0);
      expect(qa!.answers.length).toBe(4);

      const correctText = box.getCorrectAnswer();
      expect(correctText).not.toBeNull();

      const correctIndex = qa!.answers.indexOf(correctText!);
      expect(correctIndex).toBeGreaterThanOrEqual(0);
      expect(correctIndex).toBeLessThan(qa!.answers.length);

      // Simulate answering: even index questions correctly, odd index incorrectly
      if (i % 2 === 0) {
        expect(box.isAnswerCorrect(correctIndex)).toBe(true);
        box.updateCurrentQuestionStatus(true);
        correctAnswers++;
      } else {
        const wrongIndex = (correctIndex + 1) % qa!.answers.length;
        expect(box.isAnswerCorrect(wrongIndex)).toBe(false);
        box.updateCurrentQuestionStatus(false);
        incorrectAnswers++;
      }
    }

    expect(box.getCorrectQuestionsCount()).toBe(correctAnswers);
    expect(box.getIncorrectQuestionsCount()).toBe(incorrectAnswers);
  });
  it("handles no current question gracefully", () => {
    let box = new ChoiceDialogBox();
    expect(box.getCorrectAnswer()).toBeNull();
    expect(box.getQuestionAndAnswers()).toBeNull();
    expect(box.isAnswerCorrect(0)).toBe(false);
    box.updateCurrentQuestionStatus(true); // Should not throw
    // box is null, should throw
    (box as any).currentQuestions = new Set();
    (box as any).incorrectQuestions = new Set();
    // This should never be reached in normal use, but test error handling
    expect(() => box.selectNewQuestion()).toThrowError();
  });
  it("expects a question to never be asked twice", () => {
    const box = new ChoiceDialogBox();
    let previousQuestion = "";
    // Very high number to ensure randomness covers all questions
    for (let i = 0; i < 100; i++) {
      box.selectNewQuestion();
      const qa = box.getQuestionAndAnswers();
      expect(qa).not.toBeNull();
      const currentQuestion = qa!.question;
      expect(currentQuestion).not.toBe(previousQuestion);
      box.updateCurrentQuestionStatus(true);
      previousQuestion = currentQuestion;
    }
    // Same thing, but now answer incorrectly
    for (let i = 0; i < 100; i++) {
      box.selectNewQuestion();
      const qa = box.getQuestionAndAnswers();
      expect(qa).not.toBeNull();
      const currentQuestion = qa!.question;
      expect(currentQuestion).not.toBe(previousQuestion);
      box.updateCurrentQuestionStatus(false);
      previousQuestion = currentQuestion;
    }
  });
});