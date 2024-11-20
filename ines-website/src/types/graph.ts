import { BoxPlotDatum } from "@nivo/boxplot"
import { Survey, QuestionItem } from "./survey";
import { BarDatum } from "@nivo/bar";

export type GraphDatum = BoxPlotDatum & { group: string; } // Striter than general datum
export type GraphData = GraphDatum[]

export type BarGraphDatum = BarDatum & { group: string; }

export interface SmartGraphProps {
    survey: Survey;
    x: QuestionItem;
    y: QuestionItem; 
}

export type SmartBarGraphProps = {
    survey: Survey;
    x: QuestionItem;
}
