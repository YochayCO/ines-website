import { useState } from 'react'
import map from 'lodash/map'

import { QuestionItem, Survey } from '../../types/survey';
import QuestionSelect from '../QuestionSelect/QuestionSelect'
import SmartChart from '../SmartChart/SmartChart';

import './Plotter.css'

export default function InnerPlotter({ survey }: { survey: Survey }) {
  // x & y are the column titles of the selected questions
  const [x, setX] = useState('')
  const [y, setY] = useState('')

  const allQuestionItems: QuestionItem[] = map(survey.meta.questions, (qi) => qi)
  const nonDemographyQuestionItems: QuestionItem[] = allQuestionItems.filter((qi) => qi.type !== 'demography')

  const xQuestionItem = allQuestionItems.find(qi => qi.column === x)
  const yQuestionItem = nonDemographyQuestionItems.find(qi => qi.column === y)

  const isGraphVisible = !!xQuestionItem && xQuestionItem.type !== 'demography'
  
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
        questionItems={nonDemographyQuestionItems}
      />
      {isGraphVisible && <SmartChart
        survey={survey}
        x={xQuestionItem}
        y={yQuestionItem}
      />}
    </>
  )
}