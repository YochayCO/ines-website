import map from 'lodash/map'
import sum from 'lodash/sum'
import concat from 'lodash/concat'
import difference from 'lodash/difference'
import { 
  BarGraphDatum,
  BubbleGraphSerie,
  SmartBubblePlotProps,
  SmartGraphProps,
  BubbleGraphDatum,
  InitialBubbleGraphDatum,
  InitialBubbleGraphSerie,
  BubbleGraphConfig,
  BarGraphConfig,
} from '../types/graph'
import SurveyDesign from './SurveyDesign'
import { sortByRate } from './survey'
import { SurveyRow } from '../types/survey'

function getRateAndLabel (ans: string): string[] {
  return ans.replace(/[\s\u200B\u200E\u200F\u202A-\u202E]+/g, ' ').split('. ') 
}

export function getAnswerFromLabel(graphData: BubbleGraphSerie[], label: string): string | undefined {
  const answers = graphData[0].data.map((d: BubbleGraphDatum) => d.origX)
  const ans = answers.find(ans => getLabel(ans) === label)

  return ans
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

// Normal answers end on the first special answer (a numerical "jump")
function getNormalValues(answers: string[]): string[] {
  const rates = answers.map(ans => Number(getRate(ans)))
  rates.sort((a, b) => a - b)

  const firstSpecialIndex = rates.findIndex((rate, i, arr) => !(i === 0 || rate === arr[i-1] + 1))
  rates.splice(firstSpecialIndex)

  return answers.filter((ans) => rates.includes(Number(getRate(ans)))) 
}

function getWeight (row: SurveyRow, weightKey?: string, isHidden?: boolean) {
  if (isHidden) return 0

  return weightKey ? Number(row[weightKey]) : 1
}

export function getBubbleGraphData(
  { survey, x: xQuestionItem, y: yQuestionItem }: SmartBubblePlotProps,
  options: BubbleGraphConfig,
): BubbleGraphSerie[] {
  const ySet = new Set<string>()
  const xSet = new Set<string>()

  //
  // Calculate cell weights, build table structure
  //
  let graphData = survey.data.reduce((series: InitialBubbleGraphSerie[], row) => {
    const yAns = row[yQuestionItem.questionSurveyId]
    const xAns = row[xQuestionItem.questionSurveyId]
    
    // Do not include invalid data (null values and such)
    if (typeof yAns !== 'string' || typeof xAns !== 'string') return series
    if (yAns.trim() === '' || xAns.trim() === '') return series

    ySet.add(yAns)
    xSet.add(xAns)
    
    const serieId = getLabel(yAns)
    const xValue = getLabel(xAns)
    const weight = getWeight(
      row, survey.meta.weights.all, options.hiddenAnswers.includes(xAns)
    )

    // If series does not exist - create it and go to next.
    const currSerie = series.find((ser) => ser.id === serieId)
    if (!currSerie) {
      const serie = [{ id: serieId, origId: yAns, data: [{ x: xValue, y: weight, origX: xAns, origId: yAns }] }]
      return series.concat(serie)
    }

    // If x does not exist for series - create it and go to next.
    const currDatum = currSerie.data.find(({ x }) => x === xValue) as InitialBubbleGraphDatum | undefined
    if (currDatum === undefined) {
      currSerie.data = currSerie.data.concat([{ x: xValue, y: weight, origX: xAns, origId: yAns }])
      return series
    }

    // If x-serie pair exist - increment voteCount and go to next.
    currDatum.y += weight
    return series
  }, [])

  const yAnswers = Array.from(ySet)
  const yNormalAnswers = getNormalValues(yAnswers)
  const xAnswers = Array.from(xSet)
  const xNormalAnswers = getNormalValues(xAnswers)

  //
  // Fill empty cells in table:
  //
  graphData.forEach(serie => {
    const existingXValues = serie.data.map((d: InitialBubbleGraphDatum) => d.origX)
    const newXs = difference(xAnswers, existingXValues)
    const newXYs: InitialBubbleGraphDatum[] = newXs.map(origX => 
      ({ x: getLabel(origX), y: 0, origX, origId: serie.origId }))

    const data: InitialBubbleGraphDatum[] = concat(serie.data,newXYs)
    serie.data = data.sort((a, b) => sortByRate(a.origX, b.origX))
  })

  graphData.sort((a, b) => sortByRate(a.origId, b.origId))

  //
  // Filter data if needed
  //
  if (!options.isSpecialVisible) {
    graphData = graphData
      .filter(serie => yNormalAnswers.includes(serie.origId))
      .map(serie => {
        return {
          ...serie,
          data: serie.data.filter((d: InitialBubbleGraphDatum) => xNormalAnswers.includes(d.origX))
        }
      })
  }

  //
  // Add percentages to data
  //
  
  // Sum up all the visible weights for each X and each serie (y param)
  let weightSum = 0
  const serieWeights = Array.from(graphData, () => 0)
  const xWeights = Array.from(xAnswers, () => 0)
  
  graphData.forEach((serie, serieIndex) => {
    serie.data.forEach((datum: InitialBubbleGraphDatum, xIndex) => {
      weightSum += datum.y
      serieWeights[serieIndex] += datum.y
      xWeights[xIndex] += datum.y
    })
  })

  const finalGraphData: BubbleGraphSerie[] = graphData.map((serie, serieIndex) => {
    return {
      ...serie,
      data: serie.data.map((datum: InitialBubbleGraphDatum, xIndex): BubbleGraphDatum => {
        const isCellNormal = (
          yNormalAnswers.includes(serie.origId) && 
          xNormalAnswers.includes(datum.origX)
        )

        return {
          ...datum,
          y: Number((datum.y / weightSum * 100).toFixed(2)),
          yByX: Number((datum.y / xWeights[xIndex] * 100).toFixed(2)),
          yBySerie: Number((datum.y / serieWeights[serieIndex] * 100).toFixed(2)),
          ansType: isCellNormal ? 'normal' : 'special'
        }
      })
    }
  })

  return finalGraphData
}

export function getBarGraphData(
  { survey, x }: SmartGraphProps,
  options: BarGraphConfig,
): BarGraphDatum[] {
  // Calculate weights
  const surveyDesign = new SurveyDesign(survey.data, survey.meta.weights.all)
  let weightedXs = surveyDesign.svytable(x.questionSurveyId)
  
  const allAnswers = Array.from(new Set(Object.keys(weightedXs)))
  const normalAnswers = getNormalValues(allAnswers)

  // Filter if needed
  if (!options.isSpecialVisible) {
    // Object.fromEntries: ({ key: value }) => [key, value]
    weightedXs = Object.fromEntries(
      Object.entries(weightedXs).filter(([ans]) => normalAnswers.includes(ans))
    )
  }

  const totalXWeight = sum(Object.values(weightedXs))
  
  // Convert to graph data
  const barGraphData = map(weightedXs, (answerWeightedCount, ans) => {
    return { 
      group: getLabel(ans), 
      origGroup: ans,
      value: (answerWeightedCount / totalXWeight * 100).toFixed(2),
      id: normalAnswers.includes(ans) ? 'normal' as const : 'special' as const,
    }
  })

  // Sort by answer prefix
  barGraphData.sort(
    (a, b) => sortByRate(a.origGroup, b.origGroup)
  )

  return barGraphData
}
