export type QuestionType = "demography" | "category";

export interface QuestionItem {
    id: string;
    questionHebrewDescription: string;
    questionSurveyId: string;
    type: QuestionType;
}

export interface SurveyMetaBase {
    id: string;
    weights: {
        all?: string;
        jews?: string;
        arabs?: string;
    };
}

export interface SurveyMeta extends SurveyMetaBase {
    questionItems: QuestionItem[]
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
