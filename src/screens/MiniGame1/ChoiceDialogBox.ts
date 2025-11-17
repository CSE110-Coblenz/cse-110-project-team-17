/**
 * Represents a single question with its answers and correct answer index.
 */
interface QuestionData {
  question: string;
  answers: string[];
  correctIndex: number;
}

/**
 * ChoiceDialogBox class for managing multiple-choice questions.
 * Each question has 4 unique answers, with one correct answer.
 */
export class ChoiceDialogBox {
  private questions: QuestionData[];
  private currentQuestion: QuestionData | null = null;
  private shuffledAnswers: string[] = [];
  private correctAnswerIndex: number = -1;

  constructor() {
    this.questions = this.initializeQuestions();
  }

  /**
   * Initializes the list of questions with example data.
   * Each question has a question string, 4 unique answers, and the index of the correct answer.
   */
  private initializeQuestions(): QuestionData[] {
    return [
      {
        question: "What is the capital of France?",
        answers: ["Paris", "London", "Berlin", "Madrid"],
        correctIndex: 0
      },
      {
        question: "Which planet is known as the Red Planet?",
        answers: ["Venus", "Mars", "Jupiter", "Saturn"],
        correctIndex: 1
      },
      {
        question: "What is 2 + 2?",
        answers: ["3", "4", "5", "6"],
        correctIndex: 1
      },
      {
        question: "Who wrote 'To Kill a Mockingbird'?",
        answers: ["Harper Lee", "J.K. Rowling", "Ernest Hemingway", "Mark Twain"],
        correctIndex: 0
      },
      {
        question: "What is the largest ocean on Earth?",
        answers: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"],
        correctIndex: 3
      }
    ];
  }

  /**
   * Selects a new random question from the list, shuffles the answers, and updates the current state.
   */
  selectNewQuestion(): void {
    if (this.questions.length === 0) {
      throw new Error("No questions available.");
    }

    const randomIndex = Math.floor(Math.random() * this.questions.length);
    this.currentQuestion = this.questions[randomIndex];

    // Shuffle the answers and track the new correct index
    const shuffled = [...this.currentQuestion.answers];
    this.shuffleArray(shuffled);

    this.shuffledAnswers = shuffled;
    this.correctAnswerIndex = shuffled.indexOf(this.currentQuestion.answers[this.currentQuestion.correctIndex]);
  }

  /**
   * Gets the current question and shuffled answers.
   * Returns null if no question is selected.
   */
  getQuestionAndAnswers(): { question: string; answers: string[] } | null {
    if (!this.currentQuestion) {
      return null;
    }

    return {
      question: this.currentQuestion.question,
      answers: this.shuffledAnswers
    };
  }

  /**
   * Checks if the selected answer index is correct.
   * @param selectedIndex The index of the selected answer (0-3).
   * @returns True if correct, false otherwise.
   */
  isAnswerCorrect(selectedIndex: number): boolean {
    return selectedIndex === this.correctAnswerIndex;
  }

  /**
   * Gets the correct answer text.
   * @returns The correct answer string, or null if no question is selected.
   */
  getCorrectAnswer(): string | null {
    if (!this.currentQuestion) {
      return null;
    }

    return this.currentQuestion.answers[this.currentQuestion.correctIndex];
  }

  /**
   * Utility function to shuffle an array in place using Fisher-Yates algorithm.
   */
  private shuffleArray(array: any[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
}
