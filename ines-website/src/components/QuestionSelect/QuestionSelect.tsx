import { QuestionItem } from '../../types/survey'
import CustomSelect from '../CustomSelect/CustomSelect'

import './QuestionSelect.css'

interface QuestionSelectProps {
    inputLabel: string; // label is the description / the question
    value: string; // value is the letter of the column
    onChange: (newValue: string) => void;
    questionItems: QuestionItem[];
}

// A Select component for selecting a single question from a bunch of questions
function QuestionSelect({ inputLabel, value, onChange, questionItems }: QuestionSelectProps) {
  const options = questionItems.map(({ 
    questionSurveyId,
    questionHebrewDescription,
    englishDescription,
    type,
    disabled
  }) => ({ 
    value: questionSurveyId, 
    label: `${englishDescription} / ${questionHebrewDescription}`,
    tooltipText: questionHebrewDescription,
    className: type === 'demography' ? 'demography' : '',
    disabled,
  }))
  
  return (
    <CustomSelect
      inputLabel={inputLabel}
      options={options}
      value={value}
      onChange={onChange}
    />
  )
}

export default QuestionSelect
