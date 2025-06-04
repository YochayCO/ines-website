import { useEffect, useMemo } from 'react';
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
    const { isSpecialDisplayed, weightName } = graphCommons;
    const xAnswers = useMemo(() => getBarGraphAnswers({ survey, x }), [survey, x])
    
    const xAxis = useQuestionAxis(xAnswers, x)

    useEffect(() => {
        xAxis.resetDisabledAnswers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isSpecialDisplayed])

    const { data: graphData, meta: graphMeta } = useMemo(() => {
        const options = { isSpecialDisplayed, disabledXAnswers: xAxis.disabledAnswers, weightName }
        return getBarGraphData({ survey, x }, options)
    }, [survey, x, isSpecialDisplayed, xAxis.disabledAnswers, weightName])

    return { xAxis, graphData, graphMeta, graphCommons }
}

export default useBarGraph;
