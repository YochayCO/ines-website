import { PropertyAccessor } from '@nivo/core';
import { ComputedCell, HeatMapDatum } from '@nivo/heatmap' 
import { InheritedColorConfig } from '@nivo/colors'

import useBubbleGraph from '../../hooks/useBubbleGraph';
import { BubbleGraphDatum, SmartBubblePlotProps } from '../../types/graph';
import { getAnswerFromXLabel, getAnswerFromYLabel } from '../../utils/graph';
import BubblePlot from './BubblePlot';
import SmartChart from '../SmartChart/SmartChart';

export default function SmartBubblePlot({ survey, x, y }: SmartBubblePlotProps) {
    const { xAxis, yAxis, graphData, graphMeta, graphCommons } = useBubbleGraph({ survey, x, y })

    const getLabel: PropertyAccessor<Omit<
        ComputedCell<HeatMapDatum & BubbleGraphDatum>, 
        "opacity" | "borderColor" | "label" | "labelTextColor" | "color"
    >, string> = (d) => {
        if (d.data.disabled) {
            return ''
        }
        return d.formattedValue || ''
    }
    const getBorderColor: InheritedColorConfig<Omit<
        ComputedCell<HeatMapDatum & BubbleGraphDatum>,
        "borderColor"
    >> = (d) => {
        if (d.data.disabled) {
            return 'none';
        }

        if (d.data.ansType === 'special') return '#ffff0070'
        if (d.data.ansType === 'total') return '#1515ad50'
        return '#47c04750' // Light green
    };

    const handleXTickClick = (label: string) => {
        const ans = getAnswerFromXLabel(graphData, label)
        
        if (!ans) return

        xAxis.handleAnswerToggle(ans)
    }

    const isXLabelDisabled = (label: string) => {
        const ans = getAnswerFromXLabel(graphData, label)
        return !!(ans && xAxis.disabledAnswers.includes(ans))
    }

    const handleYTickClick = (label: string) => {
        const ans = getAnswerFromYLabel(graphData, label)
        
        if (!ans) return

        yAxis.handleAnswerToggle(ans)
    }

    const isYLabelDisabled = (label: string) => {
        const ans = getAnswerFromYLabel(graphData, label)
        return !!(ans && yAxis.disabledAnswers.includes(ans))
    }

    const bubblePlotProps = {
        graphData,
        xAxis,
        yAxis,
        getLabel,
        getBorderColor,
        handleXTickClick,
        isXLabelDisabled,
        handleYTickClick,
        isYLabelDisabled,
    }

    return <SmartChart
        children={<BubblePlot {...bubblePlotProps} />}
        surveyMeta={survey.meta}
        x={x}
        y={y}
        isGraphEmpty={!graphData.length}
        chartType='bubble'
        graphMeta={graphMeta}
        graphCommons={graphCommons}
    />
}
