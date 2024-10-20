import { useEffect, useState } from 'react'
import map from 'lodash/map'
import QuestionSelect from '../QuestionSelect/QuestionSelect'

import { QuestionItem, SurveyMetadata } from '../../assets/2022_web_meta'
import EXAMPLE_SURVEY_META from '../../assets/2022_web_meta.json'
import SURVEY_PEOPLE_DATA_EXAMPLE from '../../assets/2022_web_people.json'
import { PersonData } from '../../assets/2022_web_people'

import './Plotter.css'

// TODO: replace examples with actual fetch actions
const surveyMeta = EXAMPLE_SURVEY_META as SurveyMetadata
const surveyPeople = SURVEY_PEOPLE_DATA_EXAMPLE as PersonData[]

function Plotter() {
  // x & y are the column letters of the selected questions
  const [x, setX] = useState('')
  const [y, setY] = useState('')
  const [peopleData, setPeopleData] = useState<PersonData[]>([])

  useEffect(() => {
    // If one of the columns is unselected, remove the current graph
    if (!x || !y) {
      !!peopleData && setPeopleData([])
      return
    }

    // TODO: fetch real data
    setPeopleData(surveyPeople)
  }, [x,y])

  const allQuestionItems: QuestionItem[] = map(surveyMeta.questions, (qi) => qi)
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
      People Data: {peopleData?.length}
    </>
  )
}

export default Plotter
