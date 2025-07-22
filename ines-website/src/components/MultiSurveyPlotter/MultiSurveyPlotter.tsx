import { useEffect, useMemo, useState } from 'react';
import MultiSurveyLinePlot from '../MultiSurveyLinePlot/MultiSurveyLinePlot';
import MultiSurveyBarPlot from '../MultiSurveyBarPlot/MultiSurveyBarPlot';
import { Question, QuestionInstance } from '../../types/questions';
import CustomSelect from '../CustomSelect/CustomSelect';
import MultiSurveyQuestions from '../../assets/multiSurveyQuestions.json';
import SelectContainer from '../SelectContainer/SelectContainer';
import { fetchQuestionInstances } from '../../utils/multiSurvey/questionInstances';
import './MultiSurveyPlotter.css';

function MultiSurveyPlotter() {
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>(MultiSurveyQuestions[0].id);
  const [questionInstances, setQuestionInstances] = useState<QuestionInstance[] | undefined>(undefined);

  const selectedQuestion: Question | undefined = useMemo(() => {
    return MultiSurveyQuestions.find((question) => question.id === selectedQuestionId)
  }, [selectedQuestionId])

  const questionOptions = MultiSurveyQuestions.map((question) => ({ value: question.id, label: question.hebTitle }))
  
  async function updateQuestion (questionId: string) {
    if (questionId === '') {
      setQuestionInstances(undefined)
      return
    }
    const qInstances = await fetchQuestionInstances(questionId)
    setQuestionInstances(qInstances)
  }

  useEffect(() => {
    updateQuestion(selectedQuestionId)
  }, [selectedQuestionId]);
  
  return (
    <div className="multi-survey-plotter_container">
      {/* Question selection */}
      <SelectContainer>
      <CustomSelect 
        inputLabel='Select question'
        value={selectedQuestionId}
        onChange={setSelectedQuestionId}
        options={questionOptions}
        disableClearable={true}
      />
      </SelectContainer>
      {/* Render the selected chart type */}
      {(!!selectedQuestion && !!questionInstances) && <div className="multi-survey-plotter__chart_container">
        {selectedQuestion.type === 'numeric' ? (
          <MultiSurveyLinePlot questionInstances={questionInstances} question={selectedQuestion} />
        ) : (
          <MultiSurveyBarPlot />
        )}
      </div>}
    </div>
  );
}

export default MultiSurveyPlotter; 