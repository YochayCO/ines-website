import { useEffect, useState } from 'react'

import { Survey } from '../../types/survey';
import { getQiOptions } from '../../utils/survey';
import QuestionSelect from '../QuestionSelect/QuestionSelect'
import SmartChart from '../SmartChart/SmartChart';

import './Plotter.css'

export default function InnerPlotter({ survey }: { survey: Survey }) {
  // x & y are the ids of the selected questions
  const [x, setX] = useState('')
  const [y, setY] = useState('')

  useEffect(() => {
    setX('')
    setY('')
  }, [survey])

  const allQiOptions = getQiOptions(survey.meta)

  const xQuestionItem = allQiOptions.find(qi => qi.questionSurveyId === x)
  const yQuestionItem = allQiOptions.find(qi => qi.questionSurveyId === y)

  const isGraphVisible = !!xQuestionItem
  
  return (
    <>
      <QuestionSelect 
        inputLabel='Select question for X Axis' 
        value={x} 
        onChange={setX}
        questionItems={allQiOptions}
      />
      <QuestionSelect 
        inputLabel='Select question for Y Axis' 
        value={y}
        onChange={setY}
        questionItems={allQiOptions}
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