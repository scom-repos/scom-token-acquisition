/// <amd-module name="@scom/scom-token-acquisition/index.css.ts" />
declare module "@scom/scom-token-acquisition/index.css.ts" {
    export const customStyles: string;
    export const spinnerStyle: string;
    export const expandablePanelStyle: string;
}
/// <amd-module name="@scom/scom-token-acquisition/interface.ts" />
declare module "@scom/scom-token-acquisition/interface.ts" {
    import { ISwapWidgetData } from "@scom/scom-swap";
    interface IWidgetData {
        properties: ISwapWidgetData;
        tag?: any;
    }
    export interface ISwapData {
        stepName: string;
        data: IWidgetData;
    }
}
/// <amd-module name="@scom/scom-token-acquisition/utils/const.ts" />
declare module "@scom/scom-token-acquisition/utils/const.ts" {
    export const enum EventId {
        Paid = "Paid",
        ExpertModeChanged = "ExpertModeChanged"
    }
}
/// <amd-module name="@scom/scom-token-acquisition/utils/index.ts" />
declare module "@scom/scom-token-acquisition/utils/index.ts" {
    export * from "@scom/scom-token-acquisition/utils/const.ts";
    export const generateUUID: () => string;
}
/// <amd-module name="@scom/scom-token-acquisition" />
declare module "@scom/scom-token-acquisition" {
    import { Container, Control, ControlElement, Module } from '@ijstech/components';
    import { ISwapData } from "@scom/scom-token-acquisition/interface.ts";
    import { BigNumber } from '@ijstech/eth-wallet';
    import { ITokenObject } from '@scom/scom-token-list';
    interface ScomTokenAcquisitionElement extends ControlElement {
        data: ISwapData[];
        onChanged?: (target: Control, activeStep: number) => void;
        onDone?: (target: Control) => void;
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
        private _clientEvents;
        private isRendering;
        onChanged: (target: Control, activeStep: number) => void;
        onDone: (target: Control) => void;
        private stepper;
        private pnlwidgets;
        private stepContainers;
        private widgets;
        constructor(parent?: Container, options?: any);
        static create(options?: ScomTokenAcquisitionElement, parent?: Container): Promise<ScomTokenAcquisition>;
        private get data();
        private set data(value);
        setData(value: ISwapData[]): void;
        getData(): ISwapData[];
        private renderUI;
        private renderEmptyWidget;
        toggleExpandablePanel(c: Control): void;
        private renderStepContainer;
        private resetData;
        private onStepChanged;
        private onStepDone;
        private initEvents;
        private onPaid;
        private renderCompletedStep;
        onUpdateStatus(): void;
        onHide(): void;
        init(): void;
        render(): any;
        getAPI(url: string, paramsObj?: any): Promise<any>;
        calculateStepPropertiesData(stepName: string, tokenInObj: ITokenObject, tokenOutObj: ITokenObject, tokenInChainId: number, tokenOutChainId: number, remainingAmountOutDecimals: string): {
            stepName: string;
            data: {
                properties: {
                    providers: {
                        key: string;
                        chainId: number;
                    }[];
                    category: string;
                    tokens: {
                        chainId: number;
                        address?: string;
                        name: string;
                        decimals: number;
                        symbol: string;
                        status?: boolean;
                        logoURI?: string;
                        isCommon?: boolean;
                        balance?: string | number;
                        isNative?: boolean;
                        isWETH?: boolean;
                        isNew?: boolean;
                    }[];
                    defaultInputValue: number;
                    defaultOutputValue: BigNumber;
                    defaultChainId: number;
                    networks: {
                        chainId: number;
                    }[];
                    wallets: {
                        name: string;
                    }[];
                };
            };
        };
        handleFlowStage(target: Control, stage: string, options: any): Promise<{
            widget: any;
        }>;
    }
}
