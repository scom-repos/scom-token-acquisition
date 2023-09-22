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
  Styles,
  Icon,
  Table,
  FormatUtils,
  Label,
  Link,
  IEventBus
} from '@ijstech/components';
import ScomStepper from '@scom/scom-stepper';
import { customStyles, expandablePanelStyle } from './index.css';
import ScomSwap from '@scom/scom-swap';
import { ISwapData } from './interface';
import { ApiEndpoints, calculateStepPropertiesData, EventId, fetchTokenBalances, generateUUID, getAPI } from './utils';
import { BigNumber, INetwork, IRpcWallet, RpcWallet, TransactionReceipt, Utils, Wallet } from '@ijstech/eth-wallet';
import { ITokenObject, tokenStore, WETHByChainId, ChainNativeTokenByChainId } from '@scom/scom-token-list';
import { parseSwapEvents } from '@scom/scom-dex-list';
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
  public onDone: (target: Control) => Promise<void>;
  private invokerId: string;
  private executionProperties: any;
  private $eventBus: IEventBus;
  
  private stepper: ScomStepper;
  private pnlwidgets: VStack;
  private tableTransactions: Table;
  private transactionsInfoArr: any[] = [];
  private stepContainers: Map<number, Panel> = new Map();
  private widgets: Map<string, ScomSwap> = new Map();
  private TransactionsTableColumns = [
    {
      title: 'Date',
      fieldName: 'timestamp',
      key: 'timestamp',
      onRenderCell: (source: Control, columnData: number, rowData: any) => {
        return FormatUtils.unixToFormattedDate(columnData);
      }
    },
    {
      title: 'Txn Hash',
      fieldName: 'hash',
      key: 'hash',
      onRenderCell: async (source: Control, columnData: string, rowData: any) => {
        const networkMap = application.store["networkMap"];
        const networkInfo: INetwork = networkMap[rowData.toToken.chainId];
        const caption = FormatUtils.truncateTxHash(columnData);
        const url = networkInfo.blockExplorerUrls[0] + '/tx/' + columnData;
        const label = new Label(undefined, {
            caption: caption,
            font: {size: '0.875rem'},
            link: {
              href: url,
              target: '_blank',
              font: {size: '0.875rem'}
            },
            tooltip: {
              content: columnData
            }
        });

        return label;
      }
    },
    {
      title: 'Action',
      fieldName: 'desc',
      key: 'desc'
    },
    {
      title: 'Token In Amount',
      fieldName: 'fromTokenAmount',
      key: 'fromTokenAmount',
      onRenderCell: (source: Control, columnData: string, rowData: any) => {
        const fromToken = rowData.fromToken;
        const fromTokenAmount = FormatUtils.formatNumber(Utils.fromDecimals(columnData, fromToken.decimals).toFixed(), {
          decimalFigures: 4
        });
        return `${fromTokenAmount} ${fromToken.symbol}`;
      }
    },
    {
      title: 'Token Out Amount',
      fieldName: 'toTokenAmount',
      key: 'toTokenAmount',
      onRenderCell: (source: Control, columnData: string, rowData: any) => {
        const toToken = rowData.toToken;
        const toTokenAmount = FormatUtils.formatNumber(Utils.fromDecimals(columnData, toToken.decimals).toFixed(), {
          decimalFigures: 4
        });
        return `${toTokenAmount} ${toToken.symbol}`;
      }
    }
  ];

  constructor(parent?: Container, options?: any) {
    super(parent, options);
    this.onStepChanged = this.onStepChanged.bind(this);
    this.onStepDone = this.onStepDone.bind(this);
    this.$eventBus = application.EventBus;
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
    if (this.data.length === 0) {
      this.renderEmptyWidget();
    }
    else {
      // this.stepper.steps = [...this.data].map(item => ({ name: item.stepName }));
      this.stepper.steps = [...this.data].map(item => ({ name: 'Acquire Tokens' }));
      for (let i = 0; i < this.data.length; i++) {
        const stepContainer = <i-panel visible={i === this.stepper.activeStep}></i-panel> as Panel;
        this.pnlwidgets.appendChild(stepContainer);
        this.stepContainers.set(i, stepContainer);
      }
      await this.renderStepContainer(this.stepper.activeStep);
    }
    this.isRendering = false;
  }

  private renderEmptyWidget() {
    const stepContainer = (
      <i-panel>
        <i-label caption="No data to display"></i-label>
      </i-panel>
    );
    this.pnlwidgets.appendChild(stepContainer);

  }

  toggleExpandablePanel(c: Control) {
    const icon: Icon = c.querySelector('i-icon.expandable-icon');
    const contentPanel: Panel = c.parentNode.querySelector(`i-panel.${expandablePanelStyle}`);
    if (c.classList.contains('expanded')) {
      icon.name = 'angle-right';
      contentPanel.visible = false;
      c.classList.remove('expanded');
    } else {
      icon.name = 'angle-down';
      contentPanel.visible = true;
      c.classList.add('expanded');
    }
  }

  private async renderStepContainer(index: number) {
    const stepContainer = this.stepContainers.get(index);
    if (!stepContainer) return;
    const { properties, tag } = this.data[index]?.data || {};
    const swapEl = (
      <i-scom-swap
        category={properties.category}
        providers={properties.providers}
        defaultChainId={properties.defaultChainId}
        wallets={properties.wallets}
        networks={properties.networks}
        apiEndpoints={properties.apiEndpoints}
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
    stepContainer.clearInnerHTML();
    const stepName = this.data[index].stepName;
    const swapsPanel = (
      <i-vstack padding={{ top: '0.5rem', bottom: '0.5rem', left: '0.5rem', right: '0.5rem' }}>
        <i-hstack
          horizontalAlignment="space-between"
          verticalAlignment="center"
          padding={{ top: '0.5rem', bottom: '0.5rem' }}
          class="expanded pointer"
          onClick={this.toggleExpandablePanel}
        >
          <i-label caption={stepName} font={{ size: '1rem' }} lineHeight={1.3}></i-label>
          <i-icon class="expandable-icon" width={20} height={28} fill={Theme.text.primary} name="angle-down"></i-icon>
        </i-hstack>
        <i-panel class={expandablePanelStyle}>
          {swapEl}
        </i-panel>     
      </i-vstack>
    )
    const transactionsPanel = (
      <i-vstack padding={{ top: '0.5rem', bottom: '0.5rem', left: '0.5rem', right: '0.5rem' }}>
        <i-hstack
          horizontalAlignment="space-between"
          verticalAlignment="center"
          padding={{ top: '0.5rem', bottom: '0.5rem' }}
          class="expanded pointer"
          onClick={this.toggleExpandablePanel}
        >
          <i-label caption='Transactions' font={{ size: '1rem' }} lineHeight={1.3}></i-label>
          <i-icon class="expandable-icon" width={20} height={28} fill={Theme.text.primary} name="angle-down"></i-icon>
        </i-hstack>
        <i-panel class={expandablePanelStyle}>
          <i-table id="tableTransactions" columns={this.TransactionsTableColumns}></i-table>
        </i-panel>   
      </i-vstack>
    )
    stepContainer.appendChild(swapsPanel);
    stepContainer.appendChild(transactionsPanel);
    this.widgets.set(swapEl.id, swapEl);
  }

  private resetData() {
    this.pnlwidgets.clearInnerHTML();
    this.stepContainers = new Map();
    this.widgets = new Map();
  }

  private async onStepChanged() {
    for (let i = 0; i < this.stepContainers.size; i++) {
      const el = this.stepContainers.get(i)
      if (el) el.visible = this.stepper.activeStep === i;
    }
    const stepContainer = this.stepContainers.get(this.stepper.activeStep);
    if (!stepContainer.hasChildNodes()) {
      await this.renderStepContainer(this.stepper.activeStep);
    }
    if (this.onChanged) this.onChanged(this, this.stepper.activeStep);
  }

  private async onStepDone() {
    if (this.onDone) 
      await this.onDone(this);
  }

  private initEvents() {
    this._clientEvents.push(
      application.EventBus.register(this, EventId.Paid, this.onPaid)
    )
  }

  async fetchFromVaultOrderApi(transactionHash: string): Promise<any> {
    const apiResult = await getAPI(ApiEndpoints.vaultOrder, {
      newOrderTxId: transactionHash
    })
    let order;
    if (apiResult.order) {
      order = apiResult.order;
    }
    else if (apiResult.data) {
      order = apiResult.data.order;
    }
    if (order?.status === 1) {
        return order;
    } else {
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for 5 seconds
        return this.fetchFromVaultOrderApi(transactionHash);
    }
  };

  private async onPaid(paidData: any) {
    const { isCrossChain, id, data } = paidData;
    const receipt: TransactionReceipt = paidData.receipt;
    console.log('onPaid', paidData);
    const clientWallet = Wallet.getClientInstance();
    if (isCrossChain) {
      let order = await this.fetchFromVaultOrderApi(receipt.transactionHash);
      console.log('order', order);
      // const targetChainRpcWallet = RpcWallet.getRpcWallet(order.targetChainId);
      // const timestamp = await targetChainRpcWallet.getBlockTimestamp(order.swapTxId);
      const timestamp = order.timeCreated;
      let sourceChainTokenMap = tokenStore.getTokenMapByChainId(order.chainId);
      let targetChainTokenMap = tokenStore.getTokenMapByChainId(order.targetChainId);
      let inToken = sourceChainTokenMap[order.inToken.toLowerCase()];
      let outToken = targetChainTokenMap[order.outToken.toLowerCase()];
      const networkMap = application.store["networkMap"];
      const sourceNetwork = networkMap[order.chainId];
      const targetNetwork = networkMap[order.targetChainId];
      let desc;
      if (inToken.symbol === outToken.symbol) {
        desc = `Bridge ${inToken.symbol} from ${sourceNetwork.chainName} to ${targetNetwork.chainName}`;
      }
      else {
        desc = `Swap ${inToken.symbol} for ${outToken.symbol} from ${sourceNetwork.chainName} to ${targetNetwork.chainName}`;
      }
      this.transactionsInfoArr.push({
        desc: desc,
        fromToken: inToken,
        toToken: outToken,
        fromTokenAmount: order.inAmount,
        toTokenAmount: order.outAmount,
        hash: order.swapTxId,
        timestamp: timestamp
      });
    }
    else {
      const rpcWallet = RpcWallet.getRpcWallet(clientWallet.chainId);
      const swapEvents = parseSwapEvents(rpcWallet, receipt, data.pairs);
      console.log('swapEvents', swapEvents);
      const timestamp = await rpcWallet.getBlockTimestamp(receipt.blockNumber.toString());
      for (let i = 0; i < swapEvents.length; i++) {
        const swapEvent = swapEvents[i];
        const tokenInObj: ITokenObject = {...data.bestRoute[i], chainId: clientWallet.chainId}; //FIXME: chainId
        const tokenOutObj: ITokenObject = {...data.bestRoute[i + 1], chainId: clientWallet.chainId}; //FIXME: chainId

        let desc = `Swap ${tokenInObj.symbol} for ${tokenInObj.symbol}`;
        let fromTokenAmount;
        let toTokenAmount;
        if (swapEvent.amount0In.gt(0) && swapEvent.amount1Out.gt(0)) {
          fromTokenAmount = swapEvent.amount0In.toFixed();
          toTokenAmount = swapEvent.amount1Out.toFixed();
        }
        else if (swapEvent.amount0Out.gt(0) && swapEvent.amount1In.gt(0)) {
          fromTokenAmount = swapEvent.amount0Out.toFixed();
          toTokenAmount = swapEvent.amount1In.toFixed();
        }
        this.transactionsInfoArr.push({
          desc,
          fromToken: tokenInObj,
          toToken: tokenOutObj,
          fromTokenAmount,
          toTokenAmount,
          hash: receipt.transactionHash,
          timestamp
        });
      }
    }
    this.tableTransactions.data = this.transactionsInfoArr;

    let eventName = `${this.invokerId}:nextStep`;
    this.$eventBus.dispatch(eventName, {
        executionProperties: this.executionProperties,
        transactions: this.transactionsInfoArr
    });

    if (!id) return;
    const widget = this.widgets.get(id);
    if (widget) {
      const step = Number(widget.getAttribute('data-step'));
      this.stepper.updateStatus(step, true);
      // widget.remove();
      // this.widgets.delete(id);
      // this.renderCompletedStep(step);
    }
  }

  private renderCompletedStep(step: number) {
    const stepContainer = this.stepContainers.get(step);
    if (!stepContainer) return;
    stepContainer.appendChild(
      <i-vstack gap="1rem" horizontalAlignment="center">
        <i-label caption="Step completed successfully!"></i-label>
        <i-panel>
          <i-button
            caption='Restart Step'
            padding={{ top: '0.5rem', bottom: '0.5rem', left: '1rem', right: '1rem' }}
            font={{ color: Theme.colors.primary.contrastText }}
            onClick={() => this.renderStepContainer(step)}
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
      // if (widget) {
      //   widget.remove();
      //   this.widgets.delete(widget.id);
      // }
      // this.renderCompletedStep(i);
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
            showNavButtons={false}
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
    this.invokerId = options.invokerId;
    this.executionProperties = options.properties;
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

    let tokenMapByChainId: Record<number, Record<string, ITokenObject>> = {};
    let tokenBalancesByChainId: Record<number, Record<string, string>> = {};
    for (let chainId of chainIds) {
      let tokenMap = tokenStore.updateTokenMapData(chainId);
      tokenMapByChainId[chainId] = tokenMap;
      tokenBalancesByChainId[chainId] = await fetchTokenBalances(chainId);
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
        let tokenOutAmountDecimals = Utils.toDecimals(tokenOut.amount, tokenOutObj.decimals);
        let remainingAmountOutDecimals = tokenOutAmountDecimals.gt(tokenOutBalanceDecimals) ? tokenOutAmountDecimals.minus(tokenOutBalanceDecimals) : new BigNumber(0);
        let tokenOutPropertiesDataArr = [];
        for (let tokenIn of tokenRequirement.tokensIn) {
          const tokenInAddress = tokenIn.address ? tokenIn.address.toLowerCase() : ChainNativeTokenByChainId[tokenIn.chainId].symbol;
          const tokenInObj = tokenMapByChainId[tokenIn.chainId][tokenInAddress];
          const tokenInBalance = tokenBalancesByChainId[tokenIn.chainId][tokenInAddress];
          const tokenInBalanceDecimals = Utils.toDecimals(tokenInBalance, tokenInObj.decimals);
          let routeAPI;
          let apiParams;
          const isCrossChain = tokenIn.chainId !== tokenOut.chainId;
          if (isCrossChain) {
            routeAPI = ApiEndpoints.bridgeRouting;
            remainingAmountOutDecimals = remainingAmountOutDecimals.plus('300000000000000000');  //FIXME: hardcoded transaction fee
            apiParams = {
              fromChainId: tokenIn.chainId,
              toChainId: tokenOut.chainId,
              tokenIn: tokenIn.address ? tokenIn.address : wethToken.address,
              tokenOut: tokenOut.address ? tokenOut.address : wethToken.address,
              amountIn: remainingAmountOutDecimals.isZero() ? '1' : remainingAmountOutDecimals.toFixed()
            }
          }
          else {
            routeAPI = ApiEndpoints.tradingRouting;
            apiParams = {
              chainId: tokenOut.chainId,
              tokenIn: tokenIn.address ? tokenIn.address : wethToken.address,
              tokenOut: tokenOut.address ? tokenOut.address : wethToken.address,
              amountOut: remainingAmountOutDecimals.isZero() ? '1' : remainingAmountOutDecimals.toFixed(),
              ignoreHybrid: 1
            }
          }
          let APIResult = await getAPI(routeAPI, apiParams)
          let routeObjArr: any[] = [];
          if (Array.isArray(APIResult)) { //Backward compatibility
            routeObjArr = APIResult;
          }
          else if (APIResult.routes) {
            routeObjArr = APIResult.routes;
          }
          else if (APIResult.data) {
            routeObjArr = APIResult.data;
          }
          const network = networkMap[tokenOut.chainId];
          const stepName = `Swap ${tokenInObj.symbol} for ${tokenOutObj.symbol} on ${network.chainName}`;
          if (routeObjArr.length > 0) {
            const amountIn = isCrossChain ? routeObjArr[0].targetRoute.amountOut : routeObjArr[0].amountIn;
            if (new BigNumber(amountIn).lte(tokenInBalanceDecimals)) {
              let propertiesData = calculateStepPropertiesData(stepName, tokenInObj, tokenOutObj, tokenIn.chainId, tokenOut.chainId, remainingAmountOutDecimals.toFixed());
              tokenOutPropertiesDataArr.push(propertiesData);
              break;
            }
          }
        }
        if (tokenOutPropertiesDataArr.length > 0) {
          properties.data.push(tokenOutPropertiesDataArr[0]);
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
