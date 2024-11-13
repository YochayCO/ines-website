import map from 'lodash/map'

import { QuestionItem } from '../../types/survey'
import CustomSelect from '../CustomSelect/CustomSelect'

interface QuestionSelectProps {
    inputLabel: string; // label is the description / the question
    value: string; // value is the letter of the column
    onChange: (newValue: string) => void;
    questionItems: QuestionItem[];
}

// A Select component for selecting a single question from a bunch of questions
function QuestionSelect({ inputLabel, value, onChange, questionItems }: QuestionSelectProps) {
  const items = map(questionItems, ({ column, description }) => ({ value: column, label: description }))

  return (
    <CustomSelect
      inputLabel={inputLabel}
      items={items}
      value={value}
      onChange={onChange}
    />
  )
}

export default QuestionSelect
