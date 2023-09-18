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
    exports.expandablePanelStyle = exports.spinnerStyle = exports.customStyles = void 0;
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
    exports.expandablePanelStyle = components_1.Styles.style({
        $nest: {
            'i-panel': {
                border: 'none'
            },
            '#comboEmbedType .icon-btn': {
                opacity: 0.5
            }
        }
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
    exports.generateUUID = void 0;
    ///<amd-module name='@scom/scom-token-acquisition/utils/index.ts'/> 
    __exportStar(const_1, exports);
    const generateUUID = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };
    exports.generateUUID = generateUUID;
});
define("@scom/scom-token-acquisition", ["require", "exports", "@ijstech/components", "@scom/scom-token-acquisition/index.css.ts", "@scom/scom-token-acquisition/utils/index.ts", "@ijstech/eth-wallet", "@scom/scom-token-list", "@scom/scom-dex-list"], function (require, exports, components_2, index_css_1, utils_1, eth_wallet_1, scom_token_list_1, scom_dex_list_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const Theme = components_2.Styles.Theme.ThemeVars;
    let ScomTokenAcquisition = class ScomTokenAcquisition extends components_2.Module {
        constructor(parent, options) {
            super(parent, options);
            this._clientEvents = [];
            this.isRendering = false;
            this.transactionsInfoArr = [];
            this.stepContainers = new Map();
            this.widgets = new Map();
            this.TransactionsTableColumns = [
                {
                    title: 'Date',
                    fieldName: 'timestamp',
                    key: 'timestamp',
                    onRenderCell: (source, columnData, rowData) => {
                        return components_2.FormatUtils.unixToFormattedDate(columnData);
                    }
                },
                {
                    title: 'Txn Hash',
                    fieldName: 'hash',
                    key: 'hash',
                    onRenderCell: async (source, columnData, rowData) => {
                        const networkMap = components_2.application.store["networkMap"];
                        const networkInfo = networkMap[rowData.token0.chainId];
                        const caption = components_2.FormatUtils.truncateTxHash(columnData);
                        const url = networkInfo.blockExplorerUrls[0] + '/tx/' + columnData;
                        const label = new components_2.Label(undefined, {
                            caption: caption,
                            font: { size: '0.875rem' },
                            link: {
                                href: url,
                                target: '_blank',
                                font: { size: '0.875rem' }
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
                    title: 'Token Amount',
                    fieldName: 'token0Amount',
                    key: 'token0Amount',
                    onRenderCell: (source, columnData, rowData) => {
                        const token0 = rowData.token0;
                        const token0Amount = components_2.FormatUtils.formatNumberWithSeparators(eth_wallet_1.Utils.fromDecimals(columnData, token0.decimals).toFixed(), 4);
                        return `${token0Amount} ${token0.symbol}`;
                    }
                },
                {
                    title: 'Token Amount',
                    fieldName: 'token1Amount',
                    key: 'token1Amount',
                    onRenderCell: (source, columnData, rowData) => {
                        const token1 = rowData.token1;
                        const token1Amount = components_2.FormatUtils.formatNumberWithSeparators(eth_wallet_1.Utils.fromDecimals(columnData, token1.decimals).toFixed(), 4);
                        return `${token1Amount} ${token1.symbol}`;
                    }
                }
            ];
            this.onStepChanged = this.onStepChanged.bind(this);
            this.onStepDone = this.onStepDone.bind(this);
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
        async renderUI() {
            if (this.isRendering)
                return;
            this.isRendering = true;
            this.resetData();
            if (this.data.length === 0) {
                this.renderEmptyWidget();
            }
            else {
                // this.stepper.steps = [...this.data].map(item => ({ name: item.stepName }));
                this.stepper.steps = [...this.data].map(item => ({ name: 'Acquire Tokens' }));
                for (let i = 0; i < this.data.length; i++) {
                    const stepContainer = this.$render("i-panel", { visible: i === this.stepper.activeStep });
                    this.pnlwidgets.appendChild(stepContainer);
                    this.stepContainers.set(i, stepContainer);
                }
                await this.renderStepContainer(this.stepper.activeStep);
            }
            this.isRendering = false;
        }
        renderEmptyWidget() {
            const stepContainer = (this.$render("i-panel", null,
                this.$render("i-label", { caption: "No data to display" })));
            this.pnlwidgets.appendChild(stepContainer);
        }
        toggleExpandablePanel(c) {
            const icon = c.querySelector('i-icon.expandable-icon');
            const contentPanel = c.parentNode.querySelector(`i-panel.${index_css_1.expandablePanelStyle}`);
            if (c.classList.contains('expanded')) {
                icon.name = 'angle-right';
                contentPanel.visible = false;
                c.classList.remove('expanded');
            }
            else {
                icon.name = 'angle-down';
                contentPanel.visible = true;
                c.classList.add('expanded');
            }
        }
        async renderStepContainer(index) {
            var _a, _b, _c, _d, _e;
            const stepContainer = this.stepContainers.get(index);
            if (!stepContainer)
                return;
            const { properties, tag } = ((_a = this.data[index]) === null || _a === void 0 ? void 0 : _a.data) || {};
            const swapEl = (this.$render("i-scom-swap", { category: properties.category, providers: properties.providers, defaultChainId: properties.defaultChainId, wallets: properties.wallets, networks: properties.networks, 
                // campaignId={properties.campaignId ?? 0}
                commissions: (_b = properties.commissions) !== null && _b !== void 0 ? _b : [], tokens: (_c = properties.tokens) !== null && _c !== void 0 ? _c : [], logo: (_d = properties.logo) !== null && _d !== void 0 ? _d : '', title: (_e = properties.title) !== null && _e !== void 0 ? _e : '', defaultInputValue: properties.defaultInputValue, defaultOutputValue: properties.defaultOutputValue }));
            swapEl.id = `swap-${(0, utils_1.generateUUID)()}`;
            swapEl.setAttribute('data-step', `${index}`);
            if (tag && swapEl.setTag)
                swapEl.setTag(tag);
            stepContainer.clearInnerHTML();
            const stepName = this.data[index].stepName;
            const swapsPanel = (this.$render("i-vstack", { padding: { top: '0.5rem', bottom: '0.5rem', left: '0.5rem', right: '0.5rem' } },
                this.$render("i-hstack", { horizontalAlignment: "space-between", verticalAlignment: "center", padding: { top: '0.5rem', bottom: '0.5rem' }, class: "expanded pointer", onClick: this.toggleExpandablePanel },
                    this.$render("i-label", { caption: stepName, font: { size: '1rem' }, lineHeight: 1.3 }),
                    this.$render("i-icon", { class: "expandable-icon", width: 20, height: 28, fill: Theme.text.primary, name: "angle-down" })),
                this.$render("i-panel", { class: index_css_1.expandablePanelStyle }, swapEl)));
            const transactionsPanel = (this.$render("i-vstack", { padding: { top: '0.5rem', bottom: '0.5rem', left: '0.5rem', right: '0.5rem' } },
                this.$render("i-hstack", { horizontalAlignment: "space-between", verticalAlignment: "center", padding: { top: '0.5rem', bottom: '0.5rem' }, class: "expanded pointer", onClick: this.toggleExpandablePanel },
                    this.$render("i-label", { caption: 'Transactions', font: { size: '1rem' }, lineHeight: 1.3 }),
                    this.$render("i-icon", { class: "expandable-icon", width: 20, height: 28, fill: Theme.text.primary, name: "angle-down" })),
                this.$render("i-panel", { class: index_css_1.expandablePanelStyle },
                    this.$render("i-table", { id: "tableTransactions", columns: this.TransactionsTableColumns }))));
            stepContainer.appendChild(swapsPanel);
            stepContainer.appendChild(transactionsPanel);
            this.widgets.set(swapEl.id, swapEl);
        }
        resetData() {
            this.pnlwidgets.clearInnerHTML();
            this.stepContainers = new Map();
            this.widgets = new Map();
        }
        async onStepChanged() {
            for (let i = 0; i < this.stepContainers.size; i++) {
                const el = this.stepContainers.get(i);
                if (el)
                    el.visible = this.stepper.activeStep === i;
            }
            const stepContainer = this.stepContainers.get(this.stepper.activeStep);
            if (!stepContainer.hasChildNodes()) {
                await this.renderStepContainer(this.stepper.activeStep);
            }
            if (this.onChanged)
                this.onChanged(this, this.stepper.activeStep);
        }
        onStepDone() {
            if (this.onDone)
                this.onDone(this);
        }
        initEvents() {
            this._clientEvents.push(components_2.application.EventBus.register(this, "Paid" /* EventId.Paid */, this.onPaid));
        }
        async onPaid(paidData) {
            const { id, data } = paidData;
            const receipt = paidData.receipt;
            console.log('onPaid', paidData);
            const clientWallet = eth_wallet_1.Wallet.getClientInstance();
            const rpcWallet = eth_wallet_1.RpcWallet.getRpcWallet(clientWallet.chainId);
            const swapEvents = (0, scom_dex_list_1.parseSwapEvents)(rpcWallet, receipt, data.pairs);
            console.log('swapEvents', swapEvents);
            const timestamp = await rpcWallet.getBlockTimestamp(receipt.blockNumber.toString());
            for (let i = 0; i < swapEvents.length; i++) {
                const swapEvent = swapEvents[i];
                const tokenInObj = Object.assign(Object.assign({}, data.bestRoute[i]), { chainId: clientWallet.chainId }); //FIXME: chainId
                const tokenOutObj = Object.assign(Object.assign({}, data.bestRoute[i + 1]), { chainId: clientWallet.chainId }); //FIXME: chainId
                const token0 = tokenInObj.address.toLowerCase() < tokenOutObj.address.toLowerCase() ? tokenInObj : tokenOutObj;
                const token1 = tokenInObj.address.toLowerCase() < tokenOutObj.address.toLowerCase() ? tokenOutObj : tokenInObj;
                let desc;
                let token0Amount;
                let token1Amount;
                if (swapEvent.amount0In.gt(0) && swapEvent.amount1Out.gt(0)) {
                    desc = `Swap ${token0.symbol} for ${token1.symbol}`;
                    token0Amount = swapEvent.amount0In.toFixed();
                    token1Amount = swapEvent.amount1Out.toFixed();
                }
                else if (swapEvent.amount0Out.gt(0) && swapEvent.amount1In.gt(0)) {
                    desc = `Swap ${token1.symbol} for ${token0.symbol}`;
                    token0Amount = swapEvent.amount0Out.toFixed();
                    token1Amount = swapEvent.amount1In.toFixed();
                }
                this.transactionsInfoArr.push({
                    desc,
                    token0,
                    token1,
                    token0Amount,
                    token1Amount,
                    hash: receipt.transactionHash,
                    timestamp
                });
            }
            this.tableTransactions.data = this.transactionsInfoArr;
            if (!id)
                return;
            const widget = this.widgets.get(id);
            if (widget) {
                const step = Number(widget.getAttribute('data-step'));
                this.stepper.updateStatus(step, true);
                // widget.remove();
                // this.widgets.delete(id);
                // this.renderCompletedStep(step);
            }
        }
        renderCompletedStep(step) {
            const stepContainer = this.stepContainers.get(step);
            if (!stepContainer)
                return;
            stepContainer.appendChild(this.$render("i-vstack", { gap: "1rem", horizontalAlignment: "center" },
                this.$render("i-label", { caption: "Step completed successfully!" }),
                this.$render("i-panel", null,
                    this.$render("i-button", { caption: 'Restart Step', padding: { top: '0.5rem', bottom: '0.5rem', left: '1rem', right: '1rem' }, font: { color: Theme.colors.primary.contrastText }, onClick: () => this.renderStepContainer(step) }))));
        }
        // For test
        onUpdateStatus() {
            const widgetKeys = this.widgets.keys();
            for (let i = 0; i < this.data.length; i++) {
                this.stepper.updateStatus(i, true);
                const key = widgetKeys.next().value;
                const widget = key && this.widgets.get(key);
                // if (widget) {
                //   widget.remove();
                //   this.widgets.delete(widget.id);
                // }
                // this.renderCompletedStep(i);
            }
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
            this.onDone = this.getAttribute('onDone', true) || this.onDone;
            const data = this.getAttribute('data', true);
            if (data)
                this.setData(data);
            this.initEvents();
            this.isReadyCallbackQueued = false;
            this.executeReadyCallback();
        }
        render() {
            return (this.$render("i-panel", { class: index_css_1.customStyles },
                this.$render("i-vstack", { width: "100%", height: "100%", padding: { top: '1rem' }, gap: "1rem" },
                    this.$render("i-scom-stepper", { id: "stepper", showNavButtons: false, onChanged: this.onStepChanged, onDone: this.onStepDone }),
                    this.$render("i-panel", null,
                        this.$render("i-vstack", { id: "pnlwidgets", width: "100%" })))));
        }
        async getAPI(url, paramsObj) {
            let queries = '';
            if (paramsObj) {
                try {
                    queries = new URLSearchParams(paramsObj).toString();
                }
                catch (err) {
                    console.log('err', err);
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
        calculateStepPropertiesData(stepName, tokenInObj, tokenOutObj, tokenInChainId, tokenOutChainId, remainingAmountOutDecimals) {
            return {
                stepName: stepName,
                data: {
                    properties: {
                        providers: [
                            {
                                key: 'OpenSwap',
                                chainId: tokenOutChainId,
                            },
                        ],
                        category: 'aggregator',
                        tokens: [
                            Object.assign(Object.assign({}, tokenInObj), { chainId: tokenInChainId }),
                            Object.assign(Object.assign({}, tokenOutObj), { chainId: tokenOutChainId }),
                        ],
                        defaultInputValue: 0,
                        defaultOutputValue: eth_wallet_1.Utils.fromDecimals(remainingAmountOutDecimals, tokenOutObj.decimals),
                        defaultChainId: tokenOutChainId,
                        networks: [
                            {
                                chainId: tokenOutChainId,
                            },
                        ],
                        wallets: [
                            {
                                name: 'metamask',
                            },
                        ]
                    }
                }
            };
        }
        async handleFlowStage(target, stage, options) {
            let widget;
            widget = this;
            target.appendChild(widget);
            await widget.ready();
            let properties = {
                data: [],
                onChanged: options === null || options === void 0 ? void 0 : options.onChanged,
                onDone: options === null || options === void 0 ? void 0 : options.onDone
            };
            let chainIds = new Set();
            let tokenRequirements = options === null || options === void 0 ? void 0 : options.tokenRequirements;
            if (tokenRequirements) {
                for (let tokenRequirement of tokenRequirements) {
                    chainIds.add(tokenRequirement.tokenOut.chainId);
                    tokenRequirement.tokensIn.forEach(token => {
                        chainIds.add(token.chainId);
                    });
                }
            }
            const routeAPI = 'https://route.openswap.xyz/trading/v1/route';
            let tokenMapByChainId = {};
            let tokenBalancesByChainId = {};
            for (let chainId of chainIds) {
                const rpcWallet = eth_wallet_1.RpcWallet.getRpcWallet(chainId);
                let tokenMap = scom_token_list_1.tokenStore.updateTokenMapData(chainId);
                tokenMapByChainId[chainId] = tokenMap;
                tokenBalancesByChainId[chainId] = await scom_token_list_1.tokenStore.updateAllTokenBalances(rpcWallet);
            }
            const networkMap = components_2.application.store["networkMap"];
            if (tokenRequirements) {
                for (let tokenRequirement of tokenRequirements) {
                    const tokenOut = tokenRequirement.tokenOut;
                    const tokenOutAddress = tokenOut.address ? tokenOut.address.toLowerCase() : scom_token_list_1.ChainNativeTokenByChainId[tokenOut.chainId].symbol;
                    const tokenOutObj = tokenMapByChainId[tokenOut.chainId][tokenOutAddress];
                    const tokenOutBalance = tokenBalancesByChainId[tokenOut.chainId][tokenOutAddress];
                    const tokenOutBalanceDecimals = eth_wallet_1.Utils.toDecimals(tokenOutBalance, tokenOutObj.decimals);
                    const wethToken = scom_token_list_1.WETHByChainId[tokenOut.chainId];
                    let tokenOutAmountDecimals = eth_wallet_1.Utils.toDecimals(tokenOut.amount, tokenOutObj.decimals);
                    let remainingAmountOutDecimals = tokenOutAmountDecimals.gt(tokenOutBalanceDecimals) ? tokenOutAmountDecimals.minus(tokenOutBalanceDecimals) : new eth_wallet_1.BigNumber(0);
                    let tokenOutPropertiesDataArr = [];
                    for (let tokenIn of tokenRequirement.tokensIn) {
                        const tokenInAddress = tokenIn.address ? tokenIn.address.toLowerCase() : scom_token_list_1.ChainNativeTokenByChainId[tokenIn.chainId].symbol;
                        const tokenInObj = tokenMapByChainId[tokenIn.chainId][tokenInAddress];
                        const tokenInBalance = tokenBalancesByChainId[tokenIn.chainId][tokenInAddress];
                        const tokenInBalanceDecimals = eth_wallet_1.Utils.toDecimals(tokenInBalance, tokenInObj.decimals);
                        let routeObjArr = await this.getAPI(routeAPI, {
                            chainId: tokenOut.chainId,
                            tokenIn: tokenIn.address ? tokenIn.address : wethToken.address,
                            tokenOut: tokenOut.address ? tokenOut.address : wethToken.address,
                            amountOut: remainingAmountOutDecimals.isZero() ? '1' : remainingAmountOutDecimals.toFixed(),
                            ignoreHybrid: 1
                        });
                        const network = networkMap[tokenOut.chainId];
                        const stepName = `Swap ${tokenInObj.symbol} for ${tokenOutObj.symbol} on ${network.chainName}`;
                        if (routeObjArr.length > 0) {
                            const amountIn = routeObjArr[0].amountIn;
                            if (new eth_wallet_1.BigNumber(amountIn).lte(tokenInBalanceDecimals)) {
                                let propertiesData = this.calculateStepPropertiesData(stepName, tokenInObj, tokenOutObj, tokenIn.chainId, tokenOut.chainId, remainingAmountOutDecimals.toFixed());
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
            if (onChanged)
                this.onChanged = onChanged;
            if (onDone)
                this.onDone = onDone;
            return { widget };
        }
    };
    ScomTokenAcquisition = __decorate([
        components_2.customModule,
        (0, components_2.customElements)('i-scom-token-acquisition')
    ], ScomTokenAcquisition);
    exports.default = ScomTokenAcquisition;
});
