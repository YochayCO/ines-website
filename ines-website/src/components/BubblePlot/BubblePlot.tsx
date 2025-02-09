import { PropertyAccessor } from '@nivo/core';
import { ComputedCell, HeatMapDatum, ResponsiveHeatMap } from '@nivo/heatmap' 
import { InheritedColorConfig } from '@nivo/colors'

import { QuestionAxis } from '../../hooks/useQuestionAxis';
import { BubbleGraphDatum, BubbleGraphSerie } from '../../types/graph';
import { CustomTick, RegularXTick, RegularYTick } from '../AxisTick/AxisTick';
import ClippedSvgText from '../ClippedSvgText/ClippedSvgText';

import './BubblePlot.css'

interface BubblePlotProps { 
    graphData: BubbleGraphSerie[];
    xAxis: QuestionAxis;
    yAxis: QuestionAxis;
    getLabel: PropertyAccessor<Omit<
        ComputedCell<HeatMapDatum & BubbleGraphDatum>, 
        "opacity" | "borderColor" | "label" | "labelTextColor" | "color"
    >, string>;
    getBorderColor: InheritedColorConfig<Omit<
        ComputedCell<HeatMapDatum & BubbleGraphDatum>,
        "borderColor"
    >>;
    handleXTickClick: (label: string) => void;
    isXLabelHidden: (label: string) => boolean;
}

export default function BubblePlot({ 
    graphData,
    xAxis,
    yAxis,
    getLabel,
    getBorderColor,
    handleXTickClick,
    isXLabelHidden,
}: BubblePlotProps) {
    return (
        <div className='bubbleplot-container'>
            <ResponsiveHeatMap
                data={graphData}
                sizeVariation={{ sizes: [0.5, 1]}}
                cellComponent='circle'
                valueFormat={(num) => `${num}%`}
                label={getLabel}
                margin={{ top: 120, right: 300, bottom: 120, left: 90 }}
                axisBottom={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 20,
                    renderTick: (tick) => {
                        // Records the spacing between ticks when it changes
                        // TODO: Find a tactic that is react-friendly
                        if (tick.tickIndex === 0) xAxis.setSpacing(tick.x * 2)
                        return RegularXTick(tick, graphData)
                    },
                }}
                axisRight={{
                    renderTick: (tick) => {
                        // Records the spacing between ticks when it changes
                        if (tick.tickIndex === 0) xAxis.setSpacing(tick.y * 2)
                        return RegularYTick(tick, graphData)
                    },
                }}
                axisLeft={{
                    legend: <ClippedSvgText className='axis-legend' text={yAxis.title} maxLength={60} />,
                    legendPosition: 'start',
                    legendOffset: -60,
                    tickValues: [],
                    // TODO: add ticks like those in top legend
                    // renderTick: (tick) => CustomTick({ 
                    //     ...tick, 
                    //     isHidden: isLabelHidden(tick.value, 'y'), 
                    //     handleClick: handleYTickClick,
                    // }),
                }}
                axisTop={{
                    renderTick: (tick) => CustomTick({ 
                        ...tick, 
                        isHidden: isXLabelHidden(tick.value/* , 'x' */), 
                        handleClick: handleXTickClick,
                    }),
                    legend: <ClippedSvgText className='axis-legend' text={xAxis.title} maxLength={90} />,
                    legendPosition: 'start',
                    legendOffset: -80,
                }}
                tooltip={({ cell }) => (
                    <div className='tooltip'>
                        {cell.data.ansType === 'total' && <b>Total of </b>}
                        <b>X Answer</b>: {cell.data.origX}
                        {cell.data.ansType !== 'total' && (
                            <>
                                <br/>
                                <b>Y Answer</b>: {cell.data.origId}
                            </>
                        )}
                    </div>
                )}
                colors={{ type: 'diverging', scheme: 'blues', divergeAt: 0.2 }}
                borderColor={getBorderColor}
                borderWidth={2}
                labelTextColor={'black'}
                motionConfig="stiff"
                legends={[{
                    anchor: 'bottom',
                    translateY: -yAxis.spacing,
                    length: xAxis.spacing * graphData[0].data.length,
                    thickness: 6,
                    direction: 'row',
                    ticks: [],
                }]}
            />
            </div>
    );
}
