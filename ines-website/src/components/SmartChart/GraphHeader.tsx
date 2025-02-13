import { FormGroup, FormControlLabel, Switch, ToggleButtonGroup, ToggleButton } from "@mui/material"
import { GraphCommons } from "../../hooks/useGraphCommons";
import useGraphHeader from "../../hooks/useGraphHeader"
import { SurveyMeta } from "../../types/survey";

import './GraphHeader.css'

export interface GraphHeaderProps {
    graphCommons: GraphCommons;
    surveyMeta: SurveyMeta;
    numOfEffectiveResponses: number;
}

export default function GraphHeader ({ 
    graphCommons,
    surveyMeta, 
    numOfEffectiveResponses 
}: GraphHeaderProps) {
    const { handleSpecialToggle, handleWeightNameChange } = useGraphHeader(graphCommons)
    
    const toggleButton = (
        <FormGroup className='toggle-button'>
            <FormControlLabel 
                label={`Include "Don't know" answers`}
                control={(
                    <Switch onChange={handleSpecialToggle} checked={graphCommons.isSpecialDisplayed} />
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
                value={graphCommons.weightName}
                exclusive
                onChange={handleWeightNameChange}
                aria-label="Weight select"
            >
                <ToggleButton
                    value="arabs"
                    disabled={!surveyMeta.weights?.arabs || !surveyMeta.sectorFieldName}
                >Arabs</ToggleButton>
                <ToggleButton value="all">All</ToggleButton>
                <ToggleButton
                    value="jews"
                    disabled={!surveyMeta.weights?.jews || !surveyMeta.sectorFieldName}
                >Jews</ToggleButton>
            </ToggleButtonGroup>
        </div>
    )

    const numOfEffectiveResponsesIndicator = (
        <div className='responses-sum-container'>
            # of Responses:<div className='responses-sum'>{numOfEffectiveResponses}</div>
        </div>
    )
    
    return (
        <div className='graph-header'>
            {toggleButton}
            {weightNameMenu}
            {numOfEffectiveResponsesIndicator}
        </div>
    )
}