import { sum, map } from "lodash";
import { BarGraphConfig, BarGraphDatum } from '../types/graph';
import { getNormalValues, getLabel, getWeight } from "./graph";
import { isCellAValidAnswer, sortByRate } from "./survey";
import { Survey, QuestionItem } from "../types/survey";

interface SmartBarPlotProps {
    survey: Survey;
    x: QuestionItem;
}
type InitialBarsData = Record<string, { effectiveN: number; totalWeight: number; }>;

export function getBarGraphData(
  { survey, x }: SmartBarPlotProps,
  options: BarGraphConfig,
): { graphData: BarGraphDatum[]; numOfEffectiveResponses: number } {
    let initialBarsData = buildInitialGraphData({ survey, x }, options)

    const allAnswers = Array.from(new Set(Object.keys(initialBarsData)))
    const normalAnswers = getNormalValues(allAnswers)

    // Filter if needed
    initialBarsData = cleanBarGraphData(initialBarsData, options, normalAnswers);

  // Convert to graph data
  const effectiveN = sum(Object.values(initialBarsData).map(bar => bar.effectiveN))
  const barGraphData = enrichBarGraphData(initialBarsData, { normalAnswers })

  return { graphData: barGraphData, numOfEffectiveResponses: effectiveN }
}

function cleanBarGraphData(initialBarsData: InitialBarsData, options: BarGraphConfig, normalAnswers: string[]) {
    if (!options.isSpecialDisplayed) {
        // Object.fromEntries = ({ key: value }) => [key, value]
        initialBarsData = Object.fromEntries(
            Object.entries(initialBarsData).filter(([ans]) => normalAnswers.includes(ans))
        );
    }
    return initialBarsData;
}

export function enrichBarGraphData(initialBarsData: InitialBarsData, options: { normalAnswers: string[] }): BarGraphDatum[] {    
    const totalXWeight = sum(Object.values(initialBarsData).map(bar => bar.totalWeight))
  
    const barGraphData = map(initialBarsData, (bar, ans) => {
        return { 
          group: getLabel(ans), 
          origGroup: ans,
          effectiveN: bar.effectiveN,
          value: (bar.totalWeight / totalXWeight * 100).toFixed(2),
          id: options.normalAnswers.includes(ans) ? 'normal' as const : 'special' as const,
        }
      })
    
      // Sort by answer prefix
      barGraphData.sort(
        (a, b) => sortByRate(a.origGroup, b.origGroup)
      )

      return barGraphData
}

export function buildInitialGraphData(
    { survey, x }: SmartBarPlotProps,
    options: BarGraphConfig
): InitialBarsData {
    return survey.data.reduce((bars: InitialBarsData, row) => {
        const ans = row[x.questionSurveyId]
        
        if (!isCellAValidAnswer(ans)) return bars
        
        const weight = getWeight({ row, weightName: options.weightName, surveyWeights: survey.meta.weights })

        if (!bars[ans]) {
            bars[ans] = { effectiveN: 0, totalWeight: 0 }
        }

        // Increment weight & effectiveN and go to next.
        bars[ans].totalWeight += weight

        if (weight) {
            bars[ans].effectiveN++
        }
        return bars
    }, {})
}
