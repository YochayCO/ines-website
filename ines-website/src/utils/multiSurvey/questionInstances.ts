import { mockQuestionInstances } from './questions.mock';
import { QuestionInstance } from '../../types/questions';

/**
 * Fetches multiple surveys in parallel by their IDs.
 * In development or test, returns mock data if available.
 * @param surveyIds Array of survey IDs to fetch
 * @returns Promise resolving to array of Survey objects (or null if not found)
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function fetchQuestionInstances(_questionId: string): Promise<QuestionInstance[]> {
  return mockQuestionInstances;
}
