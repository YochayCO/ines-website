import { useMemo } from 'react'
import { Autocomplete, Box, TextField } from '@mui/material'
import cx from 'classnames'

import './CustomSelect.css'

interface CustomOption { 
  value: string; 
  label: string; 
  tooltipText?: string; 
  className?: string;
  disabled?: boolean;
}

interface CustomSelectProps {
    inputLabel: string;
    value: string; // id
    onChange: (newValue: string) => void;
    options: CustomOption[];
    className?: string;
}

// A Select component for selecting a single question from a bunch of questions
function CustomSelect({ inputLabel, value, onChange, options, ...other }: CustomSelectProps) {
  const selectedOption = useMemo(() => options.find((option) => option.value === value) || null, [options, value])
  
  const handleChange = (_event: React.SyntheticEvent, option: CustomOption | null) => onChange(option?.value || '')

  return (
    <>
      <Autocomplete
        className='selectbox'
        sx={{ m: 1, width: 1 }}
        options={options}
        renderInput={(params) => <TextField {...params} label={inputLabel} />}
        renderOption={({ key, ...optionProps }, option) => (
          <Box 
            {...optionProps}
            key={key} 
            component='li'
            title={option.tooltipText}
            className={cx(optionProps.className, option.className)}
          >
            {option.label}
          </Box>
        )}
        value={selectedOption}
        onChange={handleChange}
        getOptionDisabled={option => !!option.disabled}
        {...other}
      />
    </>
  )
}

export default CustomSelect
