export class TableDto{
    constructor(columns?: string[],  name?: string){
        this.columns = columns || [];
        this.name = name || "";
    }
    columns: string[];
    name: string;
}