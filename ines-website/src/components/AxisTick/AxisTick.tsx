import { AxisTickProps } from '@nivo/axes'
import { DatumValue } from '@nivo/core';
import { getXLabel, getYLabel } from '../../utils/graph';
import { BubbleGraphSerie, BarGraphDatum } from '../../types/graph';
import ClippedSvgText from '../ClippedSvgText/ClippedSvgText';

import './AxisTick.css'

interface CustomTickProps extends AxisTickProps<string> {
    handleClick?: (label: string) => void;
    disabled: boolean;
}

export function CustomXTick ({ tick }: { tick: CustomTickProps; }) {
    const handleClick = () => {
        tick.handleClick?.(tick.value)
    }

    return (
        <g transform={`translate(${tick.x},${tick.y - 24})`} onClick={handleClick}>
            <line className='tick-line' stroke="#000" strokeWidth={1.5} y1={22} y2={12} />
            <rect x={-12} y={-12} rx={2} ry={2} width={24} height={24} fill="rgb(232, 193, 160)" />
            <title>Toggle column</title>
            {tick.disabled && (
                <>
                    <line className='tick-line' stroke="#000" strokeWidth={1.5} x1={-8} x2={8} y1={-8} y2={8} />
                    <line className='tick-line' stroke="#000" strokeWidth={1.5} x1={8} x2={-8} y1={-8} y2={8} />
                </>
            )}
        </g>
    )
}

export function CustomYTick ({ tick }: { tick: CustomTickProps; }) {
    const handleClick = () => {
        tick.handleClick?.(tick.value)
    }

    return (
        <g transform={`translate(${tick.x - 24},${tick.y})`} onClick={handleClick}>
            <line className='tick-line' stroke="#000" strokeWidth={1.5} x1={22} x2={12} />
            <rect x={-12} y={-12} rx={2} ry={2} width={24} height={24} fill="rgb(232, 193, 160)" />
            <title>Toggle column</title>
            {tick.disabled && (
                <>
                    <line className='tick-line' stroke="#000" strokeWidth={1.5} x1={-8} x2={8} y1={-8} y2={8} />
                    <line className='tick-line' stroke="#000" strokeWidth={1.5} x1={8} x2={-8} y1={-8} y2={8} />
                </>
            )}
        </g>
    )
}

export function RegularXTick (
    { tick, data }: { tick: AxisTickProps<DatumValue>; data: BubbleGraphSerie[] | BarGraphDatum[]; }
) {
    const xLabel = getXLabel(data, tick.tickIndex) || ''
    
    return (
        <g transform={`translate(${tick.x},${tick.y + 22})`}>
            <line stroke="#000" strokeWidth={1.5} y1={-22} y2={-12} />
            <ClippedSvgText
                className='tick-text'
                maxLength={25}
                text={xLabel}
                elementType='text'
                transform={`rotate(${tick.rotate})`}
            />
        </g>
    )
}

export function RegularYTick (
    { tick, data }: { tick: AxisTickProps<DatumValue>; data: BubbleGraphSerie[]; }
) {
    const yLabel = getYLabel(data, tick.tickIndex) || ''

    return (
        <g transform={`translate(${tick.x + 8},${tick.y + 2})`}>
            <line stroke="#000" strokeWidth={1.5} x1={-6} x2={-2} y1={-4} y2={-4}/>
            <ClippedSvgText
                className='tick-text'
                maxLength={30}
                text={yLabel}
                elementType='text'
                transform={`rotate(${tick.rotate})`}
            />
        </g>
    )
}
