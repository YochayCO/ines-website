import { BarDatum } from "@nivo/bar";
import { BoxPlotDatum } from "@nivo/boxplot"
import { HeatMapDatum, HeatMapSerie } from "@nivo/heatmap";
import { Survey, QuestionItem } from "./survey";

export type GraphDatum = BoxPlotDatum & { group: string; } // Striter than general datum
export type GraphData = GraphDatum[]

export type BarGraphDatum = BarDatum & { group: string; }

export interface BubbleGraphDatumData { x: string; y: number; origX: string }
export type BubbleGraphDatum = HeatMapDatum & BubbleGraphDatumData
export type BubbleGraphExtras = { origId: string; data: BubbleGraphDatumData[] }
export type BubbleGraphSerie = HeatMapSerie<HeatMapDatum, BubbleGraphExtras>

export interface SmartGraphProps {
    survey: Survey;
    x: QuestionItem;
    y?: QuestionItem; 
}

export type SmartBoxPlotProps = SmartGraphProps & { y: QuestionItem; }
