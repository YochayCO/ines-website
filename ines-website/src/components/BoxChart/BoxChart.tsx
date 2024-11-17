import { useEffect, useMemo, useState } from 'react';

import './BoxChart.css'
import BoxPlot from '../BoxPlot/BoxPlot';

type BoxChartProps = {
    xTitle: string; // parameter title
    yTitle: string; // parameter title
    data: { x: string; y: number }[];
    chartType?: 'category' | 'quantity';
};

// A smart component that wraps BoxPlot
export default function BoxChart ({ xTitle, yTitle, data, chartType = 'category' }: BoxChartProps) {
    const [visibleGroups, setVisibleGroups] = useState<string[]>([])

    const sortedGroups = useMemo(() => {
        return [...new Set(data.map((d) => d.x))].sort((a, b) => {
            if (chartType === 'quantity') {
                return Number(a) - Number(b)
            } else {
                // If categorial - groups are ordered alphabetically
                return a.localeCompare(b)
            }
        })
    }, [data, chartType])

    useEffect(() => setVisibleGroups(sortedGroups), [sortedGroups])
    
    // TODO: Handle 98 and other special values
    const visibleData = data.filter(d => visibleGroups.includes(d.x) && d.y !== 98)
    
    // TODO: show hidden boxes and enable user to re-add them. Not important.
    const toggleVerticalBox = (group: string) => {
        if (visibleGroups.includes(group)) {
            setVisibleGroups(visibleGroups.filter(g => g !== group))
        } else {
            // Not concating in order to keep the original order
            setVisibleGroups(sortedGroups.filter(g => g === group || visibleGroups.includes(g)))
        }
    }
    
    return (
        <BoxPlot
            data={visibleData.map(({ x, y }) => ({ group: x, value: y }))}
            groups={visibleGroups}
            chartType={chartType}
            onBoxClick={toggleVerticalBox}
            xTitle={xTitle}
            yTitle={yTitle}
        />
    );
};

