import map from 'lodash/map'
import sum from 'lodash/sum'
import difference from 'lodash/difference'
import { BarGraphDatum, HeatMapDatum, SmartBoxPlotProps, SmartGraphProps } from '../types/graph'
import { smartSort, sortSurveyRowsByColumn } from './survey'
import SurveyDesign from './SurveyDesign'

export function getLabel (ans: string): string { return ans.split('. ')[1] || ans.split('. ')[0] }
export function getRate (ans: string): string { return ans.split('. ')[0] }
export function getGraphGroup (d: BarGraphDatum): string { return d.group }

// TODO: better code
export function getBubbleGraphData({ survey, x: xQuestionItem, y: yQuestionItem }: SmartBoxPlotProps): HeatMapDatum[] {
  const data = survey.data.reduce((acc: HeatMapDatum[], row) => {
    const serie = getRate(row[yQuestionItem.column])
    const xValue = (xQuestionItem.type === 'category') ? getLabel(row[xQuestionItem.column]) : getRate(row[xQuestionItem.column])

    // Do not include invalid data
    if ([undefined, '98'].includes(serie) || typeof xValue !== 'string') return acc

    const currSerie = acc.find((ser) => ser.id === serie)
    if (!currSerie) {
      return acc.concat([{ id: serie, data: [{ x: xValue, y: 1 }] }])
    }

    const currX = currSerie.data.find(({ x }) => x === xValue)
    if (!currX) {
      currSerie.data = currSerie.data.concat([{ x: xValue, y: 1 }])
      return acc
    }

    currX.y++
    return acc
  }, [])

  const xList = Array.from(new Set(data.map((d) => d.data.map(xy => xy.x)).flat(2)))
  data.forEach(d => {
    const xs = d.data.map(xy => xy.x)
    const newXs = difference(xList, xs)
    const newXYs = newXs.map(x => ({ x, y: 0 }))
    d.data = sortSurveyRowsByColumn(d.data.concat(newXYs), 'x', xQuestionItem.type === 'quantity')
  })

  const sortedData = sortSurveyRowsByColumn(data, 'id', yQuestionItem.type === 'quantity').reverse()
  
  // TODO: use weights here

  return sortedData
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
    (a, b) => smartSort(a.group, b.group, x.type === 'quantity')
  )

  return sortedData
}
