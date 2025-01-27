import { difference, concat } from "lodash";
import { SmartBubblePlotProps, BubbleGraphConfig, BubbleGraphSerie, BubbleGraphDatum, InitialBubbleGraphDatum, InitialBubbleGraphSerie } from "../types/graph";
import { getLabel, getNormalValues, getWeight } from "./graph";
import { isCellAValidAnswer, sortByRate } from "./survey";


export function getBubbleGraphData(
  surveyProps: SmartBubblePlotProps,
  options: BubbleGraphConfig
): { graphData: BubbleGraphSerie[]; effectiveResponses: number}  {
  let initialGraphData = buildInitialGraphData(surveyProps, options)
  initialGraphData = cleanBubbleGraphData(initialGraphData, options)
  const graphData = enrichBubbleGraphData(initialGraphData)

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
export function enrichBubbleGraphData(initialGraphData: InitialBubbleGraphSerie[]): BubbleGraphSerie[] {
  const yAnswers = getBubbleGraphYAnswers(initialGraphData)
  const yNormalAnswers = getNormalValues(yAnswers)
  const xAnswers = getBubbleGraphXAnswers(initialGraphData)
  const xNormalAnswers = getNormalValues(xAnswers)

  let weightSum = 0
  const serieWeights = Array.from(initialGraphData, () => 0)
  const xWeights = Array.from(xAnswers, () => 0)

  initialGraphData.forEach((serie, serieIndex) => {
    serie.data.forEach((datum: InitialBubbleGraphDatum, xIndex) => {
      weightSum += datum.y
      serieWeights[serieIndex] += datum.y
      xWeights[xIndex] += datum.y
    })
  })

  const mainGraphData: BubbleGraphSerie[] = initialGraphData.map((serie) => {
    return {
      ...serie,
      data: serie.data.map((datum: InitialBubbleGraphDatum): BubbleGraphDatum => {
        const isCellNormal = (
          yNormalAnswers.includes(serie.origId) &&
          xNormalAnswers.includes(datum.origX)
        )

        return {
          ...datum,
          y: Number((datum.y / weightSum * 100).toFixed(2)),
          ansType: isCellNormal ? 'normal' : 'special'
        }
      })
    }
  })

  const totalsSerie: BubbleGraphSerie = {
    id: 'Totals',
    origId: 'Totals',
    data: xAnswers.map((origX, xIndex) => {
      const currXTotalWeight = xWeights[xIndex]

      return {
        x: getLabel(origX),
        y: Number((currXTotalWeight / weightSum * 100).toFixed(2)),
        ansType: 'total',
        effectiveY: 0,
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
  options: BubbleGraphConfig
): InitialBubbleGraphSerie[] {
  const yAnswers = getBubbleGraphYAnswers(initialGraphData)
  const yNormalAnswers = getNormalValues(yAnswers)
  const xAnswers = getBubbleGraphXAnswers(initialGraphData)
  const xNormalAnswers = getNormalValues(xAnswers)

  // Fill empty cells; Sort data
  initialGraphData.forEach(serie => {
    const existingXValues = serie.data.map((d: InitialBubbleGraphDatum) => d.origX)
    const newXs = difference(xAnswers, existingXValues)
    const newDatums: InitialBubbleGraphDatum[] = newXs.map(origX => ({ x: getLabel(origX), y: 0, effectiveY: 0, origX, origId: serie.origId }))

    const data: InitialBubbleGraphDatum[] = concat(serie.data, newDatums)
    serie.data = data.sort((a, b) => sortByRate(a.origX, b.origX))
  })

  initialGraphData.sort((a, b) => sortByRate(a.origId, b.origId))

  // Filter data if needed
  if (!options.isSpecialVisible) {
    initialGraphData = initialGraphData
      .filter(serie => yNormalAnswers.includes(serie.origId))
      .map(serie => {
        return {
          ...serie,
          data: serie.data.filter((d: InitialBubbleGraphDatum) => xNormalAnswers.includes(d.origX))
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
  return Array.from(answersSet)
}
export function getBubbleGraphXAnswers(data: InitialBubbleGraphSerie[]): string[] {
  const answersSet: Set<string> = data.reduce((set: Set<string>, serie: InitialBubbleGraphSerie) => {
    serie.data.forEach((d: InitialBubbleGraphDatum) => set.add(d.origX))
    return set
  }, new Set<string>())
  return Array.from(answersSet)
}

