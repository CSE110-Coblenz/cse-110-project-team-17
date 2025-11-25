import { npc } from "../src/entities/npc.ts";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

type Spy = ReturnType<typeof vi.spyOn>;

// mock image for Konva
const mockKonvaImage = {} as any;

const INACTIVITY_LIMIT = 8000;
const PRE_ROBOT_MSG = "Don't forget to explore and find those robot parts!";
const POST_ROBOT_MSG = "Don't stop now! Let's keep exploring the other areas to unlock new capabilities.";
const WORKBENCH_HINT_MSG = "You have all the pieces! Head to the workbench with the '!' mark and press 'P' to assemble the robot.";


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
  describe("Inactivity Hint (Tutorial/Exploration Prompt)", () => {
    it("shows pre-robot inactivity hint (tutorial text) after enough idle time", () => {

      npcInstance.updateDialog(800, 800);
      expect(showDialogSpy).not.toHaveBeenCalled();

      vi.advanceTimersByTime(INACTIVITY_LIMIT + 100);
      npcInstance.updateDialog(800, 800);

      expect(showDialogSpy).toHaveBeenCalledWith(PRE_ROBOT_MSG, true);
    });

    it("shows workbench hint when parts are collected but robot is not built", () => {
      npcInstance.setAllPartsCollected(true);
      expect((npcInstance as any).robotBuilt).toBe(false); 
      
      npcInstance.updateDialog(800, 800);
      expect(showDialogSpy).not.toHaveBeenCalled();

      vi.advanceTimersByTime(INACTIVITY_LIMIT + 100);
      npcInstance.updateDialog(800, 800);

      expect(showDialogSpy).toHaveBeenCalledWith(WORKBENCH_HINT_MSG, true);
    });

    it("shows post-robot inactivity hint (exploration prompt) after enough idle time when robot is built", () => {
      npcInstance.setRobotBuilt(true);
      npcInstance.updateDialog(800, 800);
      expect(showDialogSpy).not.toHaveBeenCalled();

      vi.advanceTimersByTime(INACTIVITY_LIMIT + 100);
      npcInstance.updateDialog(800, 800);

      expect(showDialogSpy).toHaveBeenCalledWith(POST_ROBOT_MSG, true);
    });

    it("markActive starts linger instead of immediately hiding the inactivity hint", () => {
      const lingerDuration = 3000;
      vi.advanceTimersByTime(INACTIVITY_LIMIT + 100);
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

    it("setRobotBuilt updates the state correctly", () => {
      expect((npcInstance as any).robotBuilt).toBe(false);
      npcInstance.setRobotBuilt(true);
      expect((npcInstance as any).robotBuilt).toBe(true);
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
      vi.advanceTimersByTime(INACTIVITY_LIMIT + 10);
      npcInstance.updateDialog(500, 500);
      expect(showDialogSpy).toHaveBeenCalledTimes(1);

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
      expect(img.attrs.width).toBe(16);
      expect(img.attrs.height).toBe(16);
    });

    it("does not crash when triviaFacts = []", () => {
      npcInstance = new npc(400, 300, [], mockKonvaImage);
      expect(() => npcInstance.updateDialog(410, 310)).not.toThrow();
    });
  });
});