import { RectangleProps } from "recharts";


export default function DotBar (props: RectangleProps) {
    const { x, y, width, height } = props;
    
    if (x == null || y == null || width == null || height == null) {
        return null;
    }
    
    return (
        <line
            x1={x + width / 2}
            y1={y + height}
            x2={x + width / 2}
            y2={y}
            stroke={"#000"}
            strokeWidth={5}
            strokeDasharray={"5"}
        />
    );
};
