import map from 'lodash/map'

import Select, { SelectChangeEvent } from '@mui/material/Select'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'

import { QuestionItem } from '../../assets/2022_web_meta'

interface QuestionSelectProps {
    inputLabel: string; // label is the description / the question
    value: string; // value is the letter of the column
    onChange: (newValue: string) => void;
    questionItems: QuestionItem[];
}

// A Select component for selecting a single question from a bunch of questions
function QuestionSelect({ inputLabel, value, onChange, questionItems: questions }: QuestionSelectProps) {
  const questionItems = map(questions, ({ column, description }) => {
    return <MenuItem value={column} key={column}>{description}</MenuItem>
  })
  const handleChange = (event: SelectChangeEvent) => onChange(event.target.value as string)

  return (
    <>
      <FormControl sx={{ m: 1, width: '100%' }}>
        <InputLabel>{inputLabel}</InputLabel>
        <Select value={value} onChange={handleChange}>
          <MenuItem value=''><em>{inputLabel}</em></MenuItem>
          {questionItems}
        </Select>
      </FormControl>
    </>
  )
}

export default QuestionSelect
