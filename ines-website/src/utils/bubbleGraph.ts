import { difference, concat } from "lodash";
import { BubbleGraphConfig, BubbleGraphSerie, BubbleGraphDatum, InitialBubbleGraphDatum, InitialBubbleGraphSerie, GraphMeta } from '../types/graph';
import { Survey, QuestionItem } from "../types/survey";
import { getLabel, getNormalValues, getWeight } from "./graph";
import { isCellAValidAnswer, sortByRate } from "./survey";

const HACK_NUM_AGAINST_GRAPH_DISAPPEARANCE = 0.000000001

export interface SmartBubblePlotProps {
    survey: Survey;
    x: QuestionItem;
    y: QuestionItem; 
}
interface AnswersData { yAnswers: string[]; yNormalAnswers: string[]; xAnswers: string[]; xNormalAnswers: string[] }

/**
 * Main function to generate bubble graph data and meta information from survey and configuration.
 */
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

/**
 * Calculates the effective number of responses in the bubble graph data.
 */
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
export function enrichBubbleGraphData(
  initialGraphData: InitialBubbleGraphSerie[], 
  options: BubbleGraphConfig, 
  answersData: AnswersData
): BubbleGraphSerie[] {
  let totalWeight = HACK_NUM_AGAINST_GRAPH_DISAPPEARANCE
  const serieWeights = initialGraphData.map(() => HACK_NUM_AGAINST_GRAPH_DISAPPEARANCE)
  const xWeights = answersData.xAnswers.map(() => HACK_NUM_AGAINST_GRAPH_DISAPPEARANCE)

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
        const effectiveWeight = datum.disabled ? 0 : Number((datum.y / totalWeight * 100)) + HACK_NUM_AGAINST_GRAPH_DISAPPEARANCE

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

  const maxWeight = getMaxDatumWeight(mainGraphData)
  const maxTotalWeight = Math.max(...xWeights)
  const displayedXAnswers = options.isSpecialDisplayed ? answersData.xAnswers : answersData.xNormalAnswers
  const totalsSerie: BubbleGraphSerie = {
    id: 'Totals',
    origId: 'Totals',
    data: displayedXAnswers.map((origX, xIndex) => {
      const currXTotalWeight = xWeights[xIndex]
      const isDisabled = isAnsComboDisabled(options, origX, "Totals")
      // Total datum weight is proportional to the maximumm regular datum weight
      const datumWeight = isDisabled ? 0 : currXTotalWeight * maxWeight / maxTotalWeight
      // The actual percentage is calculated normally and stored in yBySerie
      const yLabel = isDisabled ? 0 : Number((currXTotalWeight / totalWeight * 100)) + HACK_NUM_AGAINST_GRAPH_DISAPPEARANCE

      return {
        x: getLabel(origX),
        y: datumWeight,
        ansType: 'total',
        numOfResponses: 0,
        disabled: isDisabled,
        yByX: 100,
        yBySerie: yLabel,
        origX,
        origId: 'Totals'
      }
    })
  }

  const finalData = mainGraphData.concat(totalsSerie)

  return finalData
}

/**
 * Calculates the maximum weight among the bubble datum.
 */
function getMaxDatumWeight(mainGraphData: BubbleGraphSerie[]) {
  const weights = mainGraphData.map(serie => serie.data.map((d) => d.y)).flat().filter((y) => y !== null && y !== undefined)
  const maxWeight = Math.max(...weights)

  return maxWeight
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
    const serieExistingXAnswers = serie.data.map((d: InitialBubbleGraphDatum) => d.origX)
    const serieMissingXAnswers = difference(answersData.xAnswers, serieExistingXAnswers)
    const serieMissingDatums: InitialBubbleGraphDatum[] = serieMissingXAnswers.map(origX => {
      const isDatumDisabled = isAnsComboDisabled(options, origX, serie.origId)

      return ({
        x: getLabel(origX),
        y: 0,
        numOfResponses: 0,
        disabled: isDatumDisabled,
        origX,
        origId: serie.origId
      })
  })

    const serieData: InitialBubbleGraphDatum[] = concat(serie.data, serieMissingDatums)
    serie.data = serieData.sort((a, b) => sortByRate(a.origX, b.origX))
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

/**
 * Builds the initial bubble graph data from survey responses, aggregating weights and responses.
 */
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
    const disabled = isAnsComboDisabled(options, xAns, yAns)

    // If series does not exist - create it and go to next.
    let currSerie = series.find((ser) => ser.id === serieId)
    if (!currSerie) {
      const newSerie = { id: serieId, origId: yAns, data: [] };

      series.push(newSerie)
      currSerie = newSerie
    }

    // If x does not exist for series - create it and go to next.
    let currDatum = currSerie.data.find(({ x }) => x === xValue) as InitialBubbleGraphDatum | undefined
    if (!currDatum) {
      const datumData = { 
        x: xValue,
        y: weight,
        numOfResponses: 0,
        disabled: disabled,
        origX: xAns,
        origId: yAns
      }
      currSerie.data.push(datumData)
      currDatum = datumData
    }

    currDatum.y += weight
    if (weight !== 0) {
      currDatum.numOfResponses++;
    }
    
    return series
  }, [])
}

function isAnsComboDisabled(options: BubbleGraphConfig, xAns: string, yAns: string) {
  return options.disabledXAnswers.includes(xAns) || options.disabledYAnswers.includes(yAns);
}

/**
 * Extracts all unique Y answers from the initial bubble graph data.
 */
export function getBubbleGraphYAnswers(data: InitialBubbleGraphSerie[]): string[] {
  const answersSet: Set<string> = data.reduce((set: Set<string>, serie: InitialBubbleGraphSerie) => {
    set.add(serie.origId)
    return set
  }, new Set<string>())
  return Array.from(answersSet).sort(sortByRate)
}

/**
 * Extracts all unique X answers from the initial bubble graph data.
 */
export function getBubbleGraphXAnswers(data: InitialBubbleGraphSerie[]): string[] {
  const answersSet: Set<string> = data.reduce((set: Set<string>, serie: InitialBubbleGraphSerie) => {
    serie.data.forEach((d: InitialBubbleGraphDatum) => set.add(d.origX))
    return set
  }, new Set<string>())
  return Array.from(answersSet).sort(sortByRate)
}
