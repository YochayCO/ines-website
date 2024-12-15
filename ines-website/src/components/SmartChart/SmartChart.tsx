import { ReactNode, useMemo, useState } from 'react';
import { FormControlLabel, FormGroup, Switch } from '@mui/material';
import { BarGraphDatum, BubbleGraphSerie, SmartGraphProps } from '../../types/graph';
import { getBarGraphData, getBubbleGraphData } from '../../utils/graph';
import BarPlot from '../BarPlot/BarPlot';
import BubblePlot from '../BubblePlot/BubblePlot';

// A smart component that wraps all possible plots
export default function SmartChart ({ survey, x, y }: SmartGraphProps) {
    const [isSpecialVisible, setSpecialVisible] = useState(true)
    const handleSpecialToggle = () => setSpecialVisible((currVisibility) => !currVisibility)
    
    const graphData = useMemo(() => {
        const options = { isSpecialVisible }

        if (y) return getBubbleGraphData({ survey, x, y }, options)
        return getBarGraphData({ survey, x }, options)
    }, [survey, x, y, isSpecialVisible])

    const toggleButton = (
        <FormGroup>
            <FormControlLabel 
                label='Toggle special values visibility'
                control={(
                    <Switch onChange={handleSpecialToggle} checked={isSpecialVisible} />
                )}
            />
        </FormGroup>
    )

    let smartPlot: ReactNode
    
    if (y) {
        const visibleData = graphData as BubbleGraphSerie[]
        smartPlot = (
            <BubblePlot
                data={visibleData}
                xTitle={`${x.englishDescription} / ${x.questionHebrewDescription}`}
                yTitle={`${y.englishDescription} / ${y.questionHebrewDescription}`}
            />
        )
    } else {
        const visibleData = graphData as BarGraphDatum[]
        smartPlot = (
            <BarPlot
                data={visibleData}
                xTitle={`${x.englishDescription} / ${x.questionHebrewDescription}`}
                yTitle='Percentage of voters'
            />
        )
    }

    return (
        <>
            {toggleButton}
            {smartPlot}
        </>
    )
};

