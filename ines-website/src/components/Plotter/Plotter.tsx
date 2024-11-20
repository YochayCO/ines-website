import { useEffect, useState } from 'react'

import SurveyOptions from '../../assets/surveyOptions.json'
import { Survey } from '../../types/survey';
import { fetchSurvey } from '../../utils/survey'
import CustomSelect from '../CustomSelect/CustomSelect'
import InnerPlotter from './InnerPlotter';

import './Plotter.css'

function Plotter() {
  // x & y are the column letters of the selected questions
  const [surveyId, setSurveyId] = useState<string>('')
  const [survey, setSurvey] = useState<Survey | null>(null)
  
  async function updateSurvey (surveyId: string) {
    if (!surveyId) {
      setSurvey(null)
      return
    }

    const survey = await fetchSurvey(surveyId)
    setSurvey(survey)
  }

  useEffect(() => {
    updateSurvey(surveyId)
  }, [surveyId])

  const surveyOptions = SurveyOptions.map(({ id, name }) => ({ value: id, label: name }))
  
  return (
    <>
      <h2>Plot away!</h2>
      <CustomSelect 
        inputLabel='Select survey'
        value={surveyId}
        onChange={setSurveyId}
        items={surveyOptions}
      />
      {!!survey && <InnerPlotter survey={survey} />}
    </>
  )
}

export default Plotter
