import { useEffect, useMemo, useState } from 'react';
import { BarGraphDatum, HeatMapDatum, SmartGraphProps } from '../../types/graph';
import { getBarGraphData, getBubbleGraphData, getGraphGroup } from '../../utils/graph';
import BarPlot from '../BarPlot/BarPlot';
import BubblePlot from '../BubblePlot/BubblePlot';

// A smart component that wraps all possible plots
export default function SmartChart ({ survey, x, y }: SmartGraphProps) {
    const [visibleGroups, setVisibleGroups] = useState<string[]>([])

    const [graphData, groups] = useMemo(() => {
        if (y) return getBubbleGraphData({ survey, x, y })
        return getBarGraphData({ survey, x })
    }, [survey, x, y])

    useEffect(() => setVisibleGroups(groups || []), [groups])
    
    const removeItem = (group: string) => {
        setVisibleGroups(visibleGroups.filter(g => g !== group))
    }

    const isCategorial = x.type === 'category'
    
    // TODO: Handle 98 and other special values
    
    if (y) {
        const visibleData: HeatMapDatum[] = graphData as HeatMapDatum[]
        return (
            <BubblePlot
                data={visibleData}
                isCategorial={isCategorial}
                xTitle={x.description}
                yTitle={y.description}
            />
        )
    } else {
        const visibleData = (graphData as BarGraphDatum[]).filter(d => visibleGroups.includes(getGraphGroup(d))) as BarGraphDatum[]
        return (
            <BarPlot
                data={visibleData}
                isCategorial={isCategorial}
                onBarClick={removeItem}
                xTitle={x.description}
                yTitle='Percentage of voters'
            />
        )
    }
};

