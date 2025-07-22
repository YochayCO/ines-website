import { AxisTickProps } from '@nivo/axes'
import { DatumValue } from '@nivo/core';
import cx from 'classnames';
import { getXLabel, getYLabel } from '../../utils/graph';
import { BubbleGraphSerie, BarGraphDatum } from '../../types/graph';
import { Answer } from '../../types/questions';
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
    { tick, data, onClick }: { 
        tick: AxisTickProps<DatumValue>; 
        data: BubbleGraphSerie[] | BarGraphDatum[]; 
        onClick?: (label: string) => void;
    }
) {
    const xLabel = getXLabel(data, tick.tickIndex) || ''
    const lineProps = { y1: -22, y2: -12 };
    return <LabelTick
        translateX={tick.x}
        translateY={tick.y + 22}
        rotate={tick.rotate}
        text={xLabel}
        lineProps={lineProps}
        onClick={onClick}
    />
}

export function RegularYTick (
    { tick, data }: { tick: AxisTickProps<DatumValue>; data: BubbleGraphSerie[]; }
) {
    const yLabel = getYLabel(data, tick.tickIndex) || ''
    const lineProps = { x1: -6, x2: -2, y1: -4, y2: -4 };
    return <LabelTick
        translateX={tick.x + 8}
        translateY={tick.y + 2}
        rotate={tick.rotate}
        text={yLabel}
        lineProps={lineProps}
    />
}

export function LineGraphYTick (
    { tick, answers }: { tick: AxisTickProps<DatumValue>; answers: Answer[]; }
) {
    const answer = answers.find(ans => ans.value === tick.value)
    if (!answer) return null
    const lineProps = { x1: 4, x2: 8, y1: -4, y2: -4 };
    return <LabelTick
        translateX={tick.x - 8}
        translateY={tick.y + 4}
        rotate={tick.rotate}
        text={`${answer.label ? `${answer.label} - ` : ''} ${answer.value}`}
        lineProps={lineProps}
        textAnchor='end'
    />
}


interface ToggleBoxProps {
    translateX: number;
    translateY: number;
    dimension: 'x' | 'y';
    disabled: boolean;
    onClick: () => void;
}

export function ToggleBox ({ translateX, translateY, dimension, disabled, onClick }: ToggleBoxProps) {
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

interface LabelTickProps {
    translateX: number;
    translateY: number;
    rotate?: number;
    text: string;
    lineProps: React.SVGProps<SVGLineElement>;
    textAnchor?: 'start' | 'middle' | 'end' | 'inherit';
    onClick?: (label: string) => void;
};

function LabelTick ({ translateX, translateY, rotate, text, lineProps, textAnchor = 'inherit', onClick }: LabelTickProps) {
    return (
        <g transform={`translate(${translateX},${translateY})`}>
            <line stroke="#000" strokeWidth={1.5} {...lineProps}/>
            <ClippedSvgText
                className={cx('tick-text', { 'clickable': !!onClick })}
                maxLength={30}
                text={text}
                elementType='text'
                transform={`rotate(${rotate})`}
                onClick={() => onClick?.(text)}
                textAnchor={textAnchor}
            />
        </g>
    )
}
