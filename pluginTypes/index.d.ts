/// <reference path="@scom/scom-token-list/index.d.ts" />
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
    export const ApiEndpoints: {
        tradingRouting: string;
        bridgeRouting: string;
        bridgeVault: string;
        bonds: string;
        vaultOrder: string;
    };
}
/// <amd-module name="@scom/scom-token-acquisition/utils/index.ts" />
declare module "@scom/scom-token-acquisition/utils/index.ts" {
    import { ITokenObject } from '@scom/scom-token-list';
    export * from "@scom/scom-token-acquisition/utils/const.ts";
    export const generateUUID: () => string;
    export function getAPI(url: string, paramsObj?: any): Promise<any>;
    export function calculateStepPropertiesData(stepName: string, chainIds: number[], tokenInObjArr: ITokenObject[], tokenOutObj: ITokenObject, remainingAmountOutDecimals: string): {
        stepName: string;
        data: {
            properties: {
                providers: {
                    key: string;
                    chainId: number;
                }[];
                category: string;
                tokens: ITokenObject[];
                defaultInputToken: ITokenObject;
                defaultOutputToken: ITokenObject;
                defaultInputValue: string;
                defaultOutputValue: string;
                defaultChainId: number;
                networks: {
                    chainId: number;
                }[];
                wallets: {
                    name: string;
                }[];
                apiEndpoints: {
                    tradingRouting: string;
                    bridgeRouting: string;
                    bridgeVault: string;
                    bonds: string;
                    vaultOrder: string;
                };
            };
        };
    };
    export function fetchTokenBalances(chainId: number): Promise<import("@scom/scom-token-list/token.ts").TokenBalancesType>;
}
/// <amd-module name="@scom/scom-token-acquisition" />
declare module "@scom/scom-token-acquisition" {
    import { Container, Control, ControlElement, Module } from '@ijstech/components';
    import { ISwapData } from "@scom/scom-token-acquisition/interface.ts";
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
        onDone: (target: Control) => Promise<void>;
        private invokerId;
        private executionProperties;
        private $eventBus;
        private stepper;
        private pnlwidgets;
        private transactionsInfoArr;
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
        fetchFromVaultOrderApi(transactionHash: string): Promise<any>;
        private onPaid;
        private renderCompletedStep;
        onUpdateStatus(): void;
        onHide(): void;
        init(): void;
        render(): any;
        handleFlowStage(target: Control, stage: string, options: any): Promise<{
            widget: any;
        }>;
    }
}
