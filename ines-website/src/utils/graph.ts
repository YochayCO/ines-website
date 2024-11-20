import map from 'lodash/map'
import { BarGraphDatum, GraphData, SmartBarGraphProps, SmartGraphProps } from '../types/graph'

function getLabel (ans: string): string { return ans.split('. ')[1] }
function getRate (ans: string): string { return ans.split('. ')[0] }

export function getGraphData({ survey, x, y }: SmartGraphProps): GraphData {
  const data = survey.data.map(row => {
    const rawGroup = row[x.column]
    const group = (x.type === 'category') ? getLabel(rawGroup) : getRate(rawGroup)

    return ({ group, value: Number(getRate(row[y.column])) })
  })
  
  const validData = data.filter(({ group, value }) => ![undefined, 98].includes(value) && typeof group === 'string')
  // TODO: use weights here

  return validData
}

export function getBarGraphData({ survey, x }: SmartBarGraphProps): BarGraphDatum[] {
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
  // TODO: use weights here

  return barGraphData
}
