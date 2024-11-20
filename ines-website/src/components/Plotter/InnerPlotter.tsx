import { useState } from 'react'
import map from 'lodash/map'

import { QuestionItem, Survey } from '../../types/survey';
import BarChart from '../BarChart/BarChart';
import BoxChart from '../BoxChart/BoxChart'
import QuestionSelect from '../QuestionSelect/QuestionSelect'

import './Plotter.css'

export default function InnerPlotter({ survey }: { survey: Survey }) {
  // x & y are the column letters of the selected questions
  const [x, setX] = useState('')
  const [y, setY] = useState('')

  const allQuestionItems: QuestionItem[] = map(survey.meta.questions, (qi) => qi)
  const quantityQuestionItems: QuestionItem[] = allQuestionItems.filter((qi) => qi.type == 'quantity')

  const xQuestionItem = allQuestionItems.find(qi => qi.column === x)
  const yQuestionItem = quantityQuestionItems.find(qi => qi.column === y)
  
  return (
    <>
      <QuestionSelect 
        inputLabel='Select question for X Axis' 
        value={x} 
        onChange={setX}
        questionItems={allQuestionItems}
      />
      <QuestionSelect 
        inputLabel='Select question for Y Axis' 
        value={y}
        onChange={setY}
        questionItems={quantityQuestionItems}
      />
      {(!!xQuestionItem && !!yQuestionItem) && <BoxChart
        survey={survey}
        x={xQuestionItem}
        y={yQuestionItem}
      />}
      {(!!xQuestionItem && !yQuestionItem) && <BarChart
        survey={survey}
        x={xQuestionItem}
      />}
    </>
  )
}