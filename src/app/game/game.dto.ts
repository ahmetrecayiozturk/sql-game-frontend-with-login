export class GameDto {
    constructor(id: number, userId: number, name: string, createdAt: Date, isInitialized: boolean) {
        this.id = id;
        this.userId = userId;
        this.name = name;
        this.createdAt = createdAt;
        this.isInitialized = isInitialized;
    }
    id: number;
    userId: number;
    name: string
    createdAt: Date;
    isInitialized: boolean;
}