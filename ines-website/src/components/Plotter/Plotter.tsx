import { useState } from 'react'
import { ToggleButton, ToggleButtonGroup, Box } from '@mui/material';
import SingleSurveyPlotter from './SingleSurveyPlotter';
import MultiSurveyPlotter from './MultiSurveyPlotter';

import './Plotter.css'

function Plotter() {
  const [view, setView] = useState<'single' | 'multi'>('single');

  return (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
        <ToggleButtonGroup
          value={view}
          exclusive
          onChange={(_e, val) => val && setView(val)}
          aria-label="plotter view toggle"
        >
          <ToggleButton value="single">Single year graph</ToggleButton>
          <ToggleButton value="multi">Multi-year graph</ToggleButton>
        </ToggleButtonGroup>
      </Box>
      {view === 'single' ? <SingleSurveyPlotter /> : <MultiSurveyPlotter />}
    </Box>
  )
}

export default Plotter
