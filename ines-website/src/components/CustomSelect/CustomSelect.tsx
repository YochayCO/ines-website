import map from 'lodash/map'

import Select, { SelectChangeEvent } from '@mui/material/Select'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'

import './CustomSelect.css'

interface CustomSelectProps {
    inputLabel: string;
    value: string; // id
    onChange: (newValue: string) => void;
    items: { value: string; label: string; tooltipText?: string; isDemography?: boolean; }[];
}

// A Select component for selecting a single question from a bunch of questions
function CustomSelect({ inputLabel, value, onChange, items }: CustomSelectProps) {
  const menuItems = map(items, ({ value: itemValue, label, tooltipText, isDemography }) => {
    return (
    <MenuItem 
      value={itemValue} 
      key={itemValue} 
      className={isDemography ? 'demography' : ''}
      title={tooltipText}
    >
      {label}
    </MenuItem>
  )
  })
  
  const handleChange = (event: SelectChangeEvent) => onChange(event.target.value as string)

  return (
    <>
      <FormControl sx={{ m: 1, width: 1 }}>
        <InputLabel>{inputLabel}</InputLabel>
        <Select value={value} onChange={handleChange}>
          <MenuItem value=''><em>{inputLabel}</em></MenuItem>
          {menuItems}
        </Select>
      </FormControl>
    </>
  )
}

export default CustomSelect
