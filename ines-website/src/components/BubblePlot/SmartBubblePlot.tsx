import { PropertyAccessor } from '@nivo/core';
import { ComputedCell, HeatMapDatum } from '@nivo/heatmap' 
import { InheritedColorConfig } from '@nivo/colors'

import useBubbleGraph from '../../hooks/useBubbleGraph';
import { BubbleGraphDatum, SmartBubblePlotProps } from '../../types/graph';
import { getAnswerFromLabel } from '../../utils/graph';
import BubblePlot from './BubblePlot';
import SmartChart from '../SmartChart/SmartChart';

export default function SmartBubblePlot({ survey, x, y }: SmartBubblePlotProps) {
    const { xAxis, yAxis, graphData, effectiveResponses, graphOptions } = useBubbleGraph({ survey, x, y })

    const getLabel: PropertyAccessor<Omit<
        ComputedCell<HeatMapDatum & BubbleGraphDatum>, 
        "opacity" | "borderColor" | "label" | "labelTextColor" | "color"
    >, string> = (d) => {
        if (xAxis.hiddenAnswers.includes(d.data.origX)) {
            return ''
        }
        return d.formattedValue || ''
    }
    const getBorderColor: InheritedColorConfig<Omit<
        ComputedCell<HeatMapDatum & BubbleGraphDatum>,
        "borderColor"
    >> = (d) => {
        if (xAxis.hiddenAnswers.includes(d.data.origX)) {
            return 'none';
        }

        if (d.data.ansType === 'special') return '#ffff0070'
        if (d.data.ansType === 'total') return '#1515ad50'
        return '#47c04750' // Light green
    };

    const handleXTickClick = (label: string) => {
        const ans = getAnswerFromLabel(graphData, label)
        
        if (!ans) return
        
        // Avoids clearing the whole graph
        if (!xAxis.hiddenAnswers.includes(ans) && graphData[0].data.length === xAxis.hiddenAnswers.length + 1) return

        xAxis.handleAnswerToggle(ans)
    }

    const isXLabelHidden = (label: string) => {
        const ans = getAnswerFromLabel(graphData, label)
        return !!(ans && xAxis.hiddenAnswers.includes(ans))
    }

    const bubblePlotProps = {
        graphData,
        xAxis,
        yAxis,
        getLabel,
        getBorderColor,
        handleXTickClick,
        isXLabelHidden,
    }

    return <SmartChart
        children={<BubblePlot {...bubblePlotProps} />}
        surveyMeta={survey.meta}
        x={x}
        y={y}
        isDataEmpty={!graphData.length}
        chartType='bubble'
        effectiveResponses={effectiveResponses}
        graphOptions={graphOptions}
    />
}
