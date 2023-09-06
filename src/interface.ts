export interface ISwapConfigUI {
  campaignId?: number;
  category: any;
  providers: any;
  commissions?: any;
  tokens?: any;
  defaultChainId: number;
  wallets: any;
  networks: any;
  showHeader?: boolean;
  logo?: string;
  title?: string;
}

export interface ISwapData {
  stepName: string;
  data: ISwapConfigUI;
}
