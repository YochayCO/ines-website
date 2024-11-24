import Papa, { ParseError } from 'papaparse'
import { Survey, SurveyMeta, SurveyRows } from '../types/survey'

async function fetchSurveyDataById(id: string): Promise<SurveyRows> {
    return new Promise((resolve, reject) => {
        // TODO: construct all of the url (make id include more of it / use id dictionary)
        const url = `/wp-content/uploads/2024/10/${id}_STATA.csv`
        
        Papa.parse(url, {
            download: true,
            header: true,
            complete: ({ data, errors }) => {
                const cleanedData = cleanSurvey(data as SurveyRows, errors)
                resolve(cleanedData)
            },
            error: (error) => reject(error),
        })
    })
}

// TODO: really fetch when I know the data format
async function getSurveyMetaById(id: string): Promise<SurveyMeta> {
  const data = await import(`../assets/surveys_meta/${id}.json`)
  return data.default as SurveyMeta
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

export function cleanSurvey (data: SurveyRows, errors: ParseError[]) {
    const invalidRows: number[] = []
    errors.forEach(e => {
        if (e.code === 'TooFewFields' && e.row) {
            invalidRows.unshift(e.row)
        }
    })
    invalidRows.forEach(row => {
        delete data[row]
    })

    return data
}
export function sortSurveyColumn(arr: string[], isQuantitative: boolean): string[] {
    return arr.sort((a, b) => {
        if (isQuantitative) {
            const [numA, numB] = [Number(a), Number(b)]
            return Number(numA) - Number(numB)
        } else {
            return a.localeCompare(b)
        }
    })
}

export function sortSurveyRowsByColumn<T extends Record<string, unknown>>(
    rows: T[],
    column: keyof T,
    isQuantitative: boolean
): T[] {
    return rows.sort((a,b) => smartSort(a[column],b[column], isQuantitative))
}

export function smartSort(a: unknown, b: unknown, isQuantitative: boolean) {
    if (isQuantitative) {
        const [numA, numB] = [Number(a), Number(b)]
        return Number(numA) - Number(numB)
    } else {
        return (a as string).localeCompare(b as string)
    }
}
