import { useMemo } from 'react';
import useGraphCommons, { GraphCommons } from './useGraphCommons';
import useQuestionAxis, { QuestionAxis } from './useQuestionAxis'
import { BubbleGraphSerie, SmartBubblePlotProps } from '../types/graph';
import { getBubbleGraphData } from '../utils/bubbleGraph';
import { getBubbleGraphAnswers } from "../utils/survey";

export interface BubbleGraphHook {
    xAxis: QuestionAxis;
    yAxis: QuestionAxis;
    graphData: BubbleGraphSerie[];
    effectiveResponses: number;
    graphOptions: GraphCommons;
}

function useBubbleGraph(
    { survey, x, y }: SmartBubblePlotProps
): BubbleGraphHook {
    const graphOptions = useGraphCommons()
    const { isSpecialVisible, weightName } = graphOptions
    const { xAnswers, yAnswers } = useMemo(() => getBubbleGraphAnswers({ survey, x, y}), [survey, x, y])
    const xAxis = useQuestionAxis(xAnswers, x)
    const yAxis = useQuestionAxis(yAnswers, y)

    const { graphData, effectiveResponses } = useMemo(() => {
        const options = { isSpecialVisible, hiddenAnswers: xAxis.hiddenAnswers, weightName }
        return getBubbleGraphData({ survey, x, y }, options)
    }, [survey, x, y, isSpecialVisible, xAxis.hiddenAnswers, weightName])

    return { xAxis, yAxis, graphData, effectiveResponses, graphOptions }
}

export default useBubbleGraph;
