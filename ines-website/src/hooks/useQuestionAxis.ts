import { useEffect, useState } from 'react';
import { QuestionItem } from '../types/survey';
import { getQuestionTitle } from '../utils/survey';

export interface QuestionAxis {
    disabledAnswers: string[];
    handleAnswerToggle: (ans: string) => void;
    resetDisabledAnswers: () => void;
    spacing: number;
    setSpacing: (spacing: number) => void;
    title: string;
}

function useQuestionAxis(allAnswers: string[], questionItem: QuestionItem): QuestionAxis {
    const [disabledAnswers, setDisabledAnswers] = useState<string[]>([])
    const [spacing, setSpacing] = useState(0)
    const title = getQuestionTitle(questionItem.englishDescription, questionItem.questionHebrewDescription)

    const resetDisabledAnswers = () => setDisabledAnswers([])

    useEffect(resetDisabledAnswers, [allAnswers])

    const handleAnswerToggle = (ans: string) => {
        if (disabledAnswers.includes(ans)) {
            setDisabledAnswers(disabledAnswers.filter(a => a !== ans));
        } else {
            setDisabledAnswers(disabledAnswers.concat(ans));
        }
    }

    return { disabledAnswers, handleAnswerToggle, resetDisabledAnswers, spacing, setSpacing, title }
}

export default useQuestionAxis
