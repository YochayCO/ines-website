import { useEffect, useState } from 'react'
import IconButton from '@mui/material/IconButton';
import SwipeVerticalIcon from '@mui/icons-material/SwipeVertical'

import { Survey } from '../../types/survey';
import SelectContainer from './SelectContainer';
import SmartBarPlot from '../BarPlot/SmartBarPlot';
import SmartBubblePlot from '../BubblePlot/SmartBubblePlot';
import QuestionSelect from '../QuestionSelect/QuestionSelect'

import './InnerPlotter.css'

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

  const swapXY = () => {
    const [newX, newY] = [y, x]
    setX(newX)
    setY(newY)
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
                <IconButton className='swap-button' onClick={swapXY} size='small' title='Swap X and Y axes'>
                  <SwipeVerticalIcon />
                </IconButton>
              </div>
            )}
          </>
        )}
      </div>
      {smartPlot}
    </>
  )
}