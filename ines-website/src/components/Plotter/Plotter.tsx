import { useState } from 'react'
import { map } from 'lodash'

import Select, { SelectChangeEvent } from '@mui/material/Select'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'

import surveyMeta from '../../assets/2022_web_meta.json'
import './Plotter.css'

function Plotter() {
  const [selectedOption, setSelectedOption] = useState('')
  const questionItems = map(surveyMeta.Questions, (questionObj, colLetter) => {
    return <MenuItem value={colLetter} key={colLetter}>{questionObj.description}</MenuItem>
  })
  const onQuestionChange = (event: SelectChangeEvent) => setSelectedOption(event.target.value as string)

  return (
    <>
      <h2>Plot away!</h2>
      <FormControl sx={{ m: 1, minWidth: 600 }}>
        <InputLabel>Select question for X Axis</InputLabel>
        <Select value={selectedOption} onChange={onQuestionChange}>
          <MenuItem value=''><em>Select question for X Axis</em></MenuItem>
          {questionItems}
        </Select>
      </FormControl>
    </>
  )
}

export default Plotter
