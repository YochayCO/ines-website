import { GraphData } from '../types/graph'
import { SurveyRow } from '../types/survey'

export function getGraphData(rows: SurveyRow[] | undefined, x: string, y: string): GraphData | undefined {
  if (!x || !y || !rows) return undefined

  return rows.map(row => ({ x: row[x].split('.')[0], y: Number(row[y].split('.')[0]) }))
}
