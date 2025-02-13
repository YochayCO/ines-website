import { useEffect, useMemo } from 'react';
import useGraphCommons, { GraphCommons } from './useGraphCommons';
import useQuestionAxis, { QuestionAxis } from './useQuestionAxis'
import { GraphMeta, BubbleGraphSerie, SmartBubblePlotProps } from '../types/graph';
import { getBubbleGraphData } from '../utils/bubbleGraph';
import { getBubbleGraphAnswers } from "../utils/survey";

export interface BubbleGraphHook {
    xAxis: QuestionAxis;
    yAxis: QuestionAxis;
    graphData: BubbleGraphSerie[];
    graphMeta: GraphMeta;
    graphCommons: GraphCommons;
}

function useBubbleGraph(
    { survey, x, y }: SmartBubblePlotProps
): BubbleGraphHook {
    const graphCommons = useGraphCommons()
    const { isSpecialDisplayed, weightName } = graphCommons
    const { xAnswers, yAnswers } = useMemo(() => getBubbleGraphAnswers({ survey, x, y}), [survey, x, y])
    const xAxis = useQuestionAxis(xAnswers, x)
    const yAxis = useQuestionAxis(yAnswers, y)

    useEffect(() => {
        xAxis.resetHiddenAnswers()
        yAxis.resetHiddenAnswers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isSpecialDisplayed])

    const { data: graphData, meta: graphMeta } = useMemo(() => {
        const options = { isSpecialDisplayed, disabledXAnswers: xAxis.hiddenAnswers, disabledYAnswers: yAxis.hiddenAnswers, weightName }
        return getBubbleGraphData({ survey, x, y }, options)
    }, [survey, x, y, isSpecialDisplayed, xAxis.hiddenAnswers, yAxis.hiddenAnswers, weightName])

    return { xAxis, yAxis, graphData, graphMeta, graphCommons }
}

export default useBubbleGraph;
