import { ComputedDatum, ResponsiveBar } from '@nivo/bar' 
import { BarGraphDatum } from '../../types/graph';
import { QuestionType } from '../../types/survey';

import './BarPlot.css'

interface BarPlotProps { 
    data: BarGraphDatum[];
    questionType: QuestionType;
    onBarClick?: (group: string) => void;
    xTitle: string;
    yTitle: string;
}

export default function BarPlot({ data, questionType, onBarClick, xTitle, yTitle }: BarPlotProps) {
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
                colorBy='indexValue'
                label={formattedLabel}
                labelPosition='end'
                labelOffset={10}
                onClick={handleBarClick}
                margin={{ top: 60, right: 160, bottom: questionType === 'category' ? 200 : 60, left: 60 }}
                padding={0.12}
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
                colors={{ scheme: questionType === 'category' ? 'category10' : 'spectral' }}
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
