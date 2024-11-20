import { GraphData, SmartGraphProps } from '../types/graph'

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
