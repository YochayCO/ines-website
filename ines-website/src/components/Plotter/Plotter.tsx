import { useEffect, useState } from 'react'

import SurveyOptions from '../../assets/surveyOptions.json'
import { Survey } from '../../types/survey';
import { fetchSurvey } from '../../utils/survey'
import CustomSelect from '../CustomSelect/CustomSelect'
import InnerPlotter from './InnerPlotter';
import SelectContainer from './SelectContainer';

import './Plotter.css'

function Plotter() {
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

  const surveyItems = SurveyOptions.map(({ id, title }) => ({ value: id, label: title }))
  
  return (
    <>
      <SelectContainer>
        <CustomSelect 
          inputLabel='Select survey'
          value={surveyId}
          onChange={setSurveyId}
          options={surveyItems}
        />
      </SelectContainer>
      {!!survey && <InnerPlotter survey={survey} />}
    </>
  )
}

export default Plotter
