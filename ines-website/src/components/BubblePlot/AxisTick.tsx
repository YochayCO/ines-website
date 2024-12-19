import { AxisTickProps } from '@nivo/axes'

interface CustomClickProps extends AxisTickProps<string> {
    handleClick?: (label: string) => void;
    isHidden: boolean;
}

export default function CustomTick (tick: CustomClickProps) {
    const handleClick = () => {
        tick.handleClick?.(tick.value)

    }

    return (
        <g transform={`translate(${tick.x},${tick.y - 22})`} onClick={handleClick}>
            <line className='tick-line' stroke="#000" strokeWidth={1.5} y1={22} y2={12} />
            <rect x={-12} y={-12} rx={2} ry={2} width={24} height={24} fill="rgb(232, 193, 160)" />
            {tick.isHidden && (
                <>
                    <line className='tick-line' stroke="#000" strokeWidth={1.5} x1={-8} x2={8} y1={-8} y2={8} />
                    <line className='tick-line' stroke="#000" strokeWidth={1.5} x1={8} x2={-8} y1={-8} y2={8} />
                </>
            )}
        </g>
    )
}