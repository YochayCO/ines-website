import { ResponsiveHeatMap } from '@nivo/heatmap' 
import { HeatMapDatum } from '../../types/graph';
import { QuestionType } from '../../types/survey';

import './BubblePlot.css'

interface BubblePlotProps { 
    data: HeatMapDatum[];
    questionType: QuestionType;
    onBarClick?: (group: string) => void;
    xTitle: string;
    yTitle: string;
}

export default function BubblePlot({ data, questionType, xTitle, yTitle }: BubblePlotProps) {
    return (
        <div className='bubbleplot-container'>
            <ResponsiveHeatMap
                data={data}
                sizeVariation={{ sizes: [0.5, 1]}}
                cellComponent='circle'
                margin={{ top: 60, right: 160, bottom: questionType === 'category' ? 200 : 60, left: 60 }}
                enableGridX
                axisBottom={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: questionType === 'category' ? 20 : 0,
                    legend: <tspan className='axis-legend'>{xTitle}<title>{xTitle}</title></tspan>,
                    legendPosition: 'start',
                    legendOffset: questionType === 'category' ? 180 : 40,
                    truncateTickAt: 0,
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
                axisTop={null}
                colors={{ type: 'diverging', scheme: 'warm' }}
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
