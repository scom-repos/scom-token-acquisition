import { RpcWallet, Utils } from '@ijstech/eth-wallet';
import { ITokenObject, tokenStore } from '@scom/scom-token-list';
import { ApiEndpoints } from './const';

export * from './const';

export const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export async function getAPI(url: string, paramsObj?: any): Promise<any> {
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

export function calculateStepPropertiesData(stepName: string, tokenInObj: ITokenObject, tokenOutObj: ITokenObject, tokenInChainId: number, tokenOutChainId: number, remainingAmountOutDecimals: string) {
  let category = tokenInChainId === tokenOutChainId ? 'aggregator' : 'cross-chain-swap';
  let providers = [
    {
      key: 'OpenSwap',
      chainId: tokenInChainId,
    }
  ];
  let networks = [
    {
      chainId: tokenInChainId,
    },
  ]
  let defaultInputValue = '0';
  let defaultOutputValue = '0';
  if (tokenInChainId !== tokenOutChainId) {
    providers.push({
      key: 'OpenSwap',
      chainId: tokenOutChainId,
    });
    networks.push({
      chainId: tokenOutChainId,
    });
    defaultInputValue = Utils.fromDecimals(remainingAmountOutDecimals, tokenOutObj.decimals).toFixed();
  }
  else {
    defaultOutputValue = Utils.fromDecimals(remainingAmountOutDecimals, tokenOutObj.decimals).toFixed();
  }
  return {
    stepName: stepName,
    data: {
      properties: {
        providers: providers,
        category: category,
        tokens: [
          {
            ...tokenInObj,
            chainId: tokenInChainId,
          },
          {
            ...tokenOutObj,
            chainId: tokenOutChainId,
          },
        ],
        defaultInputValue: defaultInputValue,
        defaultOutputValue: defaultOutputValue,
        defaultChainId: tokenInChainId,
        networks: networks,
        wallets: [
          {
            name: 'metamask',
          },
        ],
        apiEndpoints: ApiEndpoints   
      }
    }
  };
}

export async function fetchTokenBalances(chainId: number) {
  const rpcWallet = RpcWallet.getRpcWallet(chainId);
  let tokenBalances = await tokenStore.updateAllTokenBalances(rpcWallet);
  return tokenBalances;
}