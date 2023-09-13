import {
  application,
  Container,
  Control,
  ControlElement,
  customElements,
  Module,
  Panel,
  VStack,
  customModule,
  Styles
} from '@ijstech/components';
import ScomStepper from '@scom/scom-stepper';
import { customStyles } from './index.css';
import ScomSwap from '@scom/scom-swap';
import { ISwapData } from './interface';
import { EventId, generateUUID } from './utils';
import { BigNumber, IRpcWallet, RpcWallet, Utils } from '@ijstech/eth-wallet';
import { ITokenObject, tokenStore, WETHByChainId, ChainNativeTokenByChainId } from '@scom/scom-token-list';
const Theme = Styles.Theme.ThemeVars;

interface ScomTokenAcquisitionElement extends ControlElement {
  data: ISwapData[];
  onChanged?: (target: Control, activeStep: number) => void;
  onDone?: (target: Control) => void;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      ['i-scom-token-acquisition']: ScomTokenAcquisitionElement;
    }
  }
}

@customModule
@customElements('i-scom-token-acquisition')
export default class ScomTokenAcquisition extends Module {
  private _data: ISwapData[];
  private _clientEvents: any[] = [];
  private isRendering: boolean = false;
  public onChanged: (target: Control, activeStep: number) => void;
  public onDone: (target: Control) => void;

  private stepper: ScomStepper;
  private pnlwidgets: VStack;
  private widgetContainers: Map<number, Panel> = new Map();
  private widgets: Map<string, ScomSwap> = new Map();

  constructor(parent?: Container, options?: any) {
    super(parent, options);
    this.onStepChanged = this.onStepChanged.bind(this);
    this.onStepDone = this.onStepDone.bind(this);
  }

  static async create(options?: ScomTokenAcquisitionElement, parent?: Container) {
    let self = new this(parent, options);
    await self.ready();
    return self;
  }

  private get data() {
    return this._data ?? [];
  }
  private set data(value: ISwapData[]) {
    this._data = value ?? [];
  }

  setData(value: ISwapData[]) {
    this.data = value ?? [];
    this.renderUI();
  }

  getData() {
    return this._data ?? [];
  }

  private async renderUI() {
    if (this.isRendering) return;
    this.isRendering = true;
    this.resetData();
    this.stepper.steps = [...this.data].map(item => ({ name: item.stepName }));
    for (let i = 0; i < this.data.length; i++) {
      const widgetContainer = <i-panel visible={i === this.stepper.activeStep}></i-panel> as Panel;
      this.pnlwidgets.appendChild(widgetContainer);
      this.widgetContainers.set(i, widgetContainer);
    }
    await this.renderSwapWidget(this.stepper.activeStep);
    this.isRendering = false;
  }

  private async renderSwapWidget(index: number) {
    const widgetContainer = this.widgetContainers.get(index);
    if (!widgetContainer) return;
    const { properties, tag } = this.data[index]?.data || {};
    const swapEl = (
      <i-scom-swap
        category={properties.category}
        providers={properties.providers}
        defaultChainId={properties.defaultChainId}
        wallets={properties.wallets}
        networks={properties.networks}
        // campaignId={properties.campaignId ?? 0}
        commissions={properties.commissions ?? []}
        tokens={properties.tokens ?? []}
        logo={properties.logo ?? ''}
        title={properties.title ?? ''}
        defaultInputValue={properties.defaultInputValue}
        defaultOutputValue={properties.defaultOutputValue}
      ></i-scom-swap>
    )
    swapEl.id = `swap-${generateUUID()}`;
    swapEl.setAttribute('data-step', `${index}`);
    if (tag && swapEl.setTag) swapEl.setTag(tag);
    widgetContainer.clearInnerHTML();
    widgetContainer.appendChild(swapEl);
    this.widgets.set(swapEl.id, swapEl);
  }

  private resetData() {
    this.pnlwidgets.clearInnerHTML();
    this.widgetContainers = new Map();
    this.widgets = new Map();
  }

  private async onStepChanged() {
    for (let i = 0; i < this.widgetContainers.size; i++) {
      const el = this.widgetContainers.get(i)
      if (el) el.visible = this.stepper.activeStep === i;
    }
    const widgetContainer = this.widgetContainers.get(this.stepper.activeStep);
    if (!widgetContainer.hasChildNodes()) {
      await this.renderSwapWidget(this.stepper.activeStep);
    }
    if (this.onChanged) this.onChanged(this, this.stepper.activeStep);
  }

  private onStepDone() {
    if (this.onDone) this.onDone(this);
  }

  private initEvents() {
    this._clientEvents.push(
      application.EventBus.register(this, EventId.Paid, this.onPaid)
    )
  }

  private onPaid(paidData: any) {
    const { id, data } = paidData;
    if (!id) return;
    const widget = this.widgets.get(id);
    if (widget) {
      const step = Number(widget.getAttribute('data-step'));
      this.stepper.updateStatus(step, true);
      widget.remove();
      this.widgets.delete(id);
      this.renderCompletedStep(step);
    }
  }

  private renderCompletedStep(step: number) {
    const widgetContainer = this.widgetContainers.get(step);
    if (!widgetContainer) return;
    widgetContainer.appendChild(
      <i-vstack gap="1rem" horizontalAlignment="center">
        <i-label caption="Step completed successfully!"></i-label>
        <i-panel>
          <i-button
            caption='Restart Step'
            padding={{ top: '0.5rem', bottom: '0.5rem', left: '1rem', right: '1rem' }}
            font={{ color: Theme.colors.primary.contrastText }}
            onClick={() => this.renderSwapWidget(step)}
          ></i-button>
        </i-panel>
      </i-vstack>
    )
  }

  // For test
  onUpdateStatus() {
    const widgetKeys = this.widgets.keys();
    for (let i = 0; i < this.data.length; i++) {
      this.stepper.updateStatus(i, true);
      const key = widgetKeys.next().value;
      const widget = key && this.widgets.get(key) as ScomSwap;
      if (widget) {
        widget.remove();
        this.widgets.delete(widget.id);
      }
      this.renderCompletedStep(i);
    }
  }

  onHide(): void {
    for (let event of this._clientEvents) {
      event.unregister();
    }
    this._clientEvents = [];
  }

  init() {
    this.isReadyCallbackQueued = true;
    super.init();
    this.onChanged = this.getAttribute('onChanged', true) || this.onChanged;
    this.onDone = this.getAttribute('onDone', true) || this.onDone;
    const data = this.getAttribute('data', true);
    if (data) this.setData(data);
    this.initEvents();
    this.isReadyCallbackQueued = false;
    this.executeReadyCallback();
  }

  render() {
    return (
      <i-panel class={customStyles}>
        <i-vstack
          width="100%" height="100%"
          padding={{ top: '1rem' }}
          gap="1rem"
        >
          <i-scom-stepper
            id="stepper"
            onChanged={this.onStepChanged}
            onDone={this.onStepDone}
          ></i-scom-stepper>
          <i-panel>
            <i-vstack id="pnlwidgets" width="100%" />
          </i-panel>
        </i-vstack>
      </i-panel>
    )
  }

  async getAPI(url: string, paramsObj?: any): Promise<any> {
    let queries = '';
    if (paramsObj) {
      try {
        queries = new URLSearchParams(paramsObj).toString();
      } catch (err) {
        console.log('err', err)
      }
    }
    let fullURL = url + (queries ? `?${queries}` : '');
    const response = await fetch(fullURL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      },
    });
    return response.json();
  }

  async handleFlowStage(target: Control, stage: string, options: any) {
    let widget;
    widget = this;
    target.appendChild(widget);
    await widget.ready();
    let properties = {
      data: [
      ],
      onChanged: options?.onChanged,
      onDone: options?.onDone
    }

    let chainIds = new Set<number>();
    let tokenRequirements = options?.tokenRequirements;
    if (tokenRequirements) {
      for (let tokenRequirement of tokenRequirements) {
        chainIds.add(tokenRequirement.tokenOut.chainId);
        tokenRequirement.tokensIn.forEach(token => {
          chainIds.add(token.chainId);
        });
      }
    }

    const routeAPI = 'https://route.openswap.xyz/trading/v1/route';
    let tokenMapByChainId: Record<number, Record<string, ITokenObject>> = {};
    let tokenBalancesByChainId: Record<number, Record<string, string>> = {};
    for (let chainId of chainIds) {
      const rpcWallet = RpcWallet.getRpcWallet(chainId);
      let tokenMap = tokenStore.updateTokenMapData(chainId);
      tokenMapByChainId[chainId] = tokenMap;
      tokenBalancesByChainId[chainId] = await tokenStore.updateAllTokenBalances(rpcWallet);
    }

    const networkMap = application.store["networkMap"];
    if (tokenRequirements) {
      for (let tokenRequirement of tokenRequirements) {
        const tokenOut = tokenRequirement.tokenOut;
        const tokenOutAddress = tokenOut.address ? tokenOut.address.toLowerCase() : ChainNativeTokenByChainId[tokenOut.chainId].symbol;
        const tokenOutObj = tokenMapByChainId[tokenOut.chainId][tokenOutAddress];
        const tokenOutBalance = tokenBalancesByChainId[tokenOut.chainId][tokenOutAddress];
        const tokenOutBalanceDecimals = Utils.toDecimals(tokenOutBalance, tokenOutObj.decimals);
        const wethToken = WETHByChainId[tokenOut.chainId];
        for (let tokenIn of tokenRequirement.tokensIn) {
          const tokenInAddress = tokenIn.address ? tokenIn.address.toLowerCase() : ChainNativeTokenByChainId[tokenIn.chainId].symbol;
          const tokenInObj = tokenMapByChainId[tokenIn.chainId][tokenInAddress];
          const tokenInBalance = tokenBalancesByChainId[tokenIn.chainId][tokenInAddress];
          const tokenInBalanceDecimals = Utils.toDecimals(tokenInBalance, tokenInObj.decimals);
          let tokenOutAmountDecimals = Utils.toDecimals(tokenOut.amount, tokenOutObj.decimals);
          let remainingAmountOutDecimals = new BigNumber(tokenOutAmountDecimals).minus(tokenOutBalanceDecimals);
          let routeObjArr: any[] = await this.getAPI(routeAPI, {
            chainId: tokenOut.chainId,
            tokenIn: tokenIn.address ? tokenIn.address : wethToken.address,
            tokenOut: tokenOut.address ? tokenOut.address : wethToken.address,
            amountOut: remainingAmountOutDecimals,
            ignoreHybrid: 1
          })
          if (routeObjArr.length > 0) {
            const amountIn = routeObjArr[0].amountIn;
            if (new BigNumber(amountIn).lte(tokenInBalanceDecimals)) {
              const network = networkMap[tokenOut.chainId];
              const stepName = `Swap ${tokenInObj.symbol} for ${tokenOutObj.symbol} on ${network.chainName}`;
              properties.data.push({
                stepName: stepName,
                data: {
                  properties: {
                    providers: [
                      {
                        key: 'OpenSwap',
                        chainId: tokenOut.chainId,
                      },
                    ],
                    category: 'aggregator',
                    tokens: [
                      {
                        ...tokenInObj,
                        chainId: tokenIn.chainId,
                      },
                      {
                        ...tokenOutObj,
                        chainId: tokenOut.chainId,
                      },
                    ],
                    defaultInputValue: 0,
                    defaultOutputValue: Utils.fromDecimals(remainingAmountOutDecimals, tokenOutObj.decimals),
                    defaultChainId: tokenOut.chainId,
                    networks: [
                      {
                        chainId: tokenOut.chainId,
                      },
                    ],
                    wallets: [
                      {
                        name: 'metamask',
                      },
                    ]
                  }
                }
              });
              break;
            }
          }
        }
      }
    }

    const { data = [], onChanged, onDone } = properties || {};
    widget.setData(data);
    if (onChanged) this.onChanged = onChanged;
    if (onDone) this.onDone = onDone;
    return { widget };
  }
}
