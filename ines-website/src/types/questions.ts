export type Response = {
    value: number;
    count: number;
}

export interface QuestionInstance {
    survey: {
        id: string;
        date: string;
    } 
    responses: Response[];
  }
  
  export interface Answer {
    value: number;
    label?: string;
    isOther?: boolean;
  }
  
  export interface Question {
    id: string;
    hebTitle: string;
    engTitle: string;
    category: string;
    type: string;
    answers: Answer[];
  }
  