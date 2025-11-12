import type { ScreenSwitcher } from "../../types.ts";
import { EducationScreenModel } from "./EducationScreenModel.ts";
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
    private screenSwitcher: ScreenSwitcher;
    private totalLessons = 7;
    private currLessonIdx;

    constructor(screenSwitcher: ScreenSwitcher) {
        this.screenSwitcher = screenSwitcher;
        this.view = new EducationScreenView(() => this.handleXClick(), () => this.handleLeftArrowClick(),
                                            () => this.handleRightArrowClick());
        this.model = new EducationScreenModel(this.totalLessons);
        this.currLessonIdx = -1;
    }

    private handleXClick(): void {
        this.screenSwitcher.switchToScreen({type: "exploration"});
    }

    private handleLeftArrowClick(): void {
        if (this.currLessonIdx > 0) {
            this.currLessonIdx--;
            this.view.displayLesson(this.currLessonIdx, this.totalLessons,
                                    this.model.getLessonImagePath(this.currLessonIdx));
        }
    }

    private handleRightArrowClick(): void {
        if (this.currLessonIdx < this.model.getUnlockedIdx() && this.currLessonIdx < this.totalLessons - 1) {
            this.currLessonIdx++;
            this.view.displayLesson(this.currLessonIdx, this.totalLessons, 
                                    this.model.getLessonImagePath(this.currLessonIdx));
        }
    }

    /**
     * Call this method when the player unlocks a new lesson. The lesson will be displayed on the screen.
     */
    unlockLesson(): void {
        let currIdx = this.model.getUnlockedIdx();
        if (currIdx < this.totalLessons - 1) {
            this.model.setUnlockedIdx(currIdx + 1);
            this.currLessonIdx = currIdx + 1;
        }
        this.screenSwitcher.switchToScreen({type: "education"});
        this.view.displayLesson(this.currLessonIdx, this.totalLessons,
                                this.model.getLessonImagePath(this.currLessonIdx));
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