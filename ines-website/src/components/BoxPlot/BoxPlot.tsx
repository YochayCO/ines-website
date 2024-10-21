import {
    ResponsiveContainer,
    ComposedChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
} from "recharts";
import HorizonBar from "./HorizonBar";
import DotBar from "./DotBar";
import { GroupBoxProps } from "../../utils/boxplot";


// Used in stacked bar graph
type BoxPlotData = {
    group: string;
    min: number;
    bottomWhisker: number;
    bottomBox: number;
    topBox: number;
    topWhisker: number;
    average?: number;
    size: number; // for average group size
};

const useBoxPlot = (boxes: GroupBoxProps[]): BoxPlotData[] => {
    return boxes.map((v) => {
        return {
            group: v.group,
            min: v.min,
            bottomWhisker: v.q1 - v.min,
            bottomBox: v.median - v.q1,
            topBox: v.q3 - v.median,
            topWhisker: v.max - v.q3,
            average: v.average,
            size: v.size,
        }
    })
}

interface BoxPlotProps { 
    boxes: GroupBoxProps[];
    onBoxClick: (group: string) => void;
    xTitle: string;
    yTitle: string;
}

export default function BoxPlot({ boxes, onBoxClick, xTitle, yTitle }: BoxPlotProps) {
    const boxPlotsData = useBoxPlot(boxes);
    const handleBoxClick = (data: BoxPlotData) => {
        onBoxClick(data.group)
    }
    
    return (
        <ResponsiveContainer>
            <ComposedChart data={boxPlotsData} margin={{ bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <Bar stackId={"a"} dataKey={"min"} fill={"none"} />
                <Bar stackId={"a"} dataKey={"bar"} shape={<HorizonBar />} />
                <Bar stackId={"a"} dataKey={"bottomWhisker"} shape={<DotBar />} />
                <Bar stackId={"a"} dataKey={"bottomBox"} fill="#8884d8" onClick={handleBoxClick} />
                <Bar stackId={"a"} dataKey={"bar"} shape={<HorizonBar />} />
                <Bar stackId={"a"} dataKey={"topBox"} fill="#8884d8" onClick={handleBoxClick} />
                <Bar stackId={"a"} dataKey={"topWhisker"} shape={<DotBar />} />
                <Bar stackId={"a"} dataKey={"bar"} shape={<HorizonBar />} />
                
                <XAxis dataKey='group' label={{ value: xTitle, position: 'insideBottom', offset: -10 }} />
                <YAxis label={{ value: yTitle, position: 'insideBottomLeft', angle: -90 }} />
            </ComposedChart>
        </ResponsiveContainer>
    );
}
