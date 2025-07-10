import { useEffect, useState } from 'react'

import AxesProvider from '../../context/AxesContext';
import SurveyOptions from '../../assets/surveyOptions.json'
import { Survey } from '../../types/survey';
import { fetchSurvey } from '../../utils/survey'
import CustomSelect from '../CustomSelect/CustomSelect'
import InnerPlotter from './InnerPlotter';
import SelectContainer from './SelectContainer';

function SingleSurveyPlotter() {
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
    <AxesProvider>
      <SelectContainer>
        <CustomSelect 
          inputLabel='Select survey'
          value={surveyId}
          onChange={setSurveyId}
          options={surveyItems}
        />
      </SelectContainer>
      {!!survey && <InnerPlotter survey={survey} />}
    </AxesProvider>
  )
}

export default SingleSurveyPlotter; 