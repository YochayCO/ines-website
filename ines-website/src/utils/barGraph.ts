import { sum, map } from "lodash";
import { BarGraphConfig, BarGraphDatum, GraphMeta } from '../types/graph';
import { getNormalValues, getLabel, getWeight } from "./graph";
import { isCellAValidAnswer, sortByRate } from "./survey";
import { Survey, QuestionItem } from "../types/survey";

interface SmartBarPlotProps {
    survey: Survey;
    x: QuestionItem;
}
type InitialBarsData = Record<string, { 
    effectiveN: number; 
    totalWeight: number; 
    disabled: boolean; 
}>;

/**
 * Generates bar graph data and meta information from survey results and configuration.
 */
export function getBarGraphData(
  { survey, x }: SmartBarPlotProps,
  options: BarGraphConfig,
): { data: BarGraphDatum[]; meta: GraphMeta; } {
    let initialBarsData = buildInitialGraphData({ survey, x }, options)

    const allAnswers = Array.from(new Set(Object.keys(initialBarsData)))
    const normalAnswers = getNormalValues(allAnswers)

    // Filter if needed
    initialBarsData = cleanBarGraphData(initialBarsData, options, normalAnswers);

    const barGraphData = enrichBarGraphData(initialBarsData, { normalAnswers });

    // Convert to graph data
    const numOfEffectiveResponses = getBarGraphEffectiveN(barGraphData);

    return { data: barGraphData, meta: { numOfEffectiveResponses } }
}

function getBarGraphEffectiveN(barsData: BarGraphDatum[]) {
    return sum(
        barsData
            .filter(bar => !bar.disabled)
            .map((bar) => bar.effectiveN)
    );
}

/**
 * Filters out special answers from the initial bar data if they should not be displayed.
 */
function cleanBarGraphData(initialBarsData: InitialBarsData, options: BarGraphConfig, normalAnswers: string[]) {
    if (!options.isSpecialDisplayed) {
        // Object.fromEntries = ({ key: value }) => [key, value]
        initialBarsData = Object.fromEntries(
            Object.entries(initialBarsData).filter(([ans]) => normalAnswers.includes(ans))
        );
    }
    return initialBarsData;
}

/**
 * Converts inital bar graph data to the final bar graph data format.
 */

export function enrichBarGraphData(initialBarsData: InitialBarsData, options: { normalAnswers: string[] }): BarGraphDatum[] {    
    const totalXWeight = sum(
      Object.values(initialBarsData)
        .filter((bar) => !bar.disabled)
        .map((bar) => bar.totalWeight)
    );
  
    const barGraphData = map(initialBarsData, (bar, ans) => {
        return { 
          group: getLabel(ans), 
          origGroup: ans,
          effectiveN: bar.disabled ? 0 : bar.effectiveN,
          disabledIndicator: bar.disabled ? 1 : 0,
          value: bar.disabled ? 0 : (bar.totalWeight / totalXWeight * 100).toFixed(2),
          id: options.normalAnswers.includes(ans) ? 'normal' as const : 'special' as const,
        }
      })
    
      // Sort by answer prefix
      barGraphData.sort(
        (a, b) => sortByRate(a.origGroup, b.origGroup)
      )

      return barGraphData
}

/**
 * Checks if a bar is disabled.
 */
function isBarDisabled(options: BarGraphConfig, ans: string) {
  return options.disabledXAnswers.includes(getLabel(ans));
}

/**
 * Builds the initial bar data from the survey results.
 * It calculates the effective number of responses and total weight for each answer.
 */
export function buildInitialGraphData(
    { survey, x }: SmartBarPlotProps,
    options: BarGraphConfig
): InitialBarsData {
    return survey.data.reduce((bars: InitialBarsData, row) => {
        const ans = row[x.questionSurveyId]
        
        if (!isCellAValidAnswer(ans)) return bars
        
        const weight = getWeight({ row, weightName: options.weightName, surveyWeights: survey.meta.weights })
        const disabled = isBarDisabled(options, ans)

        if (!bars[ans]) {
            bars[ans] = { effectiveN: 0, totalWeight: 0, disabled };
        }

        // Increment weight & effectiveN and go to next.
        bars[ans].totalWeight += weight

        if (weight) {
            bars[ans].effectiveN++
        }
        return bars
    }, {})
}
