/**
 * 
 * EducationScreenModel
 * 
 * Contains data for the Education Screen. Contains an array with the lesson
 * image list and the index of the most recently unlocked lesson.
 * 
 */

export class EducationScreenModel{
    private lessons: string[] = [];
    private unlockedIdx: number;
    private imagePath: string = "./Lesson Images/";

    constructor(numOfLessons: number) {
        for (let i = 1; i <= numOfLessons; i++) {
            this.lessons.push(this.imagePath + "Lesson " + i + ".png");
        }
        this.unlockedIdx = -1;
    }

    setUnlockedIdx(index: number): void {
        this.unlockedIdx = index;
    }

    getUnlockedIdx(): number {
        return this.unlockedIdx;
    }

    getLessonImagePath(index: number): string {
        return this.lessons[index];
    }

}