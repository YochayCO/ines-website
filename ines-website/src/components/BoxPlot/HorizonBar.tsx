import { RectangleProps } from "recharts";

export default function HorizonBar (props: RectangleProps) {
    const { x, y, width, height } = props;
    
    if (x == null || y == null || width == null || height == null) {
        return null;
    }
    
    return (
        <line x1={x} y1={y} x2={x + width} y2={y} stroke={"#000"} strokeWidth={3} />
    );
};
