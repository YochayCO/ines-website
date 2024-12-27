import { sum, map } from "lodash";
import { SmartGraphProps, BarGraphConfig, BarGraphDatum } from "../types/graph";
import { getNormalValues, getLabel } from "./graph";
import { sortByRate } from "./survey";
import SurveyDesign from "./SurveyDesign";

export function getBarGraphData(
  { survey, x }: SmartGraphProps,
  options: BarGraphConfig,
): { graphData: BarGraphDatum[]; effectiveResponses: number } {
  // Calculate weights
  const surveyDesign = new SurveyDesign(survey.data, survey.meta.weights?.all)
  let weightedXs = surveyDesign.svytable(x.questionSurveyId)
  const effectiveResponses = surveyDesign.effectiveResponses
  
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

  return { graphData: barGraphData, effectiveResponses }
}
