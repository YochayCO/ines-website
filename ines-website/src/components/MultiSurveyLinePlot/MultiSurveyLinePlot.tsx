import React, { useMemo } from 'react';
import { LineSeries, ResponsiveLine } from '@nivo/line';
import { Question, QuestionInstance } from '../../types/questions';
import { LineGraphYTick } from '../AxisTick/AxisTick';

interface MultiSurveyLinePlotProps {
  questionInstances: QuestionInstance[];
  question: Question;
}

const MultiSurveyLinePlot: React.FC<MultiSurveyLinePlotProps> = ({ questionInstances, question }) => {
  const xTitle = 'Survey';
  const yTitle = 'Average Response';

  // TODO: consider weights + move to utils/multiSurvey/aggregateMultiSurveyData.ts
  const normalAnswers = question.answers.filter((answer) => !answer.isOther)
  const normalAnswerValues = normalAnswers.map((answer) => answer.value)
  const minAnswer = normalAnswerValues.length > 0 ? normalAnswerValues[0] : 0
  const maxAnswer = normalAnswerValues.length > 0 ? normalAnswerValues[normalAnswerValues.length - 1] : 0

  const series: LineSeries = useMemo(() => {
    return {
      id: question.id,
      data: questionInstances.map((instance) => {
        const surveyId = instance.survey.id
        const normalResponses = instance.responses.filter((response) => normalAnswerValues.includes(response.value))
        // Average response is the weighted average of the response counts
        const averageResponse = (
          normalResponses.reduce((acc, response) => acc + response.count * response.value, 0) / 
          normalResponses.reduce((acc, response) => acc + response.count, 0)
        )
        
        return {
          x: surveyId,
          y: averageResponse,
        }
      })
    }
  }, [questionInstances])

  return (
    <div style={{ height: 400 }}>
      <ResponsiveLine
        data={[series]}
        margin={{ top: 50, right: 50, bottom: 50, left: 160 }}
        xScale={{ type: 'point' }}
        yScale={{ type: 'linear', min: minAnswer, max: maxAnswer }}
        yFormat={(value) => value ? Number(value).toFixed(4) : ''}
        gridYValues={normalAnswers.map((answer) => answer.value)}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          legend: xTitle,
          legendOffset: 36,
          legendPosition: 'middle',
        }}
        axisLeft={{
          legend: yTitle,
          legendOffset: -140,
          legendPosition: 'middle',
          renderTick: (tick) => {
            return <LineGraphYTick tick={tick} answers={normalAnswers} />
          },
        }}
        pointSize={10}
        useMesh={true}
      />
    </div>
  );
};

export default MultiSurveyLinePlot; 