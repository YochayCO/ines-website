import map from 'lodash/map'
import difference from 'lodash/difference'
import { BarGraphDatum, HeatMapDatum, SmartBoxPlotProps, SmartGraphProps } from '../types/graph'
import { sortSurveyColumn, sortSurveyRowsByColumn } from "./survey"

function getLabel (ans: string): string { return ans.split('. ')[1] }
function getRate (ans: string): string { return ans.split('. ')[0] }
export function getGraphGroup (d: BarGraphDatum): string { return d.group }

// TODO: better code
export function getBubbleGraphData({ survey, x: xQuestionItem, y: yQuestionItem }: SmartBoxPlotProps): [HeatMapDatum[]] {
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

  return [sortedData]
}

export function getBarGraphData({ survey, x }: SmartGraphProps): [BarGraphDatum[], string[]] {
  const bars = survey.data.map(row => {
    const rawGroup = row[x.column]
    const group = (x.type === 'category') ? getLabel(rawGroup) : getRate(rawGroup)

    return group
  })
  
  const voterCountByGroup = bars.reduce((counts: { [group: string]: number; }, group) => {
    if (!group) return counts
    
    counts[group] = (counts[group] || 0) + 1
    return counts
  }, {})

  const barGraphData = map(
    voterCountByGroup, 
    (numOfVoters, group) => ({ group, value: (numOfVoters / survey.data.length * 100).toFixed(2)})
  )

  const groups = barGraphData.map((d) => getGraphGroup(d))
  const uniqueGroups: string[] = [...new Set(groups)]
  const sortedGroups = sortSurveyColumn(uniqueGroups, x.type === 'quantity') 

  // TODO: use weights here

  return [barGraphData, sortedGroups]
}
