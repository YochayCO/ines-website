import { useEffect, useMemo, useState } from 'react';
import { SmartBarGraphProps } from '../../types/graph';
import { getBarGraphData } from '../../utils/graph';
import BarPlot from './BarPlot';

// A smart component that wraps BoxPlot
export default function BarChart ({ survey, x }: SmartBarGraphProps) {
    const [visibleGroups, setVisibleGroups] = useState<string[]>([])

    const graphData = useMemo(() => {
        return getBarGraphData({ survey, x })
    }, [survey, x])

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
    
    const toggleBar = (group: string) => {
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
        <BarPlot
            data={visibleData}
            chartType={x.type}
            onBarClick={toggleBar}
            xTitle={x.description}
            yTitle='Percentage of voters'
        />
    );
};

