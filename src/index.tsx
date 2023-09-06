import {
  Container,
  Control,
  ControlElement,
  customElements,
  Module,
  Panel,
  VStack
} from '@ijstech/components';
import ScomStepper from '@scom/scom-stepper';
import { customStyles } from './index.css';
import ScomSwap from '@scom/scom-swap';
import { ISwapData } from './interface';

interface ScomTokenAcquisitionElement extends ControlElement {
  data: ISwapData[];
  onChanged?: (target: Control, activeStep: number) => void;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      ['i-scom-token-acquisition']: ScomTokenAcquisitionElement;
    }
  }
}

@customElements('i-scom-token-acquisition')
export default class ScomTokenAcquisition extends Module {
  private _data: ISwapData[];
  private isRendering: boolean = false;
  public onChanged: (target: Control, activeStep: number) => void;

  private stepper: ScomStepper;
  private pnlwidgets: VStack;
  private widgetContainers: Map<number, Panel> = new Map();

  constructor(parent?: Container, options?: any) {
    super(parent, options);
    this.onStepChanged = this.onStepChanged.bind(this);
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

  private renderUI() {
    if (this.isRendering) return;
    this.isRendering = true;
    this.resetData();
    this.stepper.steps = [...this.data].map(item => ({name: item.stepName}));
    for (let i = 0; i < this.data.length; i++) {
      const widgetContainer = <i-panel visible={i === this.stepper.activeStep}></i-panel> as Panel;
      const swapData = this.data[i]?.data;
      const swapEl = (
        <i-scom-swap
          category={swapData.category}
          providers={swapData.providers}
          defaultChainId={swapData.defaultChainId}
          wallets={swapData.wallets}
          networks={swapData.networks}
          campaignId={swapData.campaignId}
          tokens={swapData.tokens ?? []}
          logo={swapData.logo ?? ''}
          title={swapData.title ?? ''}
        ></i-scom-swap>
      )
      widgetContainer.clearInnerHTML();
      widgetContainer.appendChild(swapEl);
      this.pnlwidgets.appendChild(widgetContainer);
      this.widgetContainers.set(i, widgetContainer);
    }
    this.isRendering = false;
  }

  private resetData() {
    this.pnlwidgets.clearInnerHTML();
    this.widgetContainers = new Map();
  }

  private onStepChanged() {
    for (let i = 0; i < this.widgetContainers.size; i++) {
      const el = this.widgetContainers.get(i)
      if (el) el.visible = this.stepper.activeStep === i;
    }
    if (this.onChanged) this.onChanged(this, this.stepper.activeStep);
  }

  init() {
    this.isReadyCallbackQueued = true;
    super.init();
    this.onChanged = this.getAttribute('onChanged', true) || this.onChanged;
    const data = this.getAttribute('data', true);
    if (data) this.setData(data);
    this.isReadyCallbackQueued = false;
    this.executeReadyCallback();
  }

  render() {
    return (
      <i-panel class={customStyles}>
        <i-vstack
          width="100%" height="100%"
          gap="1rem"
        >
          <i-scom-stepper
            id="stepper"
            onChanged={this.onStepChanged}
          ></i-scom-stepper>
          <i-panel>
            <i-vstack id="pnlwidgets" width="100%" />
          </i-panel>
        </i-vstack>
      </i-panel>
    )
  }
}
