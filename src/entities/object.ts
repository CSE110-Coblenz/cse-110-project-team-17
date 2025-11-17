import { BaseEntity } from './base';
import Konva from 'konva';

/**
 * GameObject - Represents static or interactive objects in the game
 * Examples: doors, keys, chests, obstacles, collectibles, etc.
 */
export class GameObject extends BaseEntity {
    private group: Konva.Group;
    private sprite: Konva.Image | Konva.Rect | null = null;
    private interactable: boolean;
    private collected: boolean = false;
    private currentImage: Konva.Image | null = null;
    private size = { width: 40, height: 40 };
    private cubeSize = { width: 42, height: 42 };
    private textSize: { width: number; height: number } | null = null;
    private placeholder: Konva.Rect | null = null;
    private textWrapper: Konva.Group | null = null;
    private textBackground: Konva.Rect | null = null;

    constructor(
        name: string, 
        x: number = 0, 
        y: number = 0,
        interactable: boolean = false
    ) {
        super(name);
        this.interactable = interactable;
        
        this.group = new Konva.Group({ x, y });
        this.createSprite();
    }

    /**
     * Create the visual representation of the object
     */
    private createSprite(): void {
        // Placeholder - replace with actual image loading
        this.placeholder = new Konva.Rect({
            x: 0,
            y: 0,
            width: this.cubeSize.width,
            height: this.cubeSize.height,
            fill: '#1f2933',
            stroke: '#5ac8fa',
            strokeWidth: 2,
            cornerRadius: 6,
        });
        this.group.add(this.placeholder);
        this.sprite = this.placeholder;
        this.size = { ...this.cubeSize };
    }

    /**
     * Load object image from URL or HTMLImageElement
     */
    async loadImage(imageSource: string | HTMLImageElement): Promise<void> {
        if (typeof imageSource === 'string') {
            // Load from URL
            return new Promise((resolve) => {
                Konva.Image.fromURL(imageSource, (image) => {
                    if (this.sprite) {
                        this.sprite.destroy();
                    }
                    this.sprite = image;
                    this.currentImage = image;
                    this.group.add(image);
                    this.size = { width: image.width(), height: image.height() };
                    resolve();
                });
            });
        } else {
            // Load from HTMLImageElement
            if (this.sprite) {
                this.sprite.destroy();
            }
            this.currentImage = new Konva.Image({
                x: 0,
                y: 0,
                width: 40,
                height: 40,
                image: imageSource,
            });
            this.sprite = this.currentImage;
            this.group.add(this.currentImage);
            this.size = { width: this.currentImage.width(), height: this.currentImage.height() };
        }
    }

    /**
     * Replace the sprite with a block of text (used for drag-and-drop snippets)
     */
    setTextSprite(
        text: string,
        options: {
            width?: number;
            padding?: number;
            fontSize?: number;
            fontFamily?: string;
            textColor?: string;
            backgroundColor?: string;
            borderColor?: string;
            align?: 'left' | 'center' | 'right';
        } = {}
    ): void {
        const {
            width = 320,
            padding = 10,
            fontSize = 18,
            fontFamily = 'Courier New',
            textColor = 'white',
            backgroundColor = '#14213d',
            borderColor = '#5ac8fa',
            align = 'left',
        } = options;

        if (!this.placeholder) {
            this.createSprite();
        }

        if (this.textWrapper) {
            this.textWrapper.destroy();
            this.textWrapper = null;
            this.textBackground = null;
        }

        const textNode = new Konva.Text({
            x: padding,
            y: padding,
            text,
            fontSize,
            fontFamily,
            fill: textColor,
            width: width - padding * 2,
            align,
        });

        const totalHeight = textNode.height() + padding * 2;

        const background = new Konva.Rect({
            x: 0,
            y: 0,
            width,
            height: totalHeight,
            cornerRadius: 6,
            fill: backgroundColor,
            stroke: borderColor,
            strokeWidth: 2,
        });

        const wrapper = new Konva.Group({ visible: false });
        wrapper.add(background);
        wrapper.add(textNode);

        this.group.add(wrapper);
        this.textWrapper = wrapper;
        this.textBackground = background;
        this.textSize = { width, height: totalHeight };
        this.showCubeAppearance();
    }

    /**
     * Get the current image (for rendering)
     */
    getCurrentImage(): Konva.Image | Konva.Rect | null {
        return this.sprite;
    }

    /**
     * Move the object to a specific position
     */
    moveTo(x: number, y: number): void {
        this.group.position({ x, y });
    }

    /**
     * Check if the object is interactable
     */
    isInteractable(): boolean {
        return this.interactable;
    }

    /**
     * Set interactable status
     */
    setInteractable(interactable: boolean): void {
        this.interactable = interactable;
    }

    /**
     * Mark object as collected
     */
    collect(): void {
        this.collected = true;
        this.hide();
    }

    /**
     * Check if object has been collected
     */
    isCollected(): boolean {
        return this.collected;
    }

    /**
     * Interact with the object
     * Override this method in subclasses for specific behavior
     */
    interact(): void {
        if (this.interactable && !this.collected) {
            // Default interaction behavior
            console.log(`Interacting with ${this.getName()}`);
        }
    }

    /**
     * Show the object
     */
    show(): void {
        this.group.visible(true);
    }

    /**
     * Hide the object
     */
    hide(): void {
        this.group.visible(false);
    }

    /**
     * Clean up resources
     */
    destroy(): void {
        this.group.destroy();
    }

    /**
     * Get the object's group (for advanced operations like collision detection)
     */
    getGroup(): Konva.Group {
        return this.group;
    }

    /**
     * Get position
     */
    getPosition(): { x: number; y: number } {
        return this.group.position();
    }

    /**
     * Return current rendered size (useful for aligning drop slots)
     */
    getSize(): { width: number; height: number } {
        return this.size;
    }

    /**
     * Update highlight styling for text blocks
     */
    setHighlight(status: 'idle' | 'correct' | 'incorrect'): void {
        const strokeColor =
            status === 'correct' ? '#22d3ee' : status === 'incorrect' ? '#fb7185' : '#5ac8fa';
        const strokeWidth = status === 'idle' ? 2 : 3;

        const targets = [this.placeholder, this.textBackground].filter(Boolean) as Konva.Rect[];
        for (const node of targets) {
            node.stroke(strokeColor);
            node.strokeWidth(strokeWidth);
        }
    }

    showCubeAppearance(): void {
        if (this.placeholder) this.placeholder.visible(true);
        if (this.textWrapper) this.textWrapper.visible(false);
        this.sprite = this.placeholder;
        this.size = { ...this.cubeSize };
    }

    showTextAppearance(): void {
        if (this.textWrapper) this.textWrapper.visible(true);
        if (this.placeholder) this.placeholder.visible(false);
        if (this.textBackground) this.sprite = this.textBackground;
        if (this.textSize) {
            this.size = { ...this.textSize };
        }
    }
}
