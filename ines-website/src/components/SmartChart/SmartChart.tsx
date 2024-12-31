import { ReactNode, useEffect, useMemo, useState } from 'react';
import { FormControlLabel, FormGroup, Switch, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { BarGraphDatum, BubbleGraphSerie, SmartGraphProps } from '../../types/graph';
import { WeightName } from '../../types/survey';
import { getBarGraphData } from '../../utils/barGraph';
import { getBubbleGraphData } from '../../utils/bubbleGraph';
import BarPlot from '../BarPlot/BarPlot';
import BubblePlot from '../BubblePlot/BubblePlot';

import './SmartChart.css'

// A smart component that wraps all possible plots
export default function SmartChart ({ survey, x, y }: SmartGraphProps) {
    const [isSpecialVisible, setSpecialVisible] = useState(true)
    const [weightName, setWeightName] = useState<WeightName>('all')
    const [hiddenAnswers, setHiddenAnswers] = useState<string[]>([])

    useEffect(() => {
        setHiddenAnswers([])
    }, [survey, x, y, isSpecialVisible])

    const handleSpecialToggle = () => setSpecialVisible((currVisibility) => !currVisibility)
    const handleWeightNameChange = (_event: React.MouseEvent<HTMLElement>, wName: WeightName) => setWeightName(wName)
    const handleXAnswerClick = (ans: string) => {
        if (hiddenAnswers.includes(ans)) {
            const newHiddenAnswers = hiddenAnswers.filter(a => a !== ans)
            setHiddenAnswers(newHiddenAnswers)
        } else {
            setHiddenAnswers(hiddenAnswers.concat(ans))
        }
    }
    
    const { graphData, effectiveResponses } = useMemo(() => {
        const options = { isSpecialVisible, hiddenAnswers, weightName }

        if (y) return getBubbleGraphData({ survey, x, y }, options)
        return getBarGraphData({ survey, x }, options)
    }, [survey, x, y, isSpecialVisible, hiddenAnswers, weightName])

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

    const weightNameMenu = (
        <div className='weight-toggler'>
            Choose sector:
            <ToggleButtonGroup
                color="primary"
                value={weightName}
                exclusive
                onChange={handleWeightNameChange}
                aria-label="Weight select"
            >
                <ToggleButton
                    value="arabs"
                    disabled={!survey.meta.weights?.arabs || !survey.meta.sectorFieldName}
                >Arabs</ToggleButton>
                <ToggleButton value="all">All</ToggleButton>
                <ToggleButton
                    value="jews"
                    disabled={!survey.meta.weights?.jews || !survey.meta.sectorFieldName}
                >Jews</ToggleButton>
            </ToggleButtonGroup>
        </div>
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
                {weightNameMenu}
                {effectiveResponsesIndicator}
            </div>
            <div className='graph'>
                {smartPlot}
            </div>
        </div>
    )
};

