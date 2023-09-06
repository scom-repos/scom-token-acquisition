export interface ISwapConfigUI {
  campaignId?: number;
  category: any;
  providers: any;
  tokens?: any;
  defaultChainId: number;
  wallets: any;
  networks: any;
  logo?: string;
  title?: string;
}

export interface ISwapData {
  stepName: string;
  data: ISwapConfigUI;
}
