import map from 'lodash/map'
import sum from 'lodash/sum'
import concat from 'lodash/concat'
import difference from 'lodash/difference'
import { 
  BarGraphDatum,
  BubbleGraphSerie,
  SmartBoxPlotProps,
  SmartGraphProps,
  BubbleGraphDatum,
  InitialBubbleGraphDatumData,
  InitialBubbleGraphDatum,
  InitialBubbleGraphSerie
} from '../types/graph'
import SurveyDesign from './SurveyDesign'
import { sortByRate } from './survey'

export function getLabel (ans: string): string { return ans.split('. ')[1] || ans.split('. ')[0] }
export function getRate (ans: string): string { return ans.split('. ')[0] }
export function getGraphGroup (d: BarGraphDatum): string { return d.group }

export function getBubbleGraphData(
  { survey, x: xQuestionItem, y: yQuestionItem }: SmartBoxPlotProps
): BubbleGraphSerie[] {
  const graphData = survey.data.reduce((series: InitialBubbleGraphSerie[], row) => {
    const yAns = row[yQuestionItem.questionSurveyId]
    const xAns = row[xQuestionItem.questionSurveyId]
    
    // Do not include invalid data (null values and such)
    if (typeof yAns !== 'string' || typeof xAns !== 'string') return series
    if (yAns.trim() === '' || xAns.trim() === '') return series
    
    const serieId = getLabel(yAns)
    const xValue = getLabel(xAns)
    const weight = survey.meta.weights.all ? Number(row[survey.meta.weights.all]) : 1

    // If series does not exist - create it and go to next.
    const currSerie = series.find((ser) => ser.id === serieId)
    if (!currSerie) {
      const serie = [{ id: serieId, origId: yAns, data: [{ x: xValue, y: weight, origX: xAns, origId: yAns }] }]
      return series.concat(serie)
    }

    // If x does not exist for series - create it and go to next.
    const currX = currSerie.data.find(({ x }) => x === xValue)
    if (!currX?.y) {
      currSerie.data = currSerie.data.concat([{ x: xValue, y: weight, origX: xAns, origId: yAns }])
      return series
    }

    // If x-serie pair exist - increment voteCount and go to next.
    currX.y += weight
    return series
  }, [])

  //
  // Fill empty cells section:
  //

  // Create a unique list of all x original values
  const dupOrigXs = graphData.map(
    (d) => d.data.map((xy: InitialBubbleGraphDatum) => xy.origX)
  ).flat(2)
  const allOrigXs = Array.from(new Set(dupOrigXs))

  graphData.forEach(serie => {
    const existingXValues = serie.data.map((xy: InitialBubbleGraphDatumData) => xy.origX)
    const newXs = difference(allOrigXs, existingXValues)
    const newXYs: InitialBubbleGraphDatumData[] = newXs.map(origX => 
      ({ x: getLabel(origX), y: 0, origX, origId: serie.origId }))

    const data: InitialBubbleGraphDatumData[] = concat(serie.data,newXYs)
    serie.data = data.sort((a, b) => sortByRate(a.origX, b.origX))
  })

  const sortedGraphData = graphData.sort((a, b) => sortByRate(a.origId, b.origId))

  //
  // Add percentages to data
  //
  
  // Sum up all the weights for each X and each serie (y param)
  let weightSum = 0
  const serieWeights = Array.from(sortedGraphData, () => 0)
  const xWeights = Array.from(allOrigXs, () => 0)
  
  sortedGraphData.forEach((serie, serieIndex) => {
    serie.data.forEach((datum: InitialBubbleGraphDatum, xIndex) => {
      weightSum += datum.y
      serieWeights[serieIndex] += datum.y
      xWeights[xIndex] += datum.y
    })
  })

  const finalGraphData: BubbleGraphSerie[] = sortedGraphData.map((serie, serieIndex) => {
    return {
      ...serie,
      data: serie.data.map((datum: InitialBubbleGraphDatum, xIndex): BubbleGraphDatum => {
        return {
          ...datum,
          y: Number((datum.y / weightSum * 100).toFixed(2)),
          yByX: Number((datum.y / xWeights[xIndex] * 100).toFixed(2)),
          yBySerie: Number((datum.y / serieWeights[serieIndex] * 100).toFixed(2)),
        }
      })
    }
  })

  return finalGraphData
}

export function getBarGraphData({ survey, x }: SmartGraphProps): BarGraphDatum[] {
  const surveyDesign = new SurveyDesign(survey.data, survey.meta.weights.all)
  const weightedXs = surveyDesign.svytable(x.questionSurveyId)
  const totalXWeight = sum(Object.values(weightedXs))
  
  const barGraphData = map(weightedXs, (answerWeightedCount, ans) => {
    return { 
      group: getLabel(ans), 
      origGroup: ans,
      value: (answerWeightedCount / totalXWeight * 100).toFixed(2),
    }
  })
  const sortedData = barGraphData.sort(
    (a, b) => sortByRate(a.origGroup, b.origGroup)
  )

  return sortedData
}
