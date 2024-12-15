import { ResponsiveHeatMap } from '@nivo/heatmap' 
import { BubbleGraphSerie } from '../../types/graph';

import './BubblePlot.css'

interface BubblePlotProps { 
    data: BubbleGraphSerie[];
    xTitle: string;
    yTitle: string;
}

export default function BubblePlot({ data, xTitle, yTitle }: BubblePlotProps) {
    if (!data.length) {
        return (
            <div className='empty-data-msg'>
                There are no participants who answered both questions.
                <br/>
                If you chose 2022 Survey, maybe these questions were asked in different versions of the survey.
                <br/>
                Try exploring other questions.
                We will make this issue easier to avoid in the future.
            </div>
        )
    }

    return (
        <div className='bubbleplot-container'>
            <ResponsiveHeatMap
                data={data}
                sizeVariation={{ sizes: [0.5, 1]}}
                cellComponent='circle'
                valueFormat={(num) => `${num}%`}
                margin={{ top: 60, right: 160, bottom: 200, left: 90 }}
                axisBottom={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 20,
                    legend: <tspan className='axis-legend'>{xTitle}<title>{xTitle}</title></tspan>,
                    legendPosition: 'start',
                    legendOffset: 180,
                    truncateTickAt: 0,
                }}
                axisRight={{}}
                axisLeft={{
                    legend: <tspan className='axis-legend'>{yTitle}<title>{yTitle}</title></tspan>,
                    legendPosition: 'start',
                    legendOffset: -60,
                    tickValues: []
                }}
                tooltip={({ cell }) => (
                    <div className='tooltip'>
                        <b>Row / Y</b>: {cell.data.origId}
                        <br/>
                        <b>Column / X</b>: {cell.data.origX}
                        <h3><b>Value</b>: {cell.formattedValue}</h3>
                        <h5><b>Rational to X param</b>: {cell.data.yByX}%</h5>
                        <h5><b>Rational to Y param</b>: {cell.data.yBySerie}%</h5>
                    </div>
                )}
                axisTop={null}
                colors={{ type: 'diverging', scheme: 'blues' }}
                borderColor={(d) => d.data.ansType === 'normal' ? 'none' : 'yellow'}
                borderWidth={2}
                labelTextColor={'black'}
                motionConfig="stiff"
            />
        </div>
    );
}
