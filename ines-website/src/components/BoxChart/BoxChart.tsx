import { useEffect, useMemo, useState } from 'react';
import { SmartGraphProps } from '../../types/graph';
import { getGraphData } from '../../utils/graph';
import BoxPlot from '../BoxPlot/BoxPlot';

// A smart component that wraps BoxPlot
export default function BoxChart ({ survey, x, y }: SmartGraphProps) {
    const [visibleGroups, setVisibleGroups] = useState<string[]>([])

    const graphData = useMemo(() => {
        return getGraphData({ survey, x, y })
    }, [survey, x, y])

    const sortedGroups = useMemo(() => {
        const groups = [...new Set(graphData.map((d) => d.group))]
        
        return groups.sort((a, b) => {
            if (x.type === 'quantity') {
                return Number(a) - Number(b)
            } else {
                // If categorial - groups are ordered alphabetically
                return a.localeCompare(b)
            }
        })
    }, [graphData, x.type])

    useEffect(() => setVisibleGroups(sortedGroups), [sortedGroups])
    
    const toggleVerticalBox = (group: string) => {
        if (visibleGroups.includes(group)) {
            setVisibleGroups(visibleGroups.filter(g => g !== group))
        } else {
            // No concat: Maintain the sorted order
            setVisibleGroups(sortedGroups.filter(g => g === group || visibleGroups.includes(g)))
        }
    }
    
    // TODO: Handle 98 and other special values
    const visibleData = graphData.filter(d => visibleGroups.includes(d.group))
    
    return (
        <BoxPlot
            data={visibleData}
            groups={visibleGroups}
            chartType={x.type}
            onBoxClick={toggleVerticalBox}
            xTitle={x.description}
            yTitle={y.description}
        />
    );
};

