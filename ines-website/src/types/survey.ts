export type QuestionType = "demography" | "category";

export interface QuestionItem {
    column: string;
    description: string;
    type: QuestionType;
}

export interface SurveyMeta {
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

export interface SurveyRow {
    [columnTitle: string]: string;
}

export type SurveyRows = SurveyRow[];

export type Survey = {
    data: SurveyRows;
    meta: SurveyMeta;
}

// Option for survey select element
export type SurveyOption = {
    id: string;
    name: string;
}
