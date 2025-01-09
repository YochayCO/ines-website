import { ComputedDatum, ResponsiveBar } from '@nivo/bar' 
import { BarGraphDatum } from '../../types/graph';
import { RegularXTick } from '../BubblePlot/AxisTick';
import GraphQuestionTitle from '../GraphQuestionTitle/GraphQuestionTitle';

import './BarPlot.css'

interface BarPlotProps { 
    data: BarGraphDatum[];
    onBarClick?: (group: string) => void;
    xTitle: string;
    yTitle: string;
}

export default function BarPlot({ data, onBarClick, xTitle, yTitle }: BarPlotProps) {
    const handleBarClick = (bar: ComputedDatum<BarGraphDatum>) => {
        onBarClick?.(bar.indexValue as string)
    }

    const formattedLabel = (datum: ComputedDatum<BarGraphDatum>): string => {
        return `${datum.formattedValue}%`
    }

    return (
        <div className='barplot-container'>
            <ResponsiveBar
                data={data}
                indexBy='group'
                maxValue={100}
                colorBy='id'
                label={formattedLabel}
                labelPosition='end'
                labelOffset={10}
                onClick={handleBarClick}
                margin={{ top: 120, right: 160, bottom: 120, left: 90 }}
                padding={0.12}
                enableGridX
                defs={[
                    {
                        id: 'normal',
                        type: 'linearGradient',
                        colors: [
                            { offset: 0, color: '#38bcb2' },
                            { offset: 100, color: '#38bcb2' },
                        ],
                    },
                    {
                        id: 'special',
                        type: 'linearGradient',
                        colors: [
                            { offset: 0, color: '#faf047' },
                            { offset: 100, color: '#faf047' },
                        ],
                    }
                ]}
                fill={[
                    {
                        match: (d) => d.data.data.id === 'normal',
                        id: 'normal'
                    },
                    {
                        match: (d) => d.data.data.id === 'special',
                        id: 'special'
                    }
                ]}
                axisTop={{
                    tickValues: [],
                    legend: <GraphQuestionTitle className='axis-legend' text={xTitle} maxLength={90} />,
                    legendPosition: 'start',
                    legendOffset: -80,
                }}
                axisBottom={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 20,
                    renderTick: (tick) => RegularXTick(tick, data),
                }}
                axisLeft={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    legend: <tspan className='axis-legend'>{yTitle}<title>{yTitle}</title></tspan>,
                    legendPosition: 'middle',
                    legendOffset: -50,
                    truncateTickAt: 0,
                }}
                tooltip={({ data }) => (
                    <div className='tooltip'>
                        <b>Number of responses</b>: {data.effectiveN}
                    </div>
                )}
                colors={{ scheme: 'category10' }}
                borderWidth={2}
                borderColor={{
                    from: 'color',
                    modifiers: [
                        [
                            'darker',
                            0.3
                        ]
                    ]
                }}
                motionConfig="stiff"
            />
        </div>
    );
}
