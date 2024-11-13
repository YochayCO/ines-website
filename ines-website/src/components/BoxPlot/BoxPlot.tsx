import { ResponsiveBoxPlot } from '@nivo/boxplot' 

import './BoxPlot.css'

interface BoxPlotProps { 
    data: { group: string; value: number }[];
    groups: string[];
    chartType: 'quantity' | 'category';
    onBoxClick?: (group: string) => void;
    xTitle: string;
    yTitle: string;
}

export default function BoxPlot({ data, groups, onBoxClick, xTitle, yTitle }: BoxPlotProps) {
    const handleBoxClick = (box: { group: string }) => {
        onBoxClick?.(box.group)
    }

    return (
        <div className='boxplot-container'>
            <ResponsiveBoxPlot
                data={data}
                onClick={handleBoxClick}
                margin={{ top: 60, right: 140, bottom: 60, left: 60 }}
                minValue={0}
                maxValue={10}
                padding={0.12}
                enableGridX={true}
                axisBottom={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    legend: <tspan className='axis-legend'>{xTitle}<title>{xTitle}</title></tspan>,
                    legendPosition: 'start',
                    legendOffset: 32,
                    truncateTickAt: 0,
                }}
                groups={groups}
                axisLeft={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    legend: <tspan className='axis-legend'>{yTitle}<title>{yTitle}</title></tspan>,
                    legendPosition: 'start',
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
