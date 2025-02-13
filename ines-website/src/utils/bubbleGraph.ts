import { difference, concat } from "lodash";
import { BubbleGraphConfig, BubbleGraphSerie, BubbleGraphDatum, InitialBubbleGraphDatum, InitialBubbleGraphSerie, GraphMeta } from '../types/graph';
import { Survey, QuestionItem } from "../types/survey";
import { getLabel, getNormalValues, getWeight } from "./graph";
import { isCellAValidAnswer, sortByRate } from "./survey";

const HACK_NUM_AGAINST_GRAPH_DISAPPEAR = 0.000000001

export interface SmartBubblePlotProps {
    survey: Survey;
    x: QuestionItem;
    y: QuestionItem; 
}
interface AnswersData { yAnswers: string[]; yNormalAnswers: string[]; xAnswers: string[]; xNormalAnswers: string[] }

export function getBubbleGraphData(
  surveyProps: SmartBubblePlotProps,
  options: BubbleGraphConfig
): { data: BubbleGraphSerie[]; meta: GraphMeta }  {
  
  // Transforms each row into its datum. 
  // Weights are calculated even if they are disabled, but only if they will be "displayed"
  let initialGraphData = buildInitialGraphData(surveyProps, options)

  // Creating answers once, to avoid recalculation
  const yAnswers = getBubbleGraphYAnswers(initialGraphData)
  const xAnswers = getBubbleGraphXAnswers(initialGraphData)
  const answersData = {
    yAnswers,
    yNormalAnswers: getNormalValues(yAnswers),
    xAnswers,
    xNormalAnswers: getNormalValues(xAnswers),
  }
  
  // Add missing datums and clear those which should not be displayed
  initialGraphData = cleanBubbleGraphData(initialGraphData, options, answersData)
  
  // Add percentages, answer types and Totals row.
  // disabled datums will NOT be used in percentage calculations
  const graphData = enrichBubbleGraphData(initialGraphData, options, answersData)

  // Calculate graph metadata - number of effective responses
  const numOfEffectiveResponses = getBubbleGraphEffectiveN(graphData)

  return { data: graphData, meta: { numOfEffectiveResponses } }
}

export function getBubbleGraphEffectiveN(graphData: BubbleGraphSerie[]): number {
  let effectiveN = 0

  graphData.forEach(serie => {
    serie.data.forEach((d: BubbleGraphDatum) => {
      const shouldCountDatumResponses = d.ansType !== 'total' && !d.disabled
      if (shouldCountDatumResponses) {
        effectiveN += d.numOfResponses
      }
    })
  })

  return effectiveN
}

// Add percentages to data
// Sum up all the visible weights for each X and each serie (y param)
// Create and concat "Totals" serie to data
export function enrichBubbleGraphData(initialGraphData: InitialBubbleGraphSerie[], options: BubbleGraphConfig, answersData: AnswersData): BubbleGraphSerie[] {
  let totalWeight = HACK_NUM_AGAINST_GRAPH_DISAPPEAR
  const serieWeights = Array.from(initialGraphData, () => HACK_NUM_AGAINST_GRAPH_DISAPPEAR)
  const xWeights = Array.from(answersData.xAnswers, () => HACK_NUM_AGAINST_GRAPH_DISAPPEAR)

  initialGraphData.forEach((serie, serieIndex) => {
    serie.data.forEach((datum: InitialBubbleGraphDatum, xIndex) => {
      // Datum should not affect weight if it is disabled
      if (datum.disabled) return

      totalWeight += datum.y
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
        const effectiveWeight = datum.disabled ? 0 : Number((datum.y / totalWeight * 100)) + HACK_NUM_AGAINST_GRAPH_DISAPPEAR

        return {
          ...datum,
          y: effectiveWeight,
          yByX: Number((datum.y / xWeights[xIndex] * 100)),
          yBySerie: Number((datum.y / serieWeights[serieIndex] * 100)),
          ansType: isCellNormal ? 'normal' : 'special',
        }
      })
    }
  })

  if (!mainGraphData.length) return mainGraphData

  const displayedXAnswers = options.isSpecialDisplayed ? answersData.xAnswers : answersData.xNormalAnswers
  const totalsSerie: BubbleGraphSerie = {
    id: 'Totals',
    origId: 'Totals',
    data: displayedXAnswers.map((origX, xIndex) => {
      const currXTotalWeight = xWeights[xIndex]
      const y = Number((currXTotalWeight / totalWeight * 100))
      const isDisabled = isResponseDisabled(options, origX, "Totals")
      const displayedY = isDisabled ? 0 : y + HACK_NUM_AGAINST_GRAPH_DISAPPEAR

      return {
        x: getLabel(origX),
        y: displayedY,
        ansType: 'total',
        numOfResponses: 0,
        disabled: isDisabled,
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

// This is seperate from build method because "normal" answers needs answers to exist already:
// Only when we know which answers are special, we can filter them out.
export function cleanBubbleGraphData(
  initialGraphData: InitialBubbleGraphSerie[],
  options: BubbleGraphConfig,
  answersData: AnswersData
): InitialBubbleGraphSerie[] {
  // Fill empty cells; Sort data
  initialGraphData.forEach(serie => {
    const existingXValues = serie.data.map((d: InitialBubbleGraphDatum) => d.origX)
    const newXs = difference(answersData.xAnswers, existingXValues)
    const newDatums: InitialBubbleGraphDatum[] = newXs.map(origX => {
      const isDatumDisabled = isResponseDisabled(options, origX, serie.origId)

      return ({
        x: getLabel(origX),
        y: 0,
        numOfResponses: 0,
        disabled: isDatumDisabled,
        origX,
        origId: serie.origId
      })
  })

    const data: InitialBubbleGraphDatum[] = concat(serie.data, newDatums)
    serie.data = data.sort((a, b) => sortByRate(a.origX, b.origX))
  })

  initialGraphData.sort((a, b) => sortByRate(a.origId, b.origId))

  // Filter data if needed
  if (!options.isSpecialDisplayed) {
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

// Input - survey and question items, options (for the weight name)
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
    const weight = getWeight({
      row, 
      weightName: options.weightName, 
      surveyWeights: survey.meta.weights, 
    })
    const binaryDisplayIndicator = (weight === 0) ? 0 : 1
    const isDisabled = isResponseDisabled(options, xAns, yAns)

    // If series does not exist - create it and go to next.
    const currSerie = series.find((ser) => ser.id === serieId)
    if (!currSerie) {
      const datumData = [{ 
        x: xValue,
        y: weight, 
        numOfResponses: binaryDisplayIndicator, 
        disabled: isDisabled, 
        origX: xAns, 
        origId: yAns
      }]
      const serie = [{ id: serieId, origId: yAns, data: datumData }]
      return series.concat(serie)
    }

    // If x does not exist for series - create it and go to next.
    const currDatum = currSerie.data.find(({ x }) => x === xValue) as InitialBubbleGraphDatum | undefined
    if (currDatum === undefined) {
      const datumData = [{ 
        x: xValue,
        y: weight,
        numOfResponses: binaryDisplayIndicator,
        disabled: isDisabled,
        origX: xAns,
        origId: yAns
      }]
      currSerie.data = currSerie.data.concat(datumData) as InitialBubbleGraphDatum[]
      return series
    }

    // If x-serie pair existed - increment the existing weight in y
    currDatum.y += weight
    currDatum.numOfResponses += binaryDisplayIndicator
    
    return series
  }, [])
}

function isResponseDisabled(options: BubbleGraphConfig, xAns: string, yAns: string) {
  return options.disabledXAnswers.includes(xAns) || options.disabledYAnswers.includes(yAns);
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
