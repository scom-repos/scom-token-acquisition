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
    exports.ApiEndpoints = void 0;
    exports.ApiEndpoints = {
        "tradingRouting": "https://board-data.openswap.xyz/api/v0/trading/tradingRoute",
        "bridgeRouting": "https://board-data.openswap.xyz/api/v0/trading/bridgeRoute",
        "bridgeVault": "https://board-data.openswap.xyz/api/v0/trading/bridgeVault",
        "bonds": "https://board-data.openswap.xyz/api/v0/trading/bridgeBonds",
        "vaultOrder": "https://board-data.openswap.xyz/api/v0/trading/vaultOrder"
        // "tradingRouting": "http://127.0.0.1:8200/api/v0/trading/tradingRoute",
        // "bridgeRouting": "http://127.0.0.1:8200/api/v0/trading/bridgeRoute",
        // "bridgeVault": "http://127.0.0.1:8200/api/v0/trading/bridgeVault",
        // "bonds": "http://127.0.0.1:8200/api/v0/trading/bridgeBonds",
        // "vaultOrder": "http://127.0.0.1:8200/api/v0/trading/vaultOrder"
        // "tradingRouting": "https://route.openswap.xyz/trading/v1/route",
        // "bridgeRouting": "https://route.openswap.xyz/trading/v1/cross-chain-route",
        // "bridgeVault": "https://route.openswap.xyz/trading/v1/bridge-vault",
        // "bonds": "https://route.openswap.xyz/trading/v1/bonds-by-chain-id-and-vault-troll-registry",
        // "vaultOrder": "https://route.openswap.xyz/trading/v1/vault-order"
    };
});
define("@scom/scom-token-acquisition/utils/index.ts", ["require", "exports", "@ijstech/eth-wallet", "@scom/scom-token-list", "@scom/scom-token-acquisition/utils/const.ts", "@scom/scom-token-acquisition/utils/const.ts"], function (require, exports, eth_wallet_1, scom_token_list_1, const_1, const_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.fetchTokenBalances = exports.calculateStepPropertiesData = exports.getAPI = exports.generateUUID = void 0;
    __exportStar(const_2, exports);
    const generateUUID = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };
    exports.generateUUID = generateUUID;
    async function getAPI(url, paramsObj) {
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
    exports.getAPI = getAPI;
    function calculateStepPropertiesData(stepName, chainIds, tokenInObjArr, tokenOutObj, remainingAmountOutDecimals) {
        const defaultTokenInObj = tokenInObjArr[0];
        // let category = defaultTokenInObj.chainId === tokenOutObj.chainId ? 'aggregator' : 'cross-chain-swap';
        let category = 'cross-chain-swap';
        let providers = chainIds.map(v => ({
            key: 'OpenSwap',
            chainId: v,
        }));
        let networks = chainIds.map(v => ({
            chainId: v,
        }));
        let defaultInputValue = '0';
        let defaultOutputValue = '0';
        if (defaultTokenInObj.chainId !== tokenOutObj.chainId) {
            defaultInputValue = eth_wallet_1.Utils.fromDecimals(remainingAmountOutDecimals, tokenOutObj.decimals).toFixed();
        }
        else {
            defaultOutputValue = eth_wallet_1.Utils.fromDecimals(remainingAmountOutDecimals, tokenOutObj.decimals).toFixed();
        }
        return {
            stepName: stepName,
            data: {
                properties: {
                    providers: providers,
                    category: category,
                    tokens: [
                        ...tokenInObjArr,
                        tokenOutObj,
                    ],
                    defaultInputToken: defaultTokenInObj,
                    defaultOutputToken: tokenOutObj,
                    defaultInputValue: defaultInputValue,
                    defaultOutputValue: defaultOutputValue,
                    defaultChainId: defaultTokenInObj.chainId,
                    networks: networks,
                    wallets: [
                        {
                            name: 'metamask',
                        },
                    ],
                    apiEndpoints: const_1.ApiEndpoints
                }
            }
        };
    }
    exports.calculateStepPropertiesData = calculateStepPropertiesData;
    async function fetchTokenBalances(chainId) {
        const rpcWallet = eth_wallet_1.RpcWallet.getRpcWallet(chainId);
        let tokenBalances = await scom_token_list_1.tokenStore.updateAllTokenBalances(rpcWallet);
        return tokenBalances;
    }
    exports.fetchTokenBalances = fetchTokenBalances;
});
define("@scom/scom-token-acquisition", ["require", "exports", "@ijstech/components", "@scom/scom-token-acquisition/index.css.ts", "@scom/scom-token-acquisition/utils/index.ts", "@ijstech/eth-wallet", "@scom/scom-token-list", "@scom/scom-dex-list"], function (require, exports, components_2, index_css_1, utils_1, eth_wallet_2, scom_token_list_2, scom_dex_list_1) {
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
            const swapEl = (this.$render("i-scom-swap", { category: properties.category, providers: properties.providers, defaultChainId: properties.defaultChainId, wallets: properties.wallets, networks: properties.networks, apiEndpoints: properties.apiEndpoints, 
                // campaignId={properties.campaignId ?? 0}
                commissions: (_b = properties.commissions) !== null && _b !== void 0 ? _b : [], tokens: (_c = properties.tokens) !== null && _c !== void 0 ? _c : [], logo: (_d = properties.logo) !== null && _d !== void 0 ? _d : '', title: (_e = properties.title) !== null && _e !== void 0 ? _e : '', defaultInputValue: properties.defaultInputValue, defaultOutputValue: properties.defaultOutputValue, defaultInputToken: properties.defaultInputToken, defaultOutputToken: properties.defaultOutputToken }));
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
            stepContainer.appendChild(swapsPanel);
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
        async onStepDone() {
            if (this.onDone)
                await this.onDone(this);
        }
        initEvents() {
            this._clientEvents.push(components_2.application.EventBus.register(this, "Paid" /* EventId.Paid */, this.onPaid));
        }
        async fetchFromVaultOrderApi(transactionHash) {
            const apiResult = await (0, utils_1.getAPI)(utils_1.ApiEndpoints.vaultOrder, {
                newOrderTxId: transactionHash
            });
            let order;
            if (apiResult.order) {
                order = apiResult.order;
            }
            else if (apiResult.data) {
                order = apiResult.data.order;
            }
            if ((order === null || order === void 0 ? void 0 : order.status) === 1) {
                return order;
            }
            else {
                await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for 5 seconds
                return this.fetchFromVaultOrderApi(transactionHash);
            }
        }
        ;
        async onPaid(paidData) {
            const { isCrossChain, id, data } = paidData;
            const receipt = paidData.receipt;
            console.log('onPaid', paidData);
            const clientWallet = eth_wallet_2.Wallet.getClientInstance();
            if (isCrossChain) {
                let order = await this.fetchFromVaultOrderApi(receipt.transactionHash);
                console.log('order', order);
                // const targetChainRpcWallet = RpcWallet.getRpcWallet(order.targetChainId);
                // const timestamp = await targetChainRpcWallet.getBlockTimestamp(order.swapTxId);
                const timestamp = order.timeCreated;
                let sourceChainTokenMap = scom_token_list_2.tokenStore.getTokenMapByChainId(order.chainId);
                let targetChainTokenMap = scom_token_list_2.tokenStore.getTokenMapByChainId(order.targetChainId);
                let inToken = sourceChainTokenMap[order.inToken.toLowerCase()];
                let outToken = targetChainTokenMap[order.outToken.toLowerCase()];
                const networkMap = components_2.application.store["networkMap"];
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
                const rpcWallet = eth_wallet_2.RpcWallet.getRpcWallet(clientWallet.chainId);
                const swapEvents = (0, scom_dex_list_1.parseSwapEvents)(rpcWallet, receipt, data.pairs);
                console.log('swapEvents', swapEvents);
                const timestamp = await rpcWallet.getBlockTimestamp(receipt.blockNumber.toString());
                for (let i = 0; i < swapEvents.length; i++) {
                    const swapEvent = swapEvents[i];
                    const tokenInObj = Object.assign(Object.assign({}, data.bestRoute[i]), { chainId: clientWallet.chainId }); //FIXME: chainId
                    const tokenOutObj = Object.assign(Object.assign({}, data.bestRoute[i + 1]), { chainId: clientWallet.chainId }); //FIXME: chainId
                    let desc = `Swap ${tokenInObj.symbol} for ${tokenOutObj.symbol}`;
                    let fromTokenAmount;
                    let toTokenAmount;
                    if (swapEvent.amount0In.gt(0) && swapEvent.amount1Out.gt(0)) {
                        fromTokenAmount = swapEvent.amount0In.toFixed();
                        toTokenAmount = swapEvent.amount1Out.toFixed();
                    }
                    else if (swapEvent.amount0Out.gt(0) && swapEvent.amount1In.gt(0)) {
                        fromTokenAmount = swapEvent.amount1In.toFixed();
                        toTokenAmount = swapEvent.amount0Out.toFixed();
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
            if (this.handleNextStep) {
                this.handleNextStep({
                    executionProperties: this.executionProperties
                });
            }
            if (this.handleAddTransactions) {
                this.handleAddTransactions({
                    list: this.transactionsInfoArr
                });
            }
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
            this.onStepChanged = this.onStepChanged.bind(this);
            this.onStepDone = this.onStepDone.bind(this);
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
        async handleFlowStage(target, stage, options) {
            let widget;
            widget = this;
            if (!options.isWidgetConnected) {
                target.appendChild(widget);
                await widget.ready();
            }
            let properties = {
                data: [],
                onChanged: options === null || options === void 0 ? void 0 : options.onChanged,
                onDone: options === null || options === void 0 ? void 0 : options.onDone
            };
            this.executionProperties = options.properties;
            this.handleNextStep = options.onNextStep;
            this.handleAddTransactions = options.onAddTransactions;
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
            let tokenMapByChainId = {};
            let tokenBalancesByChainId = {};
            for (let chainId of chainIds) {
                let tokenMap = scom_token_list_2.tokenStore.updateTokenMapData(chainId);
                tokenMapByChainId[chainId] = tokenMap;
                tokenBalancesByChainId[chainId] = await (0, utils_1.fetchTokenBalances)(chainId);
            }
            const networkMap = components_2.application.store["networkMap"];
            if (tokenRequirements) {
                for (let tokenRequirement of tokenRequirements) {
                    const tokenOut = tokenRequirement.tokenOut;
                    const tokenOutAddress = tokenOut.address ? tokenOut.address.toLowerCase() : scom_token_list_2.ChainNativeTokenByChainId[tokenOut.chainId].symbol;
                    const tokenOutObj = Object.assign(Object.assign({}, tokenMapByChainId[tokenOut.chainId][tokenOutAddress]), { chainId: tokenOut.chainId });
                    const tokenOutBalance = tokenBalancesByChainId[tokenOut.chainId][tokenOutAddress];
                    const tokenOutBalanceDecimals = eth_wallet_2.Utils.toDecimals(tokenOutBalance, tokenOutObj.decimals);
                    const wethToken = scom_token_list_2.WETHByChainId[tokenOut.chainId];
                    let tokenOutAmountDecimals = eth_wallet_2.Utils.toDecimals(tokenOut.amount, tokenOutObj.decimals);
                    let remainingAmountOutDecimals = tokenOutAmountDecimals.gt(tokenOutBalanceDecimals) ? tokenOutAmountDecimals.minus(tokenOutBalanceDecimals) : new eth_wallet_2.BigNumber(0);
                    let tokenOutPropertiesDataArr = [];
                    for (let tokenIn of tokenRequirement.tokensIn) {
                        const tokenInAddress = tokenIn.address ? tokenIn.address.toLowerCase() : scom_token_list_2.ChainNativeTokenByChainId[tokenIn.chainId].symbol;
                        const tokenInObj = Object.assign(Object.assign({}, tokenMapByChainId[tokenIn.chainId][tokenInAddress]), { chainId: tokenIn.chainId });
                        const tokenInBalance = tokenBalancesByChainId[tokenIn.chainId][tokenInAddress];
                        const tokenInBalanceDecimals = eth_wallet_2.Utils.toDecimals(tokenInBalance, tokenInObj.decimals);
                        let routeAPI;
                        let apiParams;
                        const isCrossChain = tokenIn.chainId !== tokenOut.chainId;
                        if (isCrossChain) {
                            routeAPI = utils_1.ApiEndpoints.bridgeRouting;
                            remainingAmountOutDecimals = remainingAmountOutDecimals.plus('300000000000000000'); //FIXME: hardcoded transaction fee
                            apiParams = {
                                fromChainId: tokenIn.chainId,
                                toChainId: tokenOut.chainId,
                                tokenIn: tokenIn.address ? tokenIn.address : wethToken.address,
                                tokenOut: tokenOut.address ? tokenOut.address : wethToken.address,
                                amountIn: remainingAmountOutDecimals.isZero() ? '1' : remainingAmountOutDecimals.toFixed()
                            };
                        }
                        else {
                            routeAPI = utils_1.ApiEndpoints.tradingRouting;
                            apiParams = {
                                chainId: tokenOut.chainId,
                                tokenIn: tokenIn.address ? tokenIn.address : wethToken.address,
                                tokenOut: tokenOut.address ? tokenOut.address : wethToken.address,
                                amountOut: remainingAmountOutDecimals.isZero() ? '1' : remainingAmountOutDecimals.toFixed(),
                                ignoreHybrid: 1
                            };
                        }
                        let APIResult = await (0, utils_1.getAPI)(routeAPI, apiParams);
                        let routeObjArr = [];
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
                            if (new eth_wallet_2.BigNumber(amountIn).lte(tokenInBalanceDecimals)) {
                                const tokensInObjArr = tokenRequirement.tokensIn.map(tokenIn => {
                                    const tokenInAddress = tokenIn.address ? tokenIn.address.toLowerCase() : scom_token_list_2.ChainNativeTokenByChainId[tokenIn.chainId].symbol;
                                    const tokenInObj = Object.assign(Object.assign({}, tokenMapByChainId[tokenIn.chainId][tokenInAddress]), { chainId: tokenIn.chainId });
                                    return tokenInObj;
                                }).filter((v) => v.chainId !== tokenIn.chainId || v.address !== tokenInObj.address);
                                tokensInObjArr.unshift(tokenInObj);
                                // const tokensInObjArr = [tokenInObj];
                                console.log('tokensInObjArr', tokensInObjArr);
                                let propertiesData = (0, utils_1.calculateStepPropertiesData)(stepName, Array.from(chainIds), tokensInObjArr, tokenOutObj, remainingAmountOutDecimals.toFixed());
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
