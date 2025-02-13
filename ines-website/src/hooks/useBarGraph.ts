import { useMemo } from 'react';
import useQuestionAxis, { QuestionAxis } from './useQuestionAxis'
import useGraphCommons, { GraphCommons } from './useGraphCommons';
import { BarGraphDatum, GraphMeta, SmartBarPlotProps } from '../types/graph';
import { getBarGraphData } from '../utils/barGraph';
import { getBarGraphAnswers } from '../utils/survey';

export interface BarGraphHook {
    xAxis: QuestionAxis;
    graphData: BarGraphDatum[];
    graphMeta: GraphMeta;
    graphCommons: GraphCommons;
}

function useBarGraph(
    { survey, x }: SmartBarPlotProps
): BarGraphHook {
    const graphCommons = useGraphCommons()
    const xAnswers = useMemo(() => getBarGraphAnswers({ survey, x }), [survey, x])
    const xAxis = useQuestionAxis(xAnswers, x)

    const { graphData, numOfEffectiveResponses } = useMemo(() => {
        return getBarGraphData({ survey, x }, graphCommons)
    }, [survey, x, graphCommons])

    const graphMeta = { numOfEffectiveResponses }

    return { xAxis, graphData, graphMeta, graphCommons }
}

export default useBarGraph;
