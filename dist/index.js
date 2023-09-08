var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define("@scom/scom-token-acquisition/index.css.ts", ["require", "exports", "@ijstech/components"], function (require, exports, components_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.spinnerStyle = exports.customStyles = void 0;
    const Theme = components_1.Styles.Theme.ThemeVars;
    exports.customStyles = components_1.Styles.style({
        $nest: {}
    });
    const spin = components_1.Styles.keyframes({
        "to": {
            "-webkit-transform": "rotate(360deg)"
        }
    });
    exports.spinnerStyle = components_1.Styles.style({
        display: "inline-block",
        width: "50px",
        height: "50px",
        border: "3px solid rgba(255,255,255,.3)",
        borderRadius: "50%",
        borderTopColor: Theme.colors.primary.main,
        "animation": `${spin} 1s ease-in-out infinite`,
        "-webkit-animation": `${spin} 1s ease-in-out infinite`
    });
});
define("@scom/scom-token-acquisition/interface.ts", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("@scom/scom-token-acquisition/utils/const.ts", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("@scom/scom-token-acquisition/utils/index.ts", ["require", "exports", "@scom/scom-token-acquisition/utils/const.ts"], function (require, exports, const_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    ///<amd-module name='@scom/scom-token-acquisition/utils/index.ts'/> 
    __exportStar(const_1, exports);
});
define("@scom/scom-token-acquisition", ["require", "exports", "@ijstech/components", "@scom/scom-token-acquisition/index.css.ts"], function (require, exports, components_2, index_css_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let ScomTokenAcquisition = class ScomTokenAcquisition extends components_2.Module {
        constructor(parent, options) {
            super(parent, options);
            this._clientEvents = [];
            this.isRendering = false;
            this.widgetContainers = new Map();
            this.onStepChanged = this.onStepChanged.bind(this);
        }
        static async create(options, parent) {
            let self = new this(parent, options);
            await self.ready();
            return self;
        }
        get data() {
            var _a;
            return (_a = this._data) !== null && _a !== void 0 ? _a : [];
        }
        set data(value) {
            this._data = value !== null && value !== void 0 ? value : [];
        }
        setData(value) {
            this.data = value !== null && value !== void 0 ? value : [];
            this.renderUI();
        }
        getData() {
            var _a;
            return (_a = this._data) !== null && _a !== void 0 ? _a : [];
        }
        renderUI() {
            var _a, _b, _c, _d, _e;
            if (this.isRendering)
                return;
            this.isRendering = true;
            this.resetData();
            this.stepper.steps = [...this.data].map(item => ({ name: item.stepName }));
            for (let i = 0; i < this.data.length; i++) {
                const widgetContainer = this.$render("i-panel", { visible: i === this.stepper.activeStep });
                const { properties, tag } = ((_a = this.data[i]) === null || _a === void 0 ? void 0 : _a.data) || {};
                const swapEl = (this.$render("i-scom-swap", { category: properties.category, providers: properties.providers, defaultChainId: properties.defaultChainId, wallets: properties.wallets, networks: properties.networks, 
                    // campaignId={properties.campaignId ?? 0}
                    commissions: (_b = properties.commissions) !== null && _b !== void 0 ? _b : [], tokens: (_c = properties.tokens) !== null && _c !== void 0 ? _c : [], logo: (_d = properties.logo) !== null && _d !== void 0 ? _d : '', title: (_e = properties.title) !== null && _e !== void 0 ? _e : '' }));
                if (tag && swapEl.setTag)
                    swapEl.setTag(tag);
                widgetContainer.clearInnerHTML();
                widgetContainer.appendChild(swapEl);
                this.pnlwidgets.appendChild(widgetContainer);
                this.widgetContainers.set(i, widgetContainer);
            }
            this.isRendering = false;
        }
        resetData() {
            this.pnlwidgets.clearInnerHTML();
            this.widgetContainers = new Map();
        }
        onStepChanged() {
            for (let i = 0; i < this.widgetContainers.size; i++) {
                const el = this.widgetContainers.get(i);
                if (el)
                    el.visible = this.stepper.activeStep === i;
            }
            if (this.onChanged)
                this.onChanged(this, this.stepper.activeStep);
        }
        initEvents() {
            this._clientEvents.push(components_2.application.EventBus.register(this, "Paid" /* EventId.Paid */, this.onPaid));
        }
        onPaid() {
            this.stepper.updateStatus(this.stepper.activeStep, true);
        }
        // For test
        onUpdateStatus() {
            for (let i = 0; i < this.data.length; i++)
                this.stepper.updateStatus(i, true);
        }
        onHide() {
            for (let event of this._clientEvents) {
                event.unregister();
            }
            this._clientEvents = [];
        }
        init() {
            this.isReadyCallbackQueued = true;
            super.init();
            this.onChanged = this.getAttribute('onChanged', true) || this.onChanged;
            const data = this.getAttribute('data', true);
            if (data)
                this.setData(data);
            this.initEvents();
            this.isReadyCallbackQueued = false;
            this.executeReadyCallback();
        }
        render() {
            return (this.$render("i-panel", { class: index_css_1.customStyles },
                this.$render("i-vstack", { width: "100%", height: "100%", gap: "1rem" },
                    this.$render("i-scom-stepper", { id: "stepper", onChanged: this.onStepChanged }),
                    this.$render("i-panel", null,
                        this.$render("i-vstack", { id: "pnlwidgets", width: "100%" })))));
        }
    };
    ScomTokenAcquisition = __decorate([
        (0, components_2.customElements)('i-scom-token-acquisition')
    ], ScomTokenAcquisition);
    exports.default = ScomTokenAcquisition;
});
