import { ComputedDatum } from '@nivo/bar'
import useBarGraph from '../../hooks/useBarGraph';
import { BarGraphDatum, SmartBarPlotProps } from '../../types/graph';
import BarPlot from './BarPlot';
import SmartChart from '../SmartChart/SmartChart';

export default function SmartBarPlot({ survey, x }: SmartBarPlotProps) {
    const { xAxis, graphData, graphMeta, graphCommons } = useBarGraph({ survey, x })
    const handleBarClick = (bar: ComputedDatum<BarGraphDatum>) => {
        xAxis.handleAnswerToggle(bar.indexValue as string)
    }

    const formattedLabel = (bar: ComputedDatum<BarGraphDatum>): string => {
        return `${bar.formattedValue}%`
    }

    const barPlotProps = {
        data: graphData,
        xTitle: xAxis.title,
        yTitle: 'Share of respondents',
        handleBarClick,
        formattedLabel,
    }

    return <SmartChart 
        children={<BarPlot {...barPlotProps} />} 
        surveyMeta={survey.meta} 
        x={x} 
        isGraphEmpty={!graphData.length} 
        chartType='bar' 
        graphMeta={graphMeta} 
        graphCommons={graphCommons}
    />
}
