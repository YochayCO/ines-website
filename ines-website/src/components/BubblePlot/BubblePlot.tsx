import { ResponsiveHeatMap } from '@nivo/heatmap' 
import { BubbleGraphSerie } from '../../types/graph';

import './BubblePlot.css'

interface BubblePlotProps { 
    data: BubbleGraphSerie[];
    xTitle: string;
    yTitle: string;
}

export default function BubblePlot({ data, xTitle, yTitle }: BubblePlotProps) {
    return (
        <div className='bubbleplot-container'>
            <ResponsiveHeatMap
                data={data}
                sizeVariation={{ sizes: [0.5, 1]}}
                cellComponent='circle'
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
                axisLeft={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    legend: <tspan className='axis-legend'>{yTitle}<title>{yTitle}</title></tspan>,
                    legendPosition: 'start',
                    legendOffset: -80,
                    truncateTickAt: 0,
                }}
                tooltip={({ cell }) => (
                    <div className='tooltip'>
                        <h3><b>Value</b>: {cell.formattedValue}</h3>
                        <h4><b>Row / Y</b>: {cell.data.origId}</h4>
                        <h4><b>Column / X</b>: {cell.data.origX}</h4>
                    </div>
                )}
                axisTop={null}
                colors={{ type: 'diverging', scheme: 'blues' }}
                labelTextColor={'black'}
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
