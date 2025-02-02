export type QuestionType = "demography" | "category";

export interface QuestionItem {
    id: string;
    questionHebrewDescription: string;
    englishDescription: string
    questionSurveyId: string;
    type: QuestionType;
    disabled?: boolean;
}

export type WeightName = 'all' | 'arabs' | 'jews'

export interface SurveyMetaBase {
    id: string;
    dataLink: string;
    weights?: Record<WeightName, string>;
    sectorFieldName?: string;
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
