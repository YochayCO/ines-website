import { useEffect, useState } from 'react'

import { Survey } from '../../types/survey';
import SmartBarPlot from '../BarPlot/SmartBarPlot';
import SmartBubblePlot from '../BubblePlot/SmartBubblePlot';
import QuestionSelect from '../QuestionSelect/QuestionSelect'

import './Plotter.css'

export default function InnerPlotter({ survey }: { survey: Survey }) {
  // x & y are the ids of the selected questions
  const [x, setX] = useState('')
  const [y, setY] = useState('')

  useEffect(() => {
    setX('')
    setY('')
  }, [survey])

  const selectX = (newX: string) => {
    setX(newX)
    if (newX === '') setY('')
  }

  const allQiOptions = survey.meta.questionItems

  const xQuestionItem = allQiOptions.find(qi => qi.questionSurveyId === x)
  const yQuestionItem = allQiOptions.find(qi => qi.questionSurveyId === y)

  const isGraphVisible = !!xQuestionItem

  let smartPlot: JSX.Element | null = null
  if (!isGraphVisible) {
    smartPlot = null
  } else if (yQuestionItem) {
    smartPlot = <SmartBubblePlot survey={survey} x={xQuestionItem} y={yQuestionItem} />
  } else {
    smartPlot = <SmartBarPlot survey={survey} x={xQuestionItem} />
  }
  
  return (
    <>
      <QuestionSelect 
        inputLabel='Select question for X Axis' 
        value={x} 
        onChange={selectX}
        questionItems={allQiOptions}
      />
      {x && (
        <QuestionSelect 
          inputLabel='Select question for Y Axis' 
          value={y}
          onChange={setY}
          questionItems={allQiOptions}
        />
      )}
      {smartPlot}
    </>
  )
}