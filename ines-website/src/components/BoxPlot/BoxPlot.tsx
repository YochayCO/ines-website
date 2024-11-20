import { ResponsiveBoxPlot } from '@nivo/boxplot' 
import { GraphData } from '../../types/graph';
import { QuestionType } from '../../types/survey';

import './BoxPlot.css'

interface BoxPlotProps { 
    data: GraphData;
    groups: string[];
    chartType: QuestionType;
    onBoxClick?: (group: string) => void;
    xTitle: string;
    yTitle: string;
}

export default function BoxPlot({ data, groups, chartType, onBoxClick, xTitle, yTitle }: BoxPlotProps) {
    const handleBoxClick = (box: { group: string }) => {
        onBoxClick?.(box.group)
    }

    return (
        <div className='boxplot-container'>
            <ResponsiveBoxPlot
                data={data}
                onClick={handleBoxClick}
                margin={{ top: 60, right: 160, bottom: 200, left: 60 }}
                padding={0.12}
                enableGridX
                axisBottom={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: chartType === 'category' ? 20 : 0,
                    legend: <tspan className='axis-legend'>{xTitle}<title>{xTitle}</title></tspan>,
                    legendPosition: 'start',
                    legendOffset: 180,
                    truncateTickAt: 0,
                }}
                groups={groups}
                axisLeft={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    legend: <tspan className='axis-legend'>{yTitle}<title>{yTitle}</title></tspan>,
                    legendPosition: 'end',
                    legendOffset: -40,
                    truncateTickAt: 0,
                }}
                colors={{ scheme: 'nivo' }}
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
                medianWidth={2}
                medianColor={{
                    from: 'color',
                    modifiers: [
                        [
                            'darker',
                            0.3
                        ]
                    ]
                }}
                whiskerEndSize={0.6}
                whiskerColor={{
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
