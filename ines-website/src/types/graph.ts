import { BarDatum } from "@nivo/bar";
import { BoxPlotDatum } from "@nivo/boxplot"
import { HeatMapDatum, HeatMapSerie } from "@nivo/heatmap";
import { Survey, QuestionItem } from "./survey";

export type GraphDatum = BoxPlotDatum & { group: string; } // Striter than general datum
export type GraphData = GraphDatum[]

export type BarGraphDatum = BarDatum & { group: string; origGroup: string; }


export interface InitialBubbleGraphDatumData { 
    x: string; 
    y: number; 
    origX: string;
    origId: string;
    yByX?: number;
    yBySerie?: number
}
export type InitialBubbleGraphDatum = HeatMapDatum & InitialBubbleGraphDatumData
export type InitialBubbleGraphExtras = { origId: string; data: InitialBubbleGraphDatumData[] }
export type InitialBubbleGraphSerie = HeatMapSerie<HeatMapDatum, InitialBubbleGraphExtras>


export interface BubbleGraphDatumData extends InitialBubbleGraphDatumData { 
    x: string; 
    y: number; 
    origX: string;
    origId: string;
    yByX: number;
    yBySerie: number
}
export type BubbleGraphDatum = HeatMapDatum & BubbleGraphDatumData
export type BubbleGraphExtras = { origId: string; data: BubbleGraphDatumData[] }
export type BubbleGraphSerie = HeatMapSerie<HeatMapDatum, BubbleGraphExtras>

export interface SmartGraphProps {
    survey: Survey;
    x: QuestionItem;
    y?: QuestionItem; 
}

export type SmartBoxPlotProps = SmartGraphProps & { y: QuestionItem; }
