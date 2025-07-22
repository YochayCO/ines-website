import { useEffect } from 'react'

import { useAxes } from '../../hooks/useAxes';
import { Survey } from '../../types/survey';
import SelectContainer from '../SelectContainer/SelectContainer';
import SmartBarPlot from '../BarPlot/SmartBarPlot';
import SmartBubblePlot from '../BubblePlot/SmartBubblePlot';
import QuestionSelect from '../QuestionSelect/QuestionSelect'
import SwapAxesButton from '../SwapAxesButton/SwapAxesButton';

import './InnerPlotter.css'

export default function InnerPlotter({ survey }: { survey: Survey }) {
  const { x, y, setX, setY, selectX } = useAxes();

  // Reset x and y when survey changes
  useEffect(() => {
    setX('')
    setY('')
  }, [survey, setX, setY])

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
      <div className='question-inputs-container'>
        <SelectContainer>
          <QuestionSelect 
            inputLabel='Select question for X Axis' 
            value={x} 
            onChange={selectX}
            questionItems={allQiOptions}
          />
        </SelectContainer>
        {!!x && (
          <>
            <SelectContainer>
              <QuestionSelect 
                inputLabel='Select question for Y Axis' 
                value={y}
                onChange={setY}
                questionItems={allQiOptions}
              />
            </SelectContainer>
            {!!y && (
              <div className='swap-button-container'>
                <SwapAxesButton />
              </div>            
            )}
          </>
        )}
      </div>
      {smartPlot}
    </>
  )
}