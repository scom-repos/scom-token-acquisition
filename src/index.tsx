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
import { ISwapData } from './interface';
import ScomSwap from '@scom/scom-swap';

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
  private widgetsMapper: Map<number, Panel> = new Map();

  constructor(parent?: Container, options?: any) {
    super(parent, options);
    this.onStepChanged = this.onStepChanged.bind(this);
  }

  static async create(options?: ScomTokenAcquisitionElement, parent?: Container) {
    let self = new this(parent, options);
    await self.ready();
    return self;
  }

  get data() {
    return this._data ?? [];
  }
  set data(value: ISwapData[]) {
    this._data = value ?? [];
    this.resetData();
    this.renderUI();
  }

  private async renderUI() {
    if (this.isRendering) return;
    this.isRendering = true;
    this.stepper.steps = [...this.data].map(item => ({name: item.stepName}));
    for (let i = 0; i < this.data.length; i++) {
      const widgetContainer = <i-panel visible={i === this.stepper.activeStep}></i-panel> as Panel;
      const swapData = this.data[i];
      const swapEl = await ScomSwap.create({...swapData.data});
      widgetContainer.clearInnerHTML();
      widgetContainer.appendChild(swapEl);
      this.pnlwidgets.appendChild(widgetContainer);
      this.widgetsMapper.set(i, widgetContainer);
    }
    this.isRendering = false;
  }

  private resetData() {
    this.pnlwidgets.clearInnerHTML();
    this.widgetsMapper = new Map();
  }

  private onStepChanged() {
    for (let i = 0; i < this.widgetsMapper.size; i++) {
      const el = this.widgetsMapper.get(i)
      if (el) el.visible = this.stepper.activeStep === i;
    }
    if (this.onChanged) this.onChanged(this, this.stepper.activeStep);
  }

  init() {
    this.isReadyCallbackQueued = true;
    super.init();
    this.onChanged = this.getAttribute('onChanged', true) || this.onChanged;
    const data = this.getAttribute('data', true);
    if (data) this.data = data;
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
