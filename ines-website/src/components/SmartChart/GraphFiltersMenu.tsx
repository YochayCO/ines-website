import { Box, FormGroup, FormControlLabel, Switch, ToggleButtonGroup, ToggleButton } from "@mui/material";
import { GraphCommons } from "../../hooks/useGraphCommons";
import { SurveyMeta, WeightName } from "../../types/survey";
import './GraphFiltersMenu.css';

export interface GraphFiltersMenuProps {
    graphCommons: GraphCommons;
    surveyMeta: SurveyMeta;
    handleSpecialToggle: () => void;
    handleWeightNameChange: (_event: React.MouseEvent<HTMLElement>, wName: WeightName) => void;
}

export default function GraphFiltersMenu({
    graphCommons,
    surveyMeta,
    handleSpecialToggle,
    handleWeightNameChange,
}: GraphFiltersMenuProps) {
    return (
        <Box className="graph-filters-menu__container" role="presentation">
            <FormGroup className='toggle-button'>
                <FormControlLabel
                    label={`Include "Don't know" answers`}
                    control={(
                        <Switch onChange={handleSpecialToggle} checked={graphCommons.isSpecialDisplayed} />
                    )}
                />
            </FormGroup>
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
        </Box>
    );
}
