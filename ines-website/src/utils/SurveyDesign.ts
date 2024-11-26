type DataRow = { [key: string]: string };

class SurveyDesign {
    private data: DataRow[];
    private weightsKey: string;

    constructor(data:DataRow[], weightsKey: string) {
        this.data = data.filter(row => row[weightsKey] !== null)
        this.weightsKey = weightsKey;

        // Ensure weightsKey exists in the dataset
        if (!data.every(row => weightsKey in row)) {
            throw new Error(`Missing weights column "${weightsKey}" in some rows`);
        }

        // Ensure no missing weights
        if (this.data.some(row => isNaN(Number(row[weightsKey])))) {
            throw new Error("Missing or invalid weights in the dataset");
        }
    }

    svytable(column: string): Record<string, number> {
        const weightedAnswerSums: Record<string, number> = {};
    
        this.data.forEach((row, rowNum) => {
            const ans = row[column];
            const weight = Number(row[this.weightsKey]);
    
            if (ans === null || isNaN(weight)) {
                throw new Error(`${rowNum}: Invalid data row: missing category or weight`);
            }

            if (!weightedAnswerSums[ans]) {
                weightedAnswerSums[ans] = 0
            }
    
            weightedAnswerSums[ans] += weight;
        });
        
        return weightedAnswerSums;
    }
}

export default SurveyDesign