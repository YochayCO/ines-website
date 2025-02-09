import { useMemo } from 'react';
import useQuestionAxis, { QuestionAxis } from './useQuestionAxis'
import useGraphCommons, { GraphCommons } from './useGraphCommons';
import { BarGraphDatum, SmartBarPlotProps } from '../types/graph';
import { getBarGraphData } from '../utils/barGraph';
import { getBarGraphAnswers } from '../utils/survey';

export interface BarGraphHook {
    xAxis: QuestionAxis;
    graphData: BarGraphDatum[];
    effectiveResponses: number;
    graphOptions: GraphCommons;
}

function useBarGraph(
    { survey, x }: SmartBarPlotProps
): BarGraphHook {
    const graphOptions = useGraphCommons()
    const xAnswers = useMemo(() => getBarGraphAnswers({ survey, x }), [survey, x])
    const xAxis = useQuestionAxis(xAnswers, x)

    const { graphData, effectiveResponses } = useMemo(() => {
        return getBarGraphData({ survey, x }, graphOptions)
    }, [survey, x, graphOptions])

    return { xAxis, graphData, effectiveResponses, graphOptions }
}

export default useBarGraph;
