/// <amd-module name="@scom/scom-token-acquisition/index.css.ts" />
declare module "@scom/scom-token-acquisition/index.css.ts" {
    export const customStyles: string;
    export const spinnerStyle: string;
}
/// <amd-module name="@scom/scom-token-acquisition/interface.ts" />
declare module "@scom/scom-token-acquisition/interface.ts" {
    import { ISwapWidgetData } from "@scom/scom-swap";
    export interface ISwapData {
        stepName: string;
        data: ISwapWidgetData;
    }
}
/// <amd-module name="@scom/scom-token-acquisition" />
declare module "@scom/scom-token-acquisition" {
    import { Container, Control, ControlElement, Module } from '@ijstech/components';
    import { ISwapData } from "@scom/scom-token-acquisition/interface.ts";
    interface ScomTokenAcquisitionElement extends ControlElement {
        data: ISwapData[];
        onChanged?: (target: Control, activeStep: number) => void;
    }
    global {
        namespace JSX {
            interface IntrinsicElements {
                ['i-scom-token-acquisition']: ScomTokenAcquisitionElement;
            }
        }
    }
    export default class ScomTokenAcquisition extends Module {
        private _data;
        private isRendering;
        onChanged: (target: Control, activeStep: number) => void;
        private stepper;
        private pnlwidgets;
        private widgetContainers;
        constructor(parent?: Container, options?: any);
        static create(options?: ScomTokenAcquisitionElement, parent?: Container): Promise<ScomTokenAcquisition>;
        private get data();
        private set data(value);
        setData(value: ISwapData[]): void;
        getData(): ISwapData[];
        private renderUI;
        private resetData;
        private onStepChanged;
        init(): void;
        render(): any;
    }
}
