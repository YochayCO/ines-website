import { difference, concat } from "lodash";
import { BubbleGraphConfig, BubbleGraphSerie, BubbleGraphDatum, InitialBubbleGraphDatum, InitialBubbleGraphSerie } from "../types/graph";
import { Survey, QuestionItem } from "../types/survey";
import { getLabel, getNormalValues, getWeight } from "./graph";
import { isCellAValidAnswer, sortByRate } from "./survey";

export interface SmartBubblePlotProps {
    survey: Survey;
    x: QuestionItem;
    y: QuestionItem; 
}
interface AnswersData { yAnswers: string[]; yNormalAnswers: string[]; xAnswers: string[]; xNormalAnswers: string[] }

export function getBubbleGraphData(
  surveyProps: SmartBubblePlotProps,
  options: BubbleGraphConfig
): { graphData: BubbleGraphSerie[]; effectiveResponses: number}  {
  let initialGraphData = buildInitialGraphData(surveyProps, options)

  // Creating once to avoid recalculation
  const yAnswers = getBubbleGraphYAnswers(initialGraphData)
  const xAnswers = getBubbleGraphXAnswers(initialGraphData)
  const answersData = {
    yAnswers,
    yNormalAnswers: getNormalValues(yAnswers),
    xAnswers,
    xNormalAnswers: getNormalValues(xAnswers),
  }
  
  initialGraphData = cleanBubbleGraphData(initialGraphData, options, answersData)
  const graphData = enrichBubbleGraphData(initialGraphData, options, answersData)

  const effectiveResponses = getBubbleGraphEffectiveN(graphData, options)

  return { graphData, effectiveResponses }
}

export function getBubbleGraphEffectiveN(
  graphData: BubbleGraphSerie[],
  options: BubbleGraphConfig
): number {
  let effectiveN = 0

  const yAnswers = getBubbleGraphYAnswers(graphData)
  const yNormalAnswers = getNormalValues(yAnswers)
  const xAnswers = getBubbleGraphXAnswers(graphData)
  const xNormalAnswers = getNormalValues(xAnswers)

  const isAnsTypeEffective = (d: BubbleGraphDatum) => {
    return (
      options.isSpecialVisible ||
      (yNormalAnswers.includes(d.origId) && xNormalAnswers.includes(d.origX))
    )
  }

  graphData.forEach(serie => {
    serie.data.forEach((d: BubbleGraphDatum) => {
      if (isAnsTypeEffective(d)) {
        effectiveN += d.effectiveY
      }
    })
  })

  return effectiveN
}

// Add percentages to data
// Sum up all the visible weights for each X and each serie (y param)
// Create and concat "Totals" serie to data
export function enrichBubbleGraphData(initialGraphData: InitialBubbleGraphSerie[], options: BubbleGraphConfig, answersData: AnswersData): BubbleGraphSerie[] {
  let weightSum = 0
  const serieWeights = Array.from(initialGraphData, () => 0)
  const xWeights = Array.from(answersData.xAnswers, () => 0)

  initialGraphData.forEach((serie, serieIndex) => {
    serie.data.forEach((datum: InitialBubbleGraphDatum, xIndex) => {
      weightSum += datum.y
      serieWeights[serieIndex] += datum.y
      xWeights[xIndex] += datum.y
    })
  })

  const mainGraphData: BubbleGraphSerie[] = initialGraphData.map((serie, serieIndex) => {
    return {
      ...serie,
      data: serie.data.map((datum: InitialBubbleGraphDatum, xIndex): BubbleGraphDatum => {
        const isCellNormal = (
          answersData.yNormalAnswers.includes(serie.origId) &&
          answersData.xNormalAnswers.includes(datum.origX)
        )

        return {
          ...datum,
          y: Number((datum.y / weightSum * 100).toFixed(2)),
          yByX: Number((datum.y / xWeights[xIndex] * 100).toFixed(2)),
          yBySerie: Number((datum.y / serieWeights[serieIndex] * 100).toFixed(2)),
          ansType: isCellNormal ? 'normal' : 'special',
        }
      })
    }
  })

  const visibleXAnswers = options.isSpecialVisible ? answersData.xAnswers : answersData.xNormalAnswers
  const totalsSerie: BubbleGraphSerie = {
    id: 'Totals',
    origId: 'Totals',
    data: visibleXAnswers.map((origX, xIndex) => {
      const currXTotalWeight = xWeights[xIndex]
      const y = Number((currXTotalWeight / weightSum * 100).toFixed(2))
      const displayedY = options.hiddenAnswers.includes(origX) ? 0 : y

      return {
        x: getLabel(origX),
        y: displayedY,
        ansType: 'total',
        effectiveY: 0,
        yByX: 100,
        yBySerie: displayedY,
        origX,
        origId: 'Totals'
      }
    })
  }

  const finalData = mainGraphData.concat(totalsSerie)

  return finalData
}
export function cleanBubbleGraphData(
  initialGraphData: InitialBubbleGraphSerie[],
  options: BubbleGraphConfig,
  answersData: AnswersData
): InitialBubbleGraphSerie[] {
  // Fill empty cells; Sort data
  initialGraphData.forEach(serie => {
    const existingXValues = serie.data.map((d: InitialBubbleGraphDatum) => d.origX)
    const newXs = difference(answersData.xAnswers, existingXValues)
    const newDatums: InitialBubbleGraphDatum[] = newXs.map(
      origX => ({ x: getLabel(origX), y: 0, effectiveY: 0, origX, origId: serie.origId })
    )

    const data: InitialBubbleGraphDatum[] = concat(serie.data, newDatums)
    serie.data = data.sort((a, b) => sortByRate(a.origX, b.origX))
  })

  initialGraphData.sort((a, b) => sortByRate(a.origId, b.origId))

  // Filter data if needed
  if (!options.isSpecialVisible) {
    initialGraphData = initialGraphData
      .filter(serie => answersData.yNormalAnswers.includes(serie.origId))
      .map(serie => {
        return {
          ...serie,
          data: serie.data.filter((d: InitialBubbleGraphDatum) => answersData.xNormalAnswers.includes(d.origX))
        }
      })
  }
  return initialGraphData
}

export function buildInitialGraphData(
  { survey, x: xQuestionItem, y: yQuestionItem }: SmartBubblePlotProps,
  options: BubbleGraphConfig
): InitialBubbleGraphSerie[] {
  return survey.data.reduce((series: InitialBubbleGraphSerie[], row) => {
    const yAns = row[yQuestionItem.questionSurveyId]
    const xAns = row[xQuestionItem.questionSurveyId]

    if (!isCellAValidAnswer(xAns) || !isCellAValidAnswer(yAns)) return series

    const serieId = getLabel(yAns)
    const xValue = getLabel(xAns)
    const weight = getWeight({ row, 
      weightName: options.weightName, 
      surveyWeights: survey.meta.weights, 
      isHidden: options.hiddenAnswers.includes(xAns)
    })


    // If series does not exist - create it and go to next.
    const currSerie = series.find((ser) => ser.id === serieId)
    if (!currSerie) {
      const serie = [{ id: serieId, origId: yAns, data: [{ x: xValue, y: weight, effectiveY: weight ? 1 : 0, origX: xAns, origId: yAns }] }]
      return series.concat(serie)
    }

    // If x does not exist for series - create it and go to next.
    const currDatum = currSerie.data.find(({ x }) => x === xValue) as InitialBubbleGraphDatum | undefined
    if (currDatum === undefined) {
      currSerie.data = currSerie.data.concat([{ x: xValue, y: weight, effectiveY: weight ? 1 : 0, origX: xAns, origId: yAns }])
      return series
    }

    // If x-serie pair exist - increment voteCount and go to next.
    currDatum.y += weight
    if (weight) {
      currDatum.effectiveY++
    }
    return series
  }, [])
}

export function getBubbleGraphYAnswers(data: InitialBubbleGraphSerie[]): string[] {
  const answersSet: Set<string> = data.reduce((set: Set<string>, serie: InitialBubbleGraphSerie) => {
    set.add(serie.origId)
    return set
  }, new Set<string>())
  return Array.from(answersSet).sort(sortByRate)
}
export function getBubbleGraphXAnswers(data: InitialBubbleGraphSerie[]): string[] {
  const answersSet: Set<string> = data.reduce((set: Set<string>, serie: InitialBubbleGraphSerie) => {
    serie.data.forEach((d: InitialBubbleGraphDatum) => set.add(d.origX))
    return set
  }, new Set<string>())
  return Array.from(answersSet).sort(sortByRate)
}
