import * as d3 from 'd3'

// Original data of boxplot graph
export type GroupBoxProps = {
    group: string;
    min: number;
    q1: number;
    median: number;
    q3: number;
    max: number;
    average: number;
    size: number;
};

// Used for a single box plot
export function getGroupBoxProps (data: number[], group: string): GroupBoxProps {
    const sortedData = data.sort(function(a, b){return a - b});
  
    const q1 = d3.quantile(sortedData, .25) || 0
    const median = d3.quantile(sortedData, .5) || 0
    const q3 = d3.quantile(sortedData, .75) || 0
    const average = d3.mean(sortedData) || 0
  
    const interQuantileRange = q3 - q1
    const min = q1 - 1.5 * interQuantileRange
    const max = q3 + 1.5 * interQuantileRange
  
    return { min, q1, median, q3, max, average, group, size: group.length }
  }