import { Question, QuestionInstance } from '../../types/questions';

export const mockQuestions: Question[] = [{ 
  id: 'category:::v20',
  hebTitle: 'גישה סוציאליסטית',
  category: 'category', 
  engTitle: 'Socialist attitude', 
  type: 'numeric', 
  answers: [
    { value: 1, label: 'Lowest' },
    { value: 2 },
    { value: 3 },
    { value: 4 },
    { value: 5, label: 'Highest' },
    { value: 99, label: 'Other', isOther: true },
  ] 
}];

export const mockQuestionInstances: QuestionInstance[] = [
  { 
    survey: {
      id: '2019', 
      date: '2019-01-01', 
    },
    responses: [
      { value: 1, count: 160 },
      { value: 2, count: 40 },
      { value: 3, count: 30 },
      { value: 4, count: 27 },
      { value: 5, count: 25 },
      { value: 99, count: 14 },
    ] 
  },
  { 
    survey: {
      id: '2021', 
      date: '2021-01-01', 
    },
    responses: [
      { value: 1, count: 49 },
      { value: 2, count: 20 },
      { value: 3, count: 30 },
      { value: 4, count: 97 },
      { value: 5, count: 15 },
      { value: 99, count: 0 },
    ] 
  },
  { 
    survey: {
      id: '2022', 
      date: '2022-01-01', 
    },
    responses: [
      { value: 1, count: 27 },
      { value: 2, count: 45 },
      { value: 3, count: 10 },
      { value: 4, count: 27 },
      { value: 5, count: 85 },
      { value: 99, count: 14 },
    ] 
  },
];
