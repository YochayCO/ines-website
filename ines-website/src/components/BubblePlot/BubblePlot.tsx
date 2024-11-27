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
                margin={{ top: 60, right: 160, bottom: 200, left: 400 }}
                enableGridX
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
                    legendOffset: -390,
                    truncateTickAt: 0,
                }}
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
