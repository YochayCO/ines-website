import { BarDatum } from "@nivo/bar";
import { BoxPlotDatum } from "@nivo/boxplot"
import { HeatMapDatum, HeatMapSerie } from "@nivo/heatmap";
import { Survey, QuestionItem } from "./survey";

export type AnswerType = 'normal' | 'special'

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
    x: string; 
    y: number; 
    origX: string;
    origId: string;
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

export type SmartGraphConfig = { isSpecialVisible: boolean; }
