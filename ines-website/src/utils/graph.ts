import map from 'lodash/map'
import sum from 'lodash/sum'
import concat from 'lodash/concat'
import difference from 'lodash/difference'
import { BarGraphDatum, BubbleGraphSerie, SmartBoxPlotProps, SmartGraphProps, BubbleGraphDatumData, BubbleGraphDatum } from '../types/graph'
import SurveyDesign from './SurveyDesign'
import { sortByRate } from './survey'

export function getLabel (ans: string): string { return ans.split('. ')[1] || ans.split('. ')[0] }
export function getRate (ans: string): string { return ans.split('. ')[0] }
export function getGraphGroup (d: BarGraphDatum): string { return d.group }

export function getBubbleGraphData(
  { survey, x: xQuestionItem, y: yQuestionItem }: SmartBoxPlotProps
): BubbleGraphSerie[] {

  const graphData = survey.data.reduce((series: BubbleGraphSerie[], row) => {
    const yAns = row[yQuestionItem.column]
    const xAns = row[xQuestionItem.column]
    
    // Do not include invalid data (null values and such)
    if (typeof yAns !== 'string' || typeof xAns !== 'string') return series

    const serieId = getLabel(yAns)
    const xValue = getLabel(xAns)

    // If series does not exist - create it and go to next.
    const currSerie = series.find((ser) => ser.id === serieId)
    if (!currSerie) {
      // TODO: weight
      const serie = [{ id: serieId, origId: yAns, data: [{ x: xValue, y: 1, origX: xAns }] }]
      return series.concat(serie)
    }

    // If x does not exist for series - create it and go to next.
    const currX = currSerie.data.find(({ x }) => x === xValue)
    if (!currX?.y) {
      currSerie.data = currSerie.data.concat([{ x: xValue, y: 1, origX: xAns }])
      return series
    }

    // If x-serie pair exist - increment voteCount and go to next.
    currX.y++
    return series
  }, [])

  //
  // Fill empty cells section:
  //

  // Create a unique list of all x original values
  const dupOrigXs = graphData.map(
    (d) => d.data.map((xy: BubbleGraphDatum) => xy.origX)
  ).flat(2)
  const allOrigXs = Array.from(new Set(dupOrigXs))

  graphData.forEach(serie => {
    const existingXValues = serie.data.map((xy: BubbleGraphDatumData) => xy.origX)
    const newXs = difference(allOrigXs, existingXValues)
    const newXYs: BubbleGraphDatumData[] = newXs.map(origX => ({ x: getLabel(origX), y: 0, origX }))
    const data: BubbleGraphDatumData[] = concat(serie.data,newXYs)
    serie.data = data.sort((a, b) => sortByRate(a.origX, b.origX))
  })

  const sortedGraphData = graphData.sort((a, b) => sortByRate(b.origId, a.origId))
  
  // TODO: use weights here

  return sortedGraphData
}

export function getBarGraphData({ survey, x }: SmartGraphProps): BarGraphDatum[] {
  const surveyDesign = new SurveyDesign(survey.data, 'w_panel1')
  const weightedXs = surveyDesign.svytable(x.column)
  const totalXWeight = sum(Object.values(weightedXs))
  
  const barGraphData = map(weightedXs, (answerWeightedCount, ans) => {
    return { 
      group: x.type === 'category' ? getLabel(ans) : getRate(ans), 
      value: (answerWeightedCount / totalXWeight * 100).toFixed(2),
    }
  })
  const sortedData = barGraphData.sort(
    (a, b) => sortByRate(a.group, b.group)
  )

  return sortedData
}
