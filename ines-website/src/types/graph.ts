import { BarDatum } from "@nivo/bar";
import { HeatMapDatum, HeatMapSerie } from "@nivo/heatmap";
import { Survey, QuestionItem, WeightName } from "./survey";

export type AnswerType = 'normal' | 'special'

export interface BarGraphDatum extends BarDatum {
    group: string; 
    origGroup: string; 
    effectiveN: number; 
}

export interface InitialBubbleGraphDatum extends HeatMapDatum { 
    x: string; 
    y: number; 
    effectiveY: number;
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

export type BarGraphConfig = { isSpecialVisible: boolean; weightName: WeightName; }
export type BubbleGraphConfig = { 
    isSpecialVisible: boolean; 
    hiddenAnswers: string[]; 
    weightName: WeightName;
}

export function isBubbleGraphData(data: BubbleGraphSerie[] | BarGraphDatum[]): data is BubbleGraphSerie[] {
    return 'origId' in data[0]
}

export function isBarGraphData(data: BubbleGraphSerie[] | BarGraphDatum[]): data is BarGraphDatum[] {
    return 'group' in data[0];
}
