type DataRow = { [key: string]: string };

class SurveyDesign {
    private data: DataRow[];
    private weightsKey?: string;
    public effectiveResponses: number = 0;

    constructor(data: DataRow[], weightsKey?: string) {
        if (!weightsKey) {
            this.data = data
            return
        }

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
        const weightedAnswerSums: Record<string, number> = {}
    
        this.data.forEach((row, rowNum) => {
            const ans = row[column];
            const weight = this.weightsKey ? Number(row[this.weightsKey]) : 1;
            
            // Ignore empty cells (some people were not asked this question)
            if (ans.trim() === '') return
    
            if (isNaN(weight)) {
                throw new Error(`${rowNum}: Invalid weight`);
            }

            if (!weightedAnswerSums[ans]) {
                weightedAnswerSums[ans] = 0
            }
    
            weightedAnswerSums[ans] += weight;
            this.effectiveResponses++
        });
        
        return weightedAnswerSums;
    }
}

export default SurveyDesign
