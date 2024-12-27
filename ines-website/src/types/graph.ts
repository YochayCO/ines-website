import { BarDatum } from "@nivo/bar";
import { BoxPlotDatum } from "@nivo/boxplot"
import { HeatMapDatum, HeatMapSerie } from "@nivo/heatmap";
import { Survey, QuestionItem } from "./survey";

export type AnswerType = 'normal' | 'special'

// TODO: Remove this along with boxplot component
export interface GraphDatum extends BoxPlotDatum { group: string; } // Striter than general datum
export type GraphData = GraphDatum[]

export interface BarGraphDatum extends BarDatum { group: string; origGroup: string; }


export interface InitialBubbleGraphDatum extends HeatMapDatum { 
    x: string; 
    y: number; 
    origX: string;
    origId: string;
    yByX?: number;
    yBySerie?: number
}
export type InitialBubbleGraphExtras = { origId: string; data: InitialBubbleGraphDatum[] }
export type InitialBubbleGraphSerie = HeatMapSerie<HeatMapDatum, InitialBubbleGraphExtras>


export interface BubbleGraphDatum extends InitialBubbleGraphDatum { 
    yByX: number;
    yBySerie: number; 
    ansType: AnswerType;
}
export type BubbleGraphExtras = { origId: string; data: BubbleGraphDatum[] }
export type BubbleGraphSerie = HeatMapSerie<HeatMapDatum, BubbleGraphExtras>

export interface SmartGraphProps {
    survey: Survey;
    x: QuestionItem;
    y?: QuestionItem; 
}

export type SmartBubblePlotProps = SmartGraphProps & { y: QuestionItem; }

export type BarGraphConfig = { isSpecialVisible: boolean; }
export type BubbleGraphConfig = { isSpecialVisible: boolean; hiddenAnswers: string[]; }

export function isBubbleGraphData(data: BubbleGraphSerie[] | BarGraphDatum[]): data is BubbleGraphSerie[] {
    return 'origId' in data[0]
}

export function isBarGraphData(data: BubbleGraphSerie[] | BarGraphDatum[]): data is BarGraphDatum[] {
    return 'group' in data[0];
}
