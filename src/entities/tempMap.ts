export class Map {
    private mapName = '';
    private mapSize = 0;

    constructor(name: string, size: number) {
        this.mapName = name;
        this.mapSize = size;
    }

    getName(): string {
        return this.mapName;
    }

    getSize(): number {
        return this.mapSize;
    }
}