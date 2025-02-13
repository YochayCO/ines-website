import { ReactNode } from 'react';
import { GraphCommons } from '../../hooks/useGraphCommons';
import useScreenshotHandler from '../../hooks/useScreenshotHandler';
import { GraphMeta } from '../../types/graph';
import { QuestionItem, SurveyMeta } from '../../types/survey';
import { columnsNoOverlapMessage, noResultDefaultMessage, sectorNoResultMessage } from './EmptyChartMessages';
import GraphHeader from './GraphHeader';
import GraphFooter from './GraphFooter';
import ScreenshotButton from '../ScreenshotButton/ScreenshotButton';

import './SmartChart.css'

interface SmartChartProps {
    children: ReactNode;
    surveyMeta: SurveyMeta;
    x: QuestionItem;
    y?: QuestionItem; 
    chartType: 'bar' | 'bubble';
    graphMeta: GraphMeta;
    isGraphEmpty: boolean;
    graphCommons: GraphCommons;
}

// A hoc to wrap the graph
const SmartChart = ({ children, surveyMeta, chartType, graphMeta, isGraphEmpty, graphCommons }: SmartChartProps) => {
    const { exportGraph, exportButtonRef, graphRef } = useScreenshotHandler()
    const { numOfEffectiveResponses } = graphMeta

    let smartPlot: ReactNode
    
    if (!numOfEffectiveResponses) {
        // This is almost definitely a case of no-overlap between the two selected columns
        if (chartType === 'bubble' && isGraphEmpty) {
            smartPlot = columnsNoOverlapMessage
        // Heuristically, this means that the sector is the filter which empties the search.
        } else if (graphCommons.weightName !== 'all') {
            smartPlot = sectorNoResultMessage
        // A more general message that does not hint that the sector is the issue
        } else {
            smartPlot = noResultDefaultMessage
        }
    } else {
        smartPlot = children
    }

    const graphHeaderProps = {
        surveyMeta,
        numOfEffectiveResponses,
        graphCommons,
    }

    return (
        <div className='graph-container'>
            <GraphHeader {...graphHeaderProps} />
            <div id="graph" ref={graphRef}>
                <ScreenshotButton exportGraph={exportGraph} exportButtonRef={exportButtonRef}  />
                {smartPlot}
            </div>
            <GraphFooter dataLink={surveyMeta.dataLink} />
        </div>
    )
};

export default SmartChart
