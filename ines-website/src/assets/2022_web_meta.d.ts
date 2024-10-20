export interface QuestionItemBase {
    column: string; // TODO: column title or name, as written in survey table
    description: string;
    type: "quantity" | "category";
}

export interface CategoryQuestionItem extends QuestionItemBase {
    type: "category";
    values: {
        [key: number | string]: string;
    };
    special_responses: {
        [key: number | string]: Array<number>
    };
}

export interface QuantityQuestionItem extends QuestionItemBase {
    type: "quantity";
    range: {
        [key: number | string]: string;
    };
}

export type QuestionItem = CategoryQuestionItem | QuantityQuestionItem;

export interface SurveyMetadata {
    id: string;
    demography: {
        "Age Group": string;
        "Sex": string;
        "Education": string;
        "Religiousness": string;
        "Sector": string;
    };
    weights: {
        all: {
            pre?: string;
            post?: string;
        } | string;
        jews: {
            pre: string;
            post: string;
        } | string;
        arabs: {
            pre: string;
            post: string;
        } | string;
    };
    questions: {
        [key: number | string]: QuestionItem;
    }
}
