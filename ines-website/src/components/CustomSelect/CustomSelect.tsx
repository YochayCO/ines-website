import map from 'lodash/map'

import Select, { SelectChangeEvent } from '@mui/material/Select'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'

interface CustomSelectProps {
    inputLabel: string;
    value: string; // value is the letter of the column
    onChange: (newValue: string) => void;
    items: { value: string; label: string; }[];
}

// A Select component for selecting a single question from a bunch of questions
function CustomSelect({ inputLabel, value, onChange, items }: CustomSelectProps) {
  const menuItems = map(items, ({ value: itemValue, label }) => {
    return <MenuItem value={itemValue} key={itemValue}>{label}</MenuItem>
  })
  
  const handleChange = (event: SelectChangeEvent) => onChange(event.target.value as string)

  return (
    <>
      <FormControl sx={{ m: 1, width: '100%' }}>
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
