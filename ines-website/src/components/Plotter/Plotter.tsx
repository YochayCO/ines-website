import { useState } from 'react'
import QuestionSelect from '../QuestionSelect/QuestionSelect'
import map from 'lodash/map'

import { QuestionItem, SurveyMetadata } from '../../assets/2022_web_meta'
import ExampleSurveyMeta from '../../assets/2022_web_meta.json'

import './Plotter.css'

// TODO: replace ExampleSurveyMeta with a more robust "survey selector"
const SurveyMeta = ExampleSurveyMeta as SurveyMetadata

function Plotter() {
  // x & y are the column letters of the selected questions
  const [x, setX] = useState('')
  const [y, setY] = useState('')

  const allQuestionItems: QuestionItem[] = map(SurveyMeta.questions, (qi) => qi)
  const quantityQuestionItems: QuestionItem[] = allQuestionItems.filter((qi) => qi.type == 'quantity')
  
  return (
    <>
      <h2>Plot away!</h2>
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
      {/* TODO: Graph will appear here */}
      X column: {x}
      Y column: {y}
    </>
  )
}

export default Plotter
