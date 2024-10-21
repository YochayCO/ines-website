import * as d3 from 'd3';
import { AxisLeft } from '../AxisLeft/AxisLeft';
import { AxisBottom } from '../AxisBottom/AxisBottom';
import { VerticalBox } from './VerticalBox';
import { getSummaryStats } from '../../utils/data';

import './BoxChart.css'
import { useState } from 'react';

const MARGIN = { top: 30, right: 30, bottom: 30, left: 50 };

type BoxChartProps = {
  // x: string; // parameter title
  // y: string; // parameter title
  width: number;
  height: number;
  data: { x: string; y: number }[];
  chartType?: 'category' | 'quantity';
};

export default function BoxChart ({ width, height, data, chartType = 'category' }: BoxChartProps) {
  const allGroups = [...new Set(data.map((d) => d.x))].sort((a, b) => {
    if (chartType === 'quantity') {
      return Number(a) - Number(b)
    } else {
      return a.localeCompare(b)
    }
  })
  
  const [visibleGroups, setVisibleGroups] = useState(allGroups)
  const visibleData = data.filter(d => visibleGroups.includes(d.x) && d.y !== 98)

  // The bounds (= area inside the axis) is calculated by substracting the margins from total width / height
  const boundsWidth = width - MARGIN.right - MARGIN.left;
  const boundsHeight = height - MARGIN.top - MARGIN.bottom;

  const toggleVerticalBox = (group: string) => {
    if (visibleGroups.includes(group)) {
      setVisibleGroups(visibleGroups.filter(g => g !== group))
    } else {
      // Not concating in order to keep the original order
      setVisibleGroups(allGroups.filter(g => g === group || visibleGroups.includes(g)))
    }
  }

  const [chartMin, chartMax] = d3.extent(visibleData.map((d) => d.y)) as [number,number];

  // Compute scales
  const yScale = d3
    .scaleLinear()
    .domain([chartMin, chartMax])
    .range([boundsHeight, 0]);
  const xScale = d3
    .scaleBand()
    .domain(visibleGroups)
    .range([0, boundsWidth])
    .padding(0.25);

  // Build the box shapes
  const allShapes = visibleGroups.map((group, i) => {
    const groupData = visibleData.filter((d) => d.x === group).map((d) => d.y);
    const sumStats = getSummaryStats(groupData);

    if (!sumStats) {
      return null;
    }

    const { min, q1, median, q3, max } = sumStats;

    return (
      <g key={i} transform={`translate(${xScale(group)},0)`}>
        <VerticalBox
          onClick={() => toggleVerticalBox(group)}
          width={xScale.bandwidth()}
          q1={yScale(q1)}
          median={yScale(median)}
          q3={yScale(q3)}
          min={yScale(min)}
          max={yScale(max)}
          stroke="black"
          fill={"#ead4f5"}
        />
      </g>
    );
  });

  return (
    <div>
      <svg width={width} height={height}>
        <g
          width={boundsWidth}
          height={boundsHeight}
          transform={`translate(${[MARGIN.left, MARGIN.top].join(",")})`}
        >
          {allShapes}
          <AxisLeft yScale={yScale} pixelsPerTick={30} />
          {/* X axis uses an additional translation to appear at the bottom */}
          <g transform={`translate(0,${boundsHeight})`}>
            <AxisBottom xScale={xScale} />
          </g>
        </g>
      </svg>
    </div>
  );
};

