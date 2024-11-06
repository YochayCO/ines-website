import { ResponsiveBoxPlot } from '@nivo/boxplot' 
import { LegendProps } from '@nivo/legends';

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

    // TODO: If there are multiple groups - make more legends. If not - remove
    const legends: LegendProps[] = [
        {
            anchor: 'right' as const,
            direction: 'column' as const,
            justify: false,
            translateX: 100,
            translateY: 0,
            itemWidth: 60,
            itemHeight: 20,
            itemsSpacing: 3,
            itemTextColor: '#999',
            itemDirection: 'left-to-right' as const,
            symbolSize: 20,
            symbolShape: 'square' as const,
            effects: [
                {
                    on: 'hover' as const,
                    style: {
                        itemTextColor: '#000'
                    }
                }
            ]
        }
    ];

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
                    legend: xTitle,
                    legendPosition: 'middle',
                    legendOffset: 32,
                    truncateTickAt: 0,
                }}
                groups={groups}
                axisLeft={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    legend: yTitle,
                    legendPosition: 'middle',
                    legendOffset: -40,
                    truncateTickAt: 0
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
                legends={legends}
            />
        </div>
    );
}
