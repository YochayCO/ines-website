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
    
    return <ToggleBox 
        translateX={tick.x}
        translateY={tick.y - 24}
        disabled={tick.disabled}
        onClick={handleClick}
        dimension='x'
    />

}

export function CustomYTick ({ tick }: { tick: CustomTickProps; }) {
    const handleClick = () => {
        tick.handleClick?.(tick.value)
    }

    return <ToggleBox 
        translateX={tick.x - 24}
        translateY={tick.y}
        disabled={tick.disabled}
        onClick={handleClick}
        dimension='y'
    />
}

export function RegularXTick (
    { tick, data }: { tick: AxisTickProps<DatumValue>; data: BubbleGraphSerie[] | BarGraphDatum[]; }
) {
    const xLabel = getXLabel(data, tick.tickIndex) || ''
    
    return <LabelTick
        translateX={tick.x}
        translateY={tick.y + 22}
        rotate={tick.rotate}
        text={xLabel}
        dimension='x'
    />
}

export function RegularYTick (
    { tick, data }: { tick: AxisTickProps<DatumValue>; data: BubbleGraphSerie[]; }
) {
    const yLabel = getYLabel(data, tick.tickIndex) || ''
    return <LabelTick
        translateX={tick.x + 8}
        translateY={tick.y + 2}
        rotate={tick.rotate}
        text={yLabel}
        dimension='y'
    />
}


export function ToggleBox ({ translateX, translateY, dimension, disabled, onClick }: {
        translateX: number;
        translateY: number;
        dimension: 'x' | 'y';
        disabled: boolean;
        onClick: () => void;
    }) {
        const lineProps = dimension === 'x' 
            ? { y1: 22,  y2: 12 }
            : { x1: 22,  x2: 12 }

    return (
        <g transform={`translate(${translateX},${translateY})`} onClick={onClick}>
            <line className='tick-line' stroke="#000" strokeWidth={1.5} {...lineProps} />
            <rect x={-12} y={-12} rx={2} ry={2} width={24} height={24} fill="rgb(232, 193, 160)" />
            <title>Toggle column</title>
            {disabled && (
                <>
                    <line className='tick-line' stroke="#000" strokeWidth={1.5} x1={-8} x2={8} y1={-8} y2={8} />
                    <line className='tick-line' stroke="#000" strokeWidth={1.5} x1={8} x2={-8} y1={-8} y2={8} />
                </>
            )}
        </g>
    )
}

function LabelTick ({ translateX, translateY, rotate, text, dimension }: {
    translateX: number;
    translateY: number;
    rotate?: number;
    text: string;
    dimension: 'x' | 'y';
}) {
    const lineProps = dimension === 'x' 
        ? { y1: -22,  y2: -12 }
        : { x1: -6, x2: -2, y1: -4, y2:-4 }

    return (
        <g transform={`translate(${translateX},${translateY})`}>
            <line stroke="#000" strokeWidth={1.5} {...lineProps}/>
            <ClippedSvgText
                className='tick-text'
                maxLength={30}
                text={text}
                elementType='text'
                transform={`rotate(${rotate})`}
            />
        </g>
    )
}
