import { useState } from "react";
import { Popover, Badge, IconButton } from "@mui/material";
import TuneIcon from '@mui/icons-material/Tune';
import { GraphCommons } from "../../hooks/useGraphCommons";
import useGraphHeader from "../../hooks/useGraphHeader"
import { SurveyMeta } from "../../types/survey";
import GraphFiltersMenu from "./GraphFiltersMenu";

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
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleFiltersClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
        setFiltersOpen(true);
    };
    const handleFiltersClose = () => {
        setAnchorEl(null);
        setFiltersOpen(false);
    };

    // Filters menu content
    const filtersMenu = (
        <GraphFiltersMenu
            graphCommons={graphCommons}
            surveyMeta={surveyMeta}
            handleSpecialToggle={handleSpecialToggle}
            handleWeightNameChange={handleWeightNameChange}
        />
    );

    const numOfEffectiveResponsesIndicator = (
        <div className='responses-sum-container'>
            # of Responses:<div className='responses-sum'>{numOfEffectiveResponses}</div>
        </div>
    )

    const showBadge = !graphCommons.isSpecialDisplayed || graphCommons.weightName !== 'all';
    
    return (
        <div className='graph-header' style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Badge
                color="primary"
                variant="dot"
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                invisible={!showBadge}
                title={showBadge ? "Some filters are applied" : "No filters are applied"}
            >
                <IconButton
                    color='primary'
                    onClick={handleFiltersClick}
                    title={"Open filters menu"}
                >
                    <TuneIcon />
                </IconButton>
            </Badge>
            <Popover
                open={filtersOpen}
                anchorEl={anchorEl}
                onClose={handleFiltersClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
            >
                {filtersMenu}
            </Popover>
            {numOfEffectiveResponsesIndicator}
        </div>
    )
}