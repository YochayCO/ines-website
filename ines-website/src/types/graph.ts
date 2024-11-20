import { BoxPlotDatum } from "@nivo/boxplot"
import { Survey, QuestionItem } from "./survey";

export type GraphDatum = BoxPlotDatum & { group: string; } // Striter than general datum
export type GraphData = GraphDatum[]

export interface SmartGraphProps {
    survey: Survey;
    x: QuestionItem; 
    y: QuestionItem; 
}
