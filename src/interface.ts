import { ISwapWidgetData } from "@scom/scom-swap";

interface IWidgetData {
  properties: ISwapWidgetData;
  tag?: any;
}
export interface ISwapData {
  stepName: string;
  data: IWidgetData;
}
