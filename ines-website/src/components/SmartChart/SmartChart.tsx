import { ReactNode, useEffect, useMemo, useState } from 'react';
import { FormControlLabel, FormGroup, Switch } from '@mui/material';
import { BarGraphDatum, BubbleGraphSerie, SmartGraphProps } from '../../types/graph';
import { getBarGraphData, getBubbleGraphData } from '../../utils/graph';
import BarPlot from '../BarPlot/BarPlot';
import BubblePlot from '../BubblePlot/BubblePlot';

import './SmartChart.css'

// A smart component that wraps all possible plots
export default function SmartChart ({ survey, x, y }: SmartGraphProps) {
    const [isSpecialVisible, setSpecialVisible] = useState(true)
    const [hiddenAnswers, setHiddenAnswers] = useState<string[]>([])

    useEffect(() => {
        setHiddenAnswers([])
    }, [survey, x, y, isSpecialVisible])

    const handleSpecialToggle = () => setSpecialVisible((currVisibility) => !currVisibility)
    const handleXAnswerClick = (ans: string) => {
        if (hiddenAnswers.includes(ans)) {
            const newHiddenAnswers = hiddenAnswers.filter(a => a !== ans)
            setHiddenAnswers(newHiddenAnswers)
        } else {
            setHiddenAnswers(hiddenAnswers.concat(ans))
        }
    }
    
    const { graphData, effectiveResponses } = useMemo(() => {
        const options = { isSpecialVisible, hiddenAnswers }

        if (y) return getBubbleGraphData({ survey, x, y }, options)
        return getBarGraphData({ survey, x }, options)
    }, [survey, x, y, isSpecialVisible, hiddenAnswers])

    const toggleButton = (
        <FormGroup className='toggle-button'>
            <FormControlLabel 
                label='Toggle special values visibility'
                control={(
                    <Switch onChange={handleSpecialToggle} checked={isSpecialVisible} />
                )}
            />
        </FormGroup>
    )

    const effectiveResponsesIndicator = (
        <div className='responses-sum-container'>
            Effective N:<div className='responses-sum'>{effectiveResponses}</div>
        </div>
    )

    let smartPlot: ReactNode
    
    if (y) {
        const visibleData = graphData as BubbleGraphSerie[]
        smartPlot = (
            <BubblePlot
                data={visibleData}
                xTitle={`${x.englishDescription} / ${x.questionHebrewDescription}`}
                yTitle={`${y.englishDescription} / ${y.questionHebrewDescription}`}
                hiddenAnswers={hiddenAnswers}
                onXAnswerClick={handleXAnswerClick}
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
        <div className='graph-container'>
            <div className='graph-header'>
                {toggleButton}
                {effectiveResponsesIndicator}
            </div>
            <div className='graph'>
                {smartPlot}
            </div>
        </div>
    )
};

