import Papa from 'papaparse'
import { QuestionItemOption, Survey, SurveyMeta, SurveyMetaBase, SurveyRows } from '../types/survey'
import { getRate } from './graph'
import { fetchCSV, fetchJson } from './files'

export function getQiOptions (meta: SurveyMeta): QuestionItemOption[] {
    if (!meta.hiddenQuestionItems?.length) return meta.questionItems
    
    return meta.questionItems.map(qi => {
        return {
            ...qi,
            disabled: meta.hiddenQuestionItems!.includes(qi.questionSurveyId),
        }
    })
}

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
  const meta = await fetchJson(`/surveys_meta/${id}.json`)
  const questionItems = await fetchJson(`/question_items/${id}.json`)
  
  return { ...(meta as SurveyMetaBase), questionItems } as SurveyMeta
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
