import Konva from "konva";
import { STAGE_WIDTH, STAGE_HEIGHT } from "../../constants.ts";

/**
 * 
 * EducationScreenView
 * 
 * Places the educational images on the screen. Also places the clickable
 * arrows to flip pages and the 'x' button to close the window.
 * 
 */
export class EducationScreenView {
    private group: Konva.Group;
	private lessonImage: Konva.Image | null = null;
	private pageNum: Konva.Text;
	private imageDisplayWidth = STAGE_WIDTH - 250;
	private imageDisplayTopBuffer = 10;
	private imageDisplayBottomBuffer = 50;

    constructor(onXClick: () => void, onLeftArrowClick: () => void, onRightArrowClick: () => void) {
		this.group = new Konva.Group({ visible: false });

        // Background
		const bg = new Konva.Rect({
			x: 0,
			y: 0,
			width: STAGE_WIDTH,
			height: STAGE_HEIGHT,
			fill: "#FFFFFF",
		});
		this.group.add(bg);

        // X button (top-right)
        let xButtonWidth = 80;
        let xButtonHeight = 60;
        const XButtonGroup = new Konva.Group();
        const XButton = new Konva.Rect({
			x: STAGE_WIDTH - xButtonWidth,
			y: 0,   
			width: xButtonWidth,
			height: xButtonHeight,
			fill: "#e23737ff"
		});
        const XLabel = new Konva.Text({
			x: STAGE_WIDTH - xButtonWidth / 2,
			y: xButtonHeight / 2,
			text: "X",
			fontSize: 32,
			fontFamily: "Arial",
			fill: "white",
		});
        XLabel.offsetX(XLabel.width() / 2);
        XLabel.offsetY(XLabel.height() / 2);
        XButtonGroup.add(XButton);
        XButtonGroup.add(XLabel);
        XButtonGroup.on("click", onXClick);
		XButtonGroup.on('mouseover', function (e) {
			let x = e.target.getStage()
			if (x != null) {
				x.container().style.cursor = 'pointer';
			}
		});
		XButtonGroup.on('mouseout', function (e) {
			let x = e.target.getStage()
			if (x != null) {
				x.container().style.cursor = 'default';
			}
		});
		this.group.add(XButtonGroup);
        
        // Left Arrow
        let arrowBoxWidth = 50;
        let arrowBoxHeight = 90;
        let arrowBoxGap = 10;
        const leftArrowGroup = new Konva.Group();
        const leftArrowBox = new Konva.Rect({
			x: arrowBoxGap,
			y: STAGE_HEIGHT / 2 - arrowBoxHeight / 2,   
			width: arrowBoxWidth,
			height: arrowBoxHeight,
			fill: "#d2d2d2ff",
			stroke: '#7c7c7cff',
            strokeWidth: 3
		});
        let arrowBuffer = 15;
        const leftArrow = new Konva.Line({
			points: [arrowBoxGap + arrowBoxWidth - arrowBuffer, leftArrowBox.y() + arrowBuffer,
                    leftArrowBox.x() + arrowBuffer, leftArrowBox.y() + arrowBoxHeight / 2,
                    arrowBoxGap + arrowBoxWidth - arrowBuffer, leftArrowBox.y() + arrowBoxHeight - arrowBuffer],
            stroke: 'black',
            strokeWidth: 5,
            lineCap: 'round',
            lineJoin: 'round'
		});
        leftArrowGroup.add(leftArrowBox);
        leftArrowGroup.add(leftArrow);
        leftArrowGroup.on("click", onLeftArrowClick);
		leftArrowGroup.on('mouseover', function (e) {
			let x = e.target.getStage()
			if (x != null) {
				x.container().style.cursor = 'pointer';
			}
		});
		leftArrowGroup.on('mouseout', function (e) {
			let x = e.target.getStage()
			if (x != null) {
				x.container().style.cursor = 'default';
			}
		});
		this.group.add(leftArrowGroup);

		// Right Arrow
        const rightArrowGroup = new Konva.Group();
        const rightArrowBox = new Konva.Rect({
			x: STAGE_WIDTH - arrowBoxGap - arrowBoxWidth,
			y: STAGE_HEIGHT / 2 - arrowBoxHeight / 2,   
			width: arrowBoxWidth,
			height: arrowBoxHeight,
			fill: "#d2d2d2ff",
			stroke: '#7c7c7cff',
            strokeWidth: 3
		});
        const rightArrow = new Konva.Line({
			points: [STAGE_WIDTH - arrowBoxGap - arrowBoxWidth + arrowBuffer, leftArrowBox.y() + arrowBuffer,
                    STAGE_WIDTH - leftArrowBox.x() - arrowBuffer, leftArrowBox.y() + arrowBoxHeight / 2,
                    STAGE_WIDTH - arrowBoxGap - arrowBoxWidth + arrowBuffer, leftArrowBox.y() + arrowBoxHeight - arrowBuffer],
            stroke: 'black',
            strokeWidth: 5,
            lineCap: 'round',
            lineJoin: 'round'
		});
        rightArrowGroup.add(rightArrowBox);
        rightArrowGroup.add(rightArrow);
        rightArrowGroup.on("click", onRightArrowClick);
		rightArrowGroup.on('mouseover', function (e) {
			let x = e.target.getStage()
			if (x != null) {
				x.container().style.cursor = 'pointer';
			}
		});
		rightArrowGroup.on('mouseout', function (e) {
			let x = e.target.getStage()
			if (x != null) {
				x.container().style.cursor = 'default';
			}
		});
		this.group.add(rightArrowGroup);

		const textBox = new Konva.Text({
			x: STAGE_WIDTH / 2,
			y: STAGE_HEIGHT - 40,
			text: "null",
			fontSize: 32,
			fontFamily: "Arial",
			fill: "black",
		});
		textBox.offsetX(textBox.width() / 2);
        textBox.offsetY(textBox.height() / 2);
		this.pageNum = textBox;
		this.group.add(this.pageNum);
	}

    displayLesson(currLessonIdx: number, maxLessonNum: number, path: string): void {
		// Display Lesson Image
		this.lessonImage?.destroy();
		this.changeText("Lesson " + (currLessonIdx + 1) + "/" + maxLessonNum);
        Konva.Image.fromURL(path, (image) => {
			this.lessonImage = image;
			this.lessonImage.offsetX(this.lessonImage.width() / 2)
			.offsetY(0);
			this.lessonImage.x(STAGE_WIDTH / 2).y(this.imageDisplayTopBuffer);
			let imageDisplayHeight = STAGE_HEIGHT - this.imageDisplayBottomBuffer - this.imageDisplayTopBuffer;
			/**
			 * Try scaling the image by matching the width to the max image display width. If the image is still
			 * too tall, scale the image by matching the height to the max image display height. Otherwise,
			 * scale the image by matching the width to the max image display width.
			 */
			if (this.lessonImage.height() * this.imageDisplayWidth / this.lessonImage.width() > imageDisplayHeight) {
				this.lessonImage.scaleX(imageDisplayHeight / this.lessonImage.height());
				this.lessonImage.scaleY(imageDisplayHeight / this.lessonImage.height());
			} else {
				this.lessonImage.scaleX(this.imageDisplayWidth / this.lessonImage.width());
				this.lessonImage.scaleY(this.imageDisplayWidth / this.lessonImage.width());
			}
			this.group.add(this.lessonImage);
			this.lessonImage.moveToBottom();
			this.lessonImage.moveUp();
		});
		this.group.getLayer()?.draw();
    }

	private changeText(input: string): void {
		this.pageNum.text(input);
		this.pageNum.offsetX(this.pageNum.width() / 2);
		this.pageNum.offsetY(this.pageNum.height() / 2);
	}

	/**
	 * Show the screen
	 */
	show(): void {
		this.group.visible(true);
		this.group.getLayer()?.draw();
	}

	/**
	 * Hide the screen
	 */
	hide(): void {
		this.group.visible(false);
		this.group.getLayer()?.draw();
	}

	getGroup(): Konva.Group {
		return this.group;
	}
}