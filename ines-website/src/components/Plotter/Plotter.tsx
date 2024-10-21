import { useEffect, useState } from 'react'
import map from 'lodash/map'
import BoxChart from '../BoxChart/BoxChart'
import QuestionSelect from '../QuestionSelect/QuestionSelect'

import { GraphData } from '../../utils/graph'
import { QuestionItem, SurveyMetadata } from '../../assets/2022_web_meta'
import EXAMPLE_SURVEY_META from '../../assets/2022_web_meta.json'
import SURVEY_PEOPLE_DATA_EXAMPLE from '../../assets/2022_web_people.json'
import { RawData } from '../../assets/2022_web_people'

import './Plotter.css'

// TODO: replace examples with actual fetch actions
const surveyMeta = EXAMPLE_SURVEY_META as SurveyMetadata
const surveyRawData = SURVEY_PEOPLE_DATA_EXAMPLE as RawData

function getGraphData(data: RawData, x: string, y: string) {
  return data.map(p => ({ x: p[x].toString(), y: p[y] }))
}

function Plotter() {
  // x & y are the column letters of the selected questions
  const [x, setX] = useState('')
  const [y, setY] = useState('')
  const [graphData, setGraphData] = useState<GraphData | null>(null)

  // If one of the columns is unselected, remove the current graph
  useEffect(() => {
    // TODO: fetch real data
    setGraphData((!x || !y) ? null : getGraphData(surveyRawData, x, y))
  }, [x,y])


  const allQuestionItems: QuestionItem[] = map(surveyMeta.questions, (qi) => qi)
  const quantityQuestionItems: QuestionItem[] = allQuestionItems.filter((qi) => qi.type == 'quantity')

  // Temporary. TODO remove
  const xExampleQuestionItems = allQuestionItems.filter(qi => qi.column === 'v52a')
  const yExampleQuestionItems = quantityQuestionItems.filter(qi => qi.column === 'v111')
  
  return (
    <>
      <h2>Plot away!</h2>
      <QuestionSelect 
        inputLabel='Select question for X Axis' 
        value={x} 
        onChange={setX}
        questionItems={xExampleQuestionItems}
      />
      <QuestionSelect 
        inputLabel='Select question for Y Axis' 
        value={y}
        onChange={setY}
        questionItems={yExampleQuestionItems}
      />
      {graphData && <BoxChart
        // x={x}
        // y={y}
        width={800} 
        height={400}
        data={graphData}
        chartType='quantity'
      />}
    </>
  )
}

export default Plotter
