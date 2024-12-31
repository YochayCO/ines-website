import { 
  BarGraphDatum,
  BubbleGraphSerie,
  BubbleGraphDatum,
  isBarGraphData,
  isBubbleGraphData,
} from '../types/graph'
import { SurveyRow, WeightName } from '../types/survey'

function getRateAndLabel (ans: string): string[] {
  return ans.replace(/[\s\u200B\u200E\u200F\u202A-\u202E]+/g, ' ').split('. ') 
}

export function getAnswerFromLabel(graphData: BubbleGraphSerie[], label: string): string | undefined {
  const answers = graphData[0].data.map((d: BubbleGraphDatum) => d.origX)
  const ans = answers.find(ans => getLabel(ans) === label)

  return ans
}

export function getXLabel(graphData: BubbleGraphSerie[] | BarGraphDatum[], index: number): string | undefined {
  if (isBubbleGraphData(graphData)) {
    const answers = graphData[0].data.map((d: BubbleGraphDatum) => d.origX)
    return answers[index]
  } else if (isBarGraphData(graphData)) {
    const answers = graphData.map((d: BarGraphDatum) => d.origGroup)
    return answers[index]
  }
}

export function getYLabel(graphData: BubbleGraphSerie[], index: number): string | undefined {
  const answers = graphData.map((d: BubbleGraphSerie) => d.origId)
  return answers[index]
}

// if answer has no label - rate is the label
export function getLabel (ans: string): string { 
  const [rate, label] = getRateAndLabel(ans)
  return label || rate
}
export function getRate (ans: string): string { 
  const [rate] = getRateAndLabel(ans)
  return rate 
}
export function getGraphGroup (d: BarGraphDatum): string { return d.group }

export function getNormalValues(answers: string[]): string[] {
  const rates = answers.map(ans => Number(getRate(ans)))
  rates.sort((a, b) => a - b)
  
  // Normal answers end on the first special answer (a numerical "jump")
  const firstSpecialIndex = rates.findIndex((rate, i, arr) => !(i === 0 || rate === arr[i-1] + 1))
  
  // If index === -1, There are no special values
  if (firstSpecialIndex !== -1) rates.splice(firstSpecialIndex)

  return answers.filter((ans) => rates.includes(Number(getRate(ans)))) 
}

export function getWeight ({ row, weightName, surveyWeights, isHidden, sectorFieldName }: { 
  row: SurveyRow;
  weightName: WeightName;
  surveyWeights?: Record<WeightName, string>;
  isHidden?: boolean;
  sectorFieldName?: string;
}) {
  const weightKey = surveyWeights?.[weightName]
  if (isHidden) return 0
  if (!weightKey) return 1

  // If selected weight name is not part of sector cell - the weight is 0 for this person. 
  const isWrongSector = (
    sectorFieldName && 
    row[sectorFieldName].toLowerCase().indexOf(weightKey) === -1
  )
  if (['jews', 'arabs'].includes(weightKey) && isWrongSector) return 0

  return Number(row[weightKey])
}
