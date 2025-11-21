import { npc } from "./src/entities/npc.js";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

type Spy = ReturnType<typeof vi.spyOn>;

// mock image for Konva
const mockKonvaImage = {} as any;

describe("NPC Logic Tests", () => {
  let npcInstance: npc;
  let showDialogSpy: Spy;
  let hideDialogSpy: Spy;

  const trivia = [
    "The 'Pokemon Battle' style mini-game uses the very same logic engine you are trying to repair.",
    "Every snippet of code you find represents a memory fragment from the Robot's original AI.",
  ];

  beforeEach(() => {
    npcInstance = new npc(400, 300, trivia, mockKonvaImage);

    // Correct spy setup (NO override for hideDialog)
    showDialogSpy = vi.spyOn(npcInstance as any, "showDialog").mockImplementation(() => {});
    hideDialogSpy = vi.spyOn(npcInstance as any, "hideDialog");

    vi.useFakeTimers();
  });

  afterEach(() => {
    showDialogSpy.mockRestore();
    hideDialogSpy.mockRestore();
    vi.useRealTimers();
  });

  // proximity trivia
  describe("Proximity Trivia", () => {
    it("shows a randomized sticky trivia when close", () => {
      npcInstance.updateDialog(410, 310);

      expect(showDialogSpy).toHaveBeenCalledTimes(1);
      const shown = showDialogSpy.mock.calls[0][0];
      expect(trivia).toContain(shown);
    });

    it("keeps showing the SAME sticky trivia while player remains close", () => {
      npcInstance.updateDialog(410, 310);
      const first = showDialogSpy.mock.calls[0][0];

      npcInstance.updateDialog(420, 300);
      expect(showDialogSpy).toHaveBeenLastCalledWith(first);
    });

    it("calls hideDialog when player moves far away", () => {
      npcInstance.updateDialog(410, 310);
      npcInstance.updateDialog(800, 800);

      expect(hideDialogSpy).toHaveBeenCalledTimes(1);
    });
  });


  // inactivity hint
  describe("Inactivity Hint", () => {
    it("shows inactivity hint after enough idle time", () => {
      const limit = 8000;
      const msg = "Don't forget to explore and find those robot parts!";

      npcInstance.updateDialog(800, 800);
      expect(showDialogSpy).not.toHaveBeenCalled();

      vi.advanceTimersByTime(limit + 100);
      npcInstance.updateDialog(800, 800);

      expect(showDialogSpy).toHaveBeenCalledWith(msg, true);
    });

    it("markActive starts linger instead of immediately hiding the inactivity hint", () => {
      const limit = 8000;
      const lingerDuration = 3000; 
      vi.advanceTimersByTime(limit + 100);
      npcInstance.updateDialog(800, 800);
      expect(showDialogSpy).toHaveBeenCalled();
      expect(hideDialogSpy).not.toHaveBeenCalled();
      npcInstance.markActive();
      expect(hideDialogSpy).not.toHaveBeenCalled();
      vi.advanceTimersByTime(lingerDuration + 10);
      npcInstance.updateDialog(800, 800); 
      expect(hideDialogSpy).toHaveBeenCalledTimes(1);
    });
  });

  // urgent dialog
  describe("Urgent Dialog", () => {
    it("shows robot completion message", () => {
      npcInstance.showUrgentDialog("Robot complete!");
      expect(showDialogSpy).toHaveBeenCalledWith("Robot complete!", true);
    });

    it("shows boundary warning message", () => {
      npcInstance.showUrgentDialog("Can't go there!");
      expect(showDialogSpy).toHaveBeenCalledWith("Can't go there!", true);
    });
  });


  describe("NPC State", () => {
    it("initializes X and Y", () => {
      expect((npcInstance as any).x).toBe(400);
      expect((npcInstance as any).y).toBe(300);
    });
  });

  describe("Additional NPC Behavior Tests", () => {
    beforeEach(() => {
      npcInstance = new npc(400, 300, ["A", "B", "C"], mockKonvaImage);

      showDialogSpy = vi.spyOn(npcInstance as any, "showDialog").mockImplementation(() => {});
      hideDialogSpy = vi.spyOn(npcInstance as any, "hideDialog");

      vi.useFakeTimers();
    });

    afterEach(() => {
      showDialogSpy.mockRestore();
      hideDialogSpy.mockRestore();
      vi.useRealTimers();
    });

    it("resets stickyTrivia after hideDialog", () => {
      npcInstance.updateDialog(410, 310);
      npcInstance.updateDialog(800, 800);

      expect(hideDialogSpy).toHaveBeenCalledTimes(1);
      expect((npcInstance as any).stickyTrivia).toBeNull();
    });

    it("does NOT show proximity trivia if hint is active", () => {
      const limit = 8000;

      vi.advanceTimersByTime(limit + 10);
      npcInstance.updateDialog(500, 500);

      // Only hint shown so far
      expect(showDialogSpy).toHaveBeenCalledTimes(1);

      // Player gets close — should NOT override hint
      npcInstance.updateDialog(410, 310);
      expect(showDialogSpy).toHaveBeenCalledTimes(1);
    });

    it("urgent dialog overrides everything", () => {
      npcInstance.updateDialog(410, 310);

      npcInstance.showUrgentDialog("WARNING!");
      expect(showDialogSpy).toHaveBeenCalledWith("WARNING!", true);
    });

    it("calls hideDialog once PER update while player stays far", () => {
      npcInstance.updateDialog(800, 800);
      npcInstance.updateDialog(820, 820);
      npcInstance.updateDialog(900, 900);

      // Expected: 3 calls (far each time)
      expect(hideDialogSpy).toHaveBeenCalledTimes(3);
    });

    it("returns correct dialog position", () => {
      const pos = npcInstance.getDialogPosition();
      expect(pos).toEqual({ x: 300, y: 210 });
    });

    it("initializes Konva image correctly", () => {
      const img = npcInstance.getCurrentImage();
      expect(img.attrs.x).toBe(400);
      expect(img.attrs.y).toBe(300);
      expect(img.attrs.width).toBe(48);
      expect(img.attrs.height).toBe(48);
    });

    it("does not crash when triviaFacts = []", () => {
      npcInstance = new npc(400, 300, [], mockKonvaImage);
      expect(() => npcInstance.updateDialog(410, 310)).not.toThrow();
    });
  });
});
