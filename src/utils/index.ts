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

export function calculateStepPropertiesData(
  stepName: string, 
  chainIds: number[],
  tokenInObjArr: ITokenObject[], 
  tokenOutObj: ITokenObject, 
  remainingAmountOutDecimals: string
) {
  const defaultTokenInObj = tokenInObjArr[0];
  let category = defaultTokenInObj.chainId === tokenOutObj.chainId ? 'aggregator' : 'cross-chain-swap';
  let providers = chainIds.map(v => (
    {
      key: 'OpenSwap',
      chainId: v,
    }
  ));
  let networks = chainIds.map(v => (
    {
      chainId: v,
    }
  ));
  let defaultInputValue = '0';
  let defaultOutputValue = '0';
  if (defaultTokenInObj.chainId !== tokenOutObj.chainId) {
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
          ...tokenInObjArr,
          tokenOutObj,
        ],
        defaultInputValue: defaultInputValue,
        defaultOutputValue: defaultOutputValue,
        defaultChainId: defaultTokenInObj.chainId,
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