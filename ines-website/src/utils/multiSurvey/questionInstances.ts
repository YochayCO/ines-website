import { mockQuestionInstances } from './questions.mock';
import { QuestionInstance } from '../../types/questions';

/**
 * Fetches multiple surveys in parallel by their IDs.
 * In development or test, returns mock data if available.
 * @param surveyIds Array of survey IDs to fetch
 * @returns Promise resolving to array of Survey objects (or null if not found)
 */
export async function fetchQuestionInstances(questionId: string): Promise<QuestionInstance[]> {
  return mockQuestionInstances;
}
