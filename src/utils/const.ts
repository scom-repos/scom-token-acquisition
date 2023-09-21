export const enum EventId {
  Paid = 'Paid',
  ExpertModeChanged = 'ExpertModeChanged'
}

export const ApiEndpoints = {
  "tradingRouting": "https://route.openswap.xyz/trading/v1/route",
  "bridgeRouting": "https://route.openswap.xyz/trading/v1/cross-chain-route",
  // "tradingRouting": "http://127.0.0.1:8200/api/v0/trading/tradingRoute",
  // "bridgeRouting": "http://127.0.0.1:8200/api/v0/trading/bridgeRoute",
  "bridgeVault": "https://route.openswap.xyz/trading/v1/bridge-vault",
  "bonds": "https://route.openswap.xyz/trading/v1/bonds-by-chain-id-and-vault-troll-registry",
  "vaultOrder": "https://route.openswap.xyz/trading/v1/vault-order"
}   