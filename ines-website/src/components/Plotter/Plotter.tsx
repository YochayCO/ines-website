import { useState } from 'react'
import { ToggleButton, ToggleButtonGroup, Box } from '@mui/material';
import SingleSurveyPlotter from '../SingleSurveyPlotter/SingleSurveyPlotter';
import MultiSurveyPlotter from '../MultiSurveyPlotter/MultiSurveyPlotter';

import './Plotter.css'

function Plotter() {
  const [view, setView] = useState<'single' | 'multi'>('single');
  const isProduction = window.location.href.startsWith('https://socsci4.tau.ac.il/playground');

  return (
    <Box>
      <Box className="plotter_toggle-group_container">
        {!isProduction && <ToggleButtonGroup
          value={view}
          exclusive
          onChange={(_e, val) => val && setView(val)}
          aria-label="plotter view toggle"
        >
          <ToggleButton value="single">Single year graph</ToggleButton>
            <ToggleButton value="multi">Multi-year graph</ToggleButton>
        </ToggleButtonGroup>}
      </Box>
      {view === 'single' ? <SingleSurveyPlotter /> : <MultiSurveyPlotter />}
    </Box>
  )
}

export default Plotter
