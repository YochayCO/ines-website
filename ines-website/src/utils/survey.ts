import Papa from 'papaparse'
import { QuestionItem, Survey, SurveyMeta, SurveyMetaBase, SurveyRows } from '../types/survey'
import { getRate } from './graph'
import { fetchCSV, fetchJson } from './files'
import { SmartBubblePlotProps } from './bubbleGraph'
import { SmartBarPlotProps } from '../types/graph'

async function fetchSurveyDataById(id: string): Promise<SurveyRows> {
    const surveyDataFile = `/surveys_data/${id}.csv`
    const surveyDataText = await fetchCSV(surveyDataFile)
    
    return new Promise((resolve, reject) => {
        Papa.parse(surveyDataText, {
            header: true,
            skipEmptyLines: true,
            complete: ({ data, errors }) => {
                if (errors.length) console.error(errors)
                
                resolve(data as SurveyRows)
            },
            error: (error: Error) => reject(error),
        })
    })
}

// TODO: really fetch when I know the data format
async function getSurveyMetaById(id: string): Promise<SurveyMeta> {
    const [meta, questionItems] = await Promise.all([
        fetchJson(`/surveys_meta/${id}.json`),
        fetchJson(`/question_items/${id}.json`)
    ]);

    return { ...(meta as SurveyMetaBase), questionItems: questionItems as QuestionItem[] };
}

export async function fetchSurvey(surveyId: string): Promise<Survey | null> {
    if (!surveyId) return Promise.reject('Invalid surveyId')

    try {
        // Fetch CSV and JSON in parallel
        const [dataRes, metaRes] = await Promise.all([
            fetchSurveyDataById(surveyId),
            getSurveyMetaById(surveyId)
        ])

        const data = dataRes as SurveyRows
        const meta = metaRes
        return Promise.resolve({ data, meta })
    } catch (error) {
        console.error(error)
        // TODO: show user there was an error
        return Promise.resolve(null)
    }
}

export function sortByRate(ansA: string, ansB: string) {
    const [rateA, rateB] = [Number(getRate(ansA)), Number(getRate(ansB))]
    return rateA - rateB
}

// Null values and such
export function isCellAValidAnswer (ans: unknown): boolean {
    return (typeof ans === 'string' && ans.trim() !== '')
}

export function getBubbleGraphAnswers({ survey, x: xQuestionItem, y: yQuestionItem }: SmartBubblePlotProps) {
  const { x, y } = survey.data.reduce((sets, row) => {
    const xAns = row[xQuestionItem.questionSurveyId];
    const yAns = row[yQuestionItem.questionSurveyId];

    if (!isCellAValidAnswer(xAns) || !isCellAValidAnswer(yAns)) return sets;

    return { x: sets.x.add(xAns), y: sets.y.add(yAns) };
  }, { x: new Set<string>(), y: new Set<string>() });

  return { xAnswers: Array.from(x).sort(sortByRate), yAnswers: Array.from(y).sort(sortByRate) };
}

export function getBarGraphAnswers({ survey, x: xQuestionItem }: SmartBarPlotProps) {
    const xSet = survey.data.reduce((set, row) => {
        const xAns = row[xQuestionItem.questionSurveyId];

        if (!isCellAValidAnswer(xAns)) return set;

        return set.add(xAns);
    }, new Set<string>());
  
    return Array.from(xSet).sort(sortByRate);
}

export function getQuestionTitle(englishDescription: string, hebrewDescription: string): string {
    return `${englishDescription} / ${hebrewDescription}`
}
