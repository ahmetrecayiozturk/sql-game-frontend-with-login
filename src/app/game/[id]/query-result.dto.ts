
export class QueryResultDto{
    constructor(columns?: string[], rows?: any[][], executionTime?: number, message?: string, success?: boolean){
        this.columns = columns;
        this.rows = rows;
        this.executionTime = executionTime || 0;
        this.success = success|| false;
        this.message = message;

    }
    columns?: string[];
    rows?: any[][];
    message?: string;
    executionTime: number;
    success: boolean;
}