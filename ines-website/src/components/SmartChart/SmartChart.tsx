import { ReactNode, useEffect, useMemo, useState } from 'react';
import { Button, FormControlLabel, FormGroup, Switch, ToggleButton, ToggleButtonGroup } from '@mui/material';
import useScreenshotHandler from '../../hooks/useScreenshotHandler';
import { BarGraphDatum, BubbleGraphSerie, SmartGraphProps } from '../../types/graph';
import { WeightName } from '../../types/survey';
import { getBarGraphData } from '../../utils/barGraph';
import { getBubbleGraphData } from '../../utils/bubbleGraph';
import BarPlot from '../BarPlot/BarPlot';
import BubblePlot from '../BubblePlot/BubblePlot';
import { columnsNoOverlapMessage, noResultDefaultMessage, sectorNoResultMessage } from './EmptyChartMessages';
import ScreenshotButton from '../ScreenshotButton/ScreenshotButton';

import './SmartChart.css'

// A smart component that wraps all possible plots
export default function SmartChart ({ survey, x, y }: SmartGraphProps) {
    const [isSpecialVisible, setSpecialVisible] = useState(true)
    const [weightName, setWeightName] = useState<WeightName>('all')
    const [hiddenAnswers, setHiddenAnswers] = useState<string[]>([])
    const { exportGraph, exportButtonRef, graphRef } = useScreenshotHandler()

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
                label={`Include "Don't know" answers`}
                control={(
                    <Switch onChange={handleSpecialToggle} checked={isSpecialVisible} />
                )}
            />
        </FormGroup>
    )

    const weightNameMenu = (
        <div className='weight-toggler'>
            Sector:
            <ToggleButtonGroup
                className='sector-select-group'
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

    const fullDataLink = (
        <div className='full-data-btn-container'>
            <Button
                className='full-data-btn'
                variant="outlined"
                href={survey.meta.dataLink}
                target='_blank'
                rel='noreferrer'
            >{'Full Data >>'}</Button>
        </div>
    )

    const effectiveResponsesIndicator = (
        <div className='responses-sum-container'>
            # of Responses:<div className='responses-sum'>{effectiveResponses}</div>
        </div>
    )

    let smartPlot: ReactNode
    
    if (!effectiveResponses) {
        // This is almost definitely a case of no-overlap between the two selected columns
        if (y && !graphData.length) {
            smartPlot = columnsNoOverlapMessage
        // Heuristically, this means that the sector is the filter which empties the search.
        } else if (weightName !== 'all') {
            smartPlot = sectorNoResultMessage
        // A more general message that does not hint that the sector is the issue
        } else {
            smartPlot = noResultDefaultMessage
        }
    } else if (y) {
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
                yTitle='Share of respondents'
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
            <div id="graph" ref={graphRef}>
                <ScreenshotButton exportGraph={exportGraph} exportButtonRef={exportButtonRef}  />
                {smartPlot}
            </div>
            {fullDataLink}
        </div>
    )
};

