import { useState } from 'react'

import { Survey } from '../../types/survey';
import QuestionSelect from '../QuestionSelect/QuestionSelect'
import SmartChart from '../SmartChart/SmartChart';

import './Plotter.css'

export default function InnerPlotter({ survey }: { survey: Survey }) {
  // x & y are the ids of the selected questions
  const [x, setX] = useState('')
  const [y, setY] = useState('')

  const allQuestionItems = survey.meta.questionItems
  const nonDemographyQuestionItems = allQuestionItems.filter((qi) => qi.type !== 'demography')

  const xQuestionItem = allQuestionItems.find(qi => qi.questionSurveyId === x)
  const yQuestionItem = nonDemographyQuestionItems.find(qi => qi.questionSurveyId === y)

  const isGraphVisible = !!xQuestionItem && (xQuestionItem.type !== 'demography' || !!yQuestionItem)
  
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
      {isGraphVisible && (
        <SmartChart
          survey={survey}
          x={xQuestionItem}
          y={yQuestionItem}
        />
      )}
    </>
  )
}