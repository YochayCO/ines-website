import React from 'react';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import './GroupingToggle.css';

interface GroupingToggleProps {
  groupBy: 'survey' | 'answer';
  onChange: (groupBy: 'survey' | 'answer') => void;
}

const GroupingToggle: React.FC<GroupingToggleProps> = ({ groupBy, onChange }) => {
  return (
    <ToggleButtonGroup
      value={groupBy}
      exclusive
      onChange={(_e, val) => val && onChange(val)}
      aria-label="group mode toggle"
      size="small"
      className="grouping-toggle"
    >
      <ToggleButton value="survey">Group by Survey</ToggleButton>
      <ToggleButton value="answer">Group by Answer</ToggleButton>
    </ToggleButtonGroup>
  );
};

export default GroupingToggle; 