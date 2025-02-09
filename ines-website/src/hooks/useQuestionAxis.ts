import { useEffect, useState } from 'react';
import { QuestionItem } from '../types/survey';
import { getQuestionTitle } from '../utils/survey';

export interface QuestionAxis {
    hiddenAnswers: string[];
    handleAnswerToggle: (ans: string) => void;
    spacing: number;
    setSpacing: (spacing: number) => void;
    title: string;
}

function useQuestionAxis(allAnswers: string[], questionItem: QuestionItem): QuestionAxis {
    const [hiddenAnswers, setHiddenAnswers] = useState<string[]>([])
    const [spacing, setSpacing] = useState(0)
    const title = getQuestionTitle(questionItem.englishDescription, questionItem.questionHebrewDescription)

    useEffect(() => {
        setHiddenAnswers([])
    }, [allAnswers])

    const handleAnswerToggle = (ans: string) => {
        if (hiddenAnswers.includes(ans)) {
            setHiddenAnswers(hiddenAnswers.filter(a => a !== ans));
        } else {
            setHiddenAnswers(hiddenAnswers.concat(ans));
        }
    }

    return { hiddenAnswers, handleAnswerToggle, spacing, setSpacing, title }
}

export default useQuestionAxis
