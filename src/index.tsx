import {
  application,
  Container,
  Control,
  ControlElement,
  customElements,
  Module,
  Panel,
  VStack,
  customModule
} from '@ijstech/components';
import ScomStepper from '@scom/scom-stepper';
import { customStyles } from './index.css';
import ScomSwap from '@scom/scom-swap';
import { ISwapData } from './interface';
import { EventId, generateUUID } from './utils';

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

  private renderUI() {
    if (this.isRendering) return;
    this.isRendering = true;
    this.resetData();
    this.stepper.steps = [...this.data].map(item => ({name: item.stepName}));
    for (let i = 0; i < this.data.length; i++) {
      const widgetContainer = <i-panel visible={i === this.stepper.activeStep}></i-panel> as Panel;
      const { properties, tag } = this.data[i]?.data || {};
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
        ></i-scom-swap>
      )
      swapEl.id = `swap-${generateUUID()}`;
      swapEl.setAttribute('data-step', `${i}`);
      if (tag && swapEl.setTag) swapEl.setTag(tag);
      widgetContainer.clearInnerHTML();
      widgetContainer.appendChild(swapEl);
      this.pnlwidgets.appendChild(widgetContainer);
      this.widgets.set(swapEl.id, swapEl);
      this.widgetContainers.set(i, widgetContainer);
    }
    this.isRendering = false;
  }

  private resetData() {
    this.pnlwidgets.clearInnerHTML();
    this.widgetContainers = new Map();
    this.widgets = new Map();
  }

  private onStepChanged() {
    for (let i = 0; i < this.widgetContainers.size; i++) {
      const el = this.widgetContainers.get(i)
      if (el) el.visible = this.stepper.activeStep === i;
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
      const step = widget.getAttribute('data-step');
      this.stepper.updateStatus(+step, true);
    }
  }

  // For test
  onUpdateStatus() {
    for (let i = 0; i < this.data.length; i++)
    this.stepper.updateStatus(i, true);
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
          padding={{top: '1rem'}}
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

  async handleFlowStage(target: Control, stage: string, options: any) {
		let widget;
    widget = this;
    target.appendChild(widget);
    await widget.ready();
    const { data = [], onChanged, onDone } = options?.properties || {};
    widget.setData(data);
    if (onChanged) this.onChanged = onChanged;
    if (onDone) this.onDone = onDone;
		return { widget };
	}
}
