import { useEffect, useState } from 'react'
import map from 'lodash/map'

import SurveyOptions from '../../assets/surveyOptions.json'
import { QuestionItem, Survey, SurveyRow } from '../../types/survey'
import { GraphData } from '../../utils/graph'
import { fetchSurvey } from '../../utils/survey'
import BoxChart from '../BoxChart/BoxChart'
import CustomSelect from '../CustomSelect/CustomSelect'
import QuestionSelect from '../QuestionSelect/QuestionSelect'

import './Plotter.css'

function getGraphData(rows: SurveyRow[] | undefined, x: string, y: string): GraphData | undefined {
  if (!x || !y || !rows) return undefined

  return rows.map(row => ({ x: row[x].split('.')[0], y: Number(row[y].split('.')[0]) }))
}

function Plotter() {
  // x & y are the column letters of the selected questions
  const [surveyId, setSurveyId] = useState<string>('')
  const [survey, setSurvey] = useState<Survey | null>(null)
  const [x, setX] = useState('')
  const [y, setY] = useState('')
  
  async function updateSurvey (surveyId: string) {
    if (!surveyId) return setSurvey(null)

    const survey = await fetchSurvey(surveyId)
    setSurvey(survey)
  }

  useEffect(() => {
    updateSurvey(surveyId)
  }, [surveyId])

  const surveyOptions = SurveyOptions.map(({ id, name }) => ({ value: id, label: name }))

  const allQuestionItems: QuestionItem[] = map(survey?.meta.questions, (qi) => qi)
  const quantityQuestionItems: QuestionItem[] = allQuestionItems.filter((qi) => qi.type == 'quantity')

  const xQuestionItem = allQuestionItems.find(qi => qi.column === x)
  const yQuestionItem = quantityQuestionItems.find(qi => qi.column === y)

  const graphData = getGraphData(survey?.data, x, y)
  
  return (
    <>
      <h2>Plot away!</h2>
      <CustomSelect 
        inputLabel='Select survey'
        value={surveyId}
        onChange={setSurveyId}
        items={surveyOptions}
      />
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
      {graphData && <BoxChart
        xTitle={xQuestionItem?.description || x}
        yTitle={yQuestionItem?.description || y}
        data={graphData}
        chartType='quantity'
      />}
    </>
  )
}

export default Plotter
