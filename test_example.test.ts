// Test should always have a ".test.ts" extension
import { describe, it, expect } from "vitest";
// Just describes what test is running
describe("Example Test", () => {

  // Actually runs the test
  it("should just be true", () => {
    expect(true).toBeTruthy;
  });
});
