import { BoxPlotDatum } from "@nivo/boxplot"
import { Survey, QuestionItem } from "./survey";
import { BarDatum } from "@nivo/bar";

export type GraphDatum = BoxPlotDatum & { group: string; } // Striter than general datum
export type GraphData = GraphDatum[]

export type BarGraphDatum = BarDatum & { group: string; }
export type HeatMapDatum = { id: string; data: { x: string; y: number; }[] }

export interface SmartGraphProps {
    survey: Survey;
    x: QuestionItem;
    y?: QuestionItem; 
}

export type SmartBoxPlotProps = SmartGraphProps & { y: QuestionItem; }
