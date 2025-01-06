import { PropertyAccessor } from '@nivo/core';
import { ComputedCell, HeatMapDatum, ResponsiveHeatMap } from '@nivo/heatmap' 
import { InheritedColorConfig } from '@nivo/colors'
import { getAnswerFromLabel } from '../../utils/graph';
import { BubbleGraphDatum, BubbleGraphSerie } from '../../types/graph';
import { CustomTick, RegularXTick, RegularYTick } from './AxisTick';

import './BubblePlot.css'

interface BubblePlotProps { 
    data: BubbleGraphSerie[];
    xTitle: string;
    yTitle: string;
    hiddenAnswers: string[];
    onXAnswerClick: (ans: string) => void;
}

export default function BubblePlot({ data, xTitle, yTitle, hiddenAnswers, onXAnswerClick }: BubblePlotProps) {
    const getLabel: PropertyAccessor<Omit<
        ComputedCell<HeatMapDatum & BubbleGraphDatum>, 
        "opacity" | "borderColor" | "label" | "labelTextColor" | "color"
    >, string> = (d) => {
        if (hiddenAnswers.includes(d.data.origX)) {
            return ''
        }
        return d.formattedValue || ''
    }
    const getBorderColor: InheritedColorConfig<Omit<
        ComputedCell<HeatMapDatum & BubbleGraphDatum>,
        "borderColor"
    >> = (d) => {
        if (hiddenAnswers.includes(d.data.origX)) {
            return 'none';
        }

        return d.data.ansType === 'normal' ? 'none' : 'yellow';
    };

    const handleXTickClick = (label: string) => {
        const ans = getAnswerFromLabel(data, label)
        
        if (!ans) return
        // Avoid bug where there is no table (which is a useless case)
        if (!hiddenAnswers.includes(ans) && data[0].data.length === hiddenAnswers.length + 1) return

        onXAnswerClick(ans)
    }

    const isLabelHidden = (label: string) => {
        const ans = getAnswerFromLabel(data, label)
        return !!(ans && hiddenAnswers.includes(ans))
    }

    return (
        <div className='bubbleplot-container'>
            <ResponsiveHeatMap
                data={data}
                sizeVariation={{ sizes: [0.5, 1]}}
                cellComponent='circle'
                valueFormat={(num) => `${num}%`}
                label={getLabel}
                margin={{ top: 60, right: 160, bottom: 200, left: 90 }}
                axisBottom={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 20,
                    legend: <tspan className='axis-legend'>{xTitle}<title>{xTitle}</title></tspan>,
                    legendPosition: 'start',
                    legendOffset: 180,
                    renderTick: (tick) => RegularXTick(tick, data)
                }}
                axisRight={{
                    renderTick: (tick) => RegularYTick(tick, data)
                }}
                axisLeft={{
                    legend: <tspan className='axis-legend'>{yTitle}<title>{yTitle}</title></tspan>,
                    legendPosition: 'start',
                    legendOffset: -60,
                    tickValues: [],
                }}
                axisTop={{
                    renderTick: (tick) => CustomTick({ 
                        ...tick, 
                        isHidden: isLabelHidden(tick.value), 
                        handleClick: handleXTickClick 
                    }),
                }}
                tooltip={({ cell }) => (
                    <div className='tooltip'>
                        <b>X Answer</b>: {cell.data.origX}
                        <br/>
                        <b>Y Answer</b>: {cell.data.origId}
                    </div>
                )}
                colors={{ type: 'diverging', scheme: 'blues' }}
                borderColor={getBorderColor}
                borderWidth={2}
                labelTextColor={'black'}
                motionConfig="stiff"
            />
        </div>
    );
}
