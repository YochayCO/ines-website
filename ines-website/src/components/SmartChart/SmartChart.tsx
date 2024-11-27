import { useMemo } from 'react';
import { BarGraphDatum, BubbleGraphSerie, SmartGraphProps } from '../../types/graph';
import { getBarGraphData, getBubbleGraphData } from '../../utils/graph';
import BarPlot from '../BarPlot/BarPlot';
import BubblePlot from '../BubblePlot/BubblePlot';

// A smart component that wraps all possible plots
export default function SmartChart ({ survey, x, y }: SmartGraphProps) {

    const graphData = useMemo(() => {
        if (y) return getBubbleGraphData({ survey, x, y })
        return getBarGraphData({ survey, x })
    }, [survey, x, y])
    
    if (y) {
        const visibleData = graphData as BubbleGraphSerie[]
        return (
            <BubblePlot
                data={visibleData}
                xTitle={x.description}
                yTitle={y.description}
            />
        )
    } else {
        const visibleData = graphData as BarGraphDatum[]
        return (
            <BarPlot
                data={visibleData}
                xTitle={x.description}
                yTitle='Percentage of voters'
            />
        )
    }
};

