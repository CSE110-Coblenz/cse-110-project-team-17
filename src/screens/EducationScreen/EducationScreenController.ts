import { EducationScreenModel } from "./EducationScreenModel.ts";
import { audioManager } from "../../audioManager.ts";
import { EducationScreenView } from "./EducationScreenView.ts";

/**
 * EducationScreenController
 * 
 * Handles the education screen display logic.
 * 
 */
export class EducationScreenController {
    private view: EducationScreenView;
    private model: EducationScreenModel;
    private totalLessons = 7;
    private currLessonIdx;
    private onClose?: () => void;

    constructor() {
        this.view = new EducationScreenView(() => this.handleXClick(), () => this.handleLeftArrowClick(),
                                            () => this.handleRightArrowClick());
        this.model = new EducationScreenModel(this.totalLessons);
        this.currLessonIdx = -1;
    }

    private handleXClick(): void {
        this.view.hide();
        if (this.onClose) {
            this.onClose();
        }
    }

    private handleLeftArrowClick(): void {
        if (this.currLessonIdx > 0) {
            audioManager.playSfx("page_flip");
            this.currLessonIdx--;
            this.view.displayLesson(this.currLessonIdx, this.totalLessons,
                                    this.model.getLessonImagePath(this.currLessonIdx));   
        }
    }

    setOnClose(cb: () => void): void {
        this.onClose = cb;
    }

    private handleRightArrowClick(): void {
        if (this.currLessonIdx < this.model.getUnlockedIdx() && this.currLessonIdx < this.totalLessons - 1) {
            audioManager.playSfx("page_flip");
            this.currLessonIdx++;
            this.view.displayLesson(this.currLessonIdx, this.totalLessons, 
                                    this.model.getLessonImagePath(this.currLessonIdx));
        }
    }

    /**
     * Call this method when the player unlocks a new lesson. The lesson will be displayed on the screen.
     */
    unlockLesson(): boolean {
        const currIdx = this.model.getUnlockedIdx();
        let unlocked = false;
        if (currIdx < this.totalLessons - 1) {
            this.model.setUnlockedIdx(currIdx + 1);
            this.currLessonIdx = currIdx + 1;
            unlocked = true;
        }
        return unlocked;
    }

    openBook(): boolean {
        const unlocked = this.model.getUnlockedIdx();
        if (unlocked < 0) return false; // nothing unlocked yet
        this.currLessonIdx = unlocked;
        this.view.displayLesson(this.currLessonIdx, this.totalLessons,
                                this.model.getLessonImagePath(this.currLessonIdx));
        this.view.show(); // or switchToScreen({ type: "education" }) if you still want a full-screen swap
        return true;
    }


    getView(): EducationScreenView {
        return this.view;
    }
    
    show(): void {
        this.view.show();
    }

    hide(): void {
        this.view.hide();
    }
}
