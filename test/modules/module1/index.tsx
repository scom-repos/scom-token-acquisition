import { Module, customModule, Container, Styles } from '@ijstech/components';
import ScomTokenAcquisition from '@scom/scom-token-acquisition';
const Theme = Styles.Theme.currentTheme;

@customModule
export default class Module1 extends Module {
  private _steps: any[] = [];
  private elm: ScomTokenAcquisition;
  constructor(parent?: Container, options?: any) {
    super(parent, options);
    this._steps = [
      {
        stepName: 'Step 1',
        data: {
          providers: [
            {
              caption: 'OpenSwap',
              image: 'ipfs://bafkreidoi5pywhyo4hqdltlosvrvefgqj4nuclmjl325exzmjgnyl2cc4y',
              key: 'OpenSwap',
              dexId: 1,
              chainId: 97,
            },
            {
              caption: 'OpenSwap',
              image: 'ipfs://bafkreidoi5pywhyo4hqdltlosvrvefgqj4nuclmjl325exzmjgnyl2cc4y',
              key: 'OpenSwap',
              dexId: 1,
              chainId: 43113,
            },
          ],
          category: 'fixed-pair',
          tokens: [
            {
              name: 'USDT',
              address: '0x29386B60e0A9A1a30e1488ADA47256577ca2C385',
              symbol: 'USDT',
              decimals: 6,
              chainId: 97,
            },
            {
              name: 'OpenSwap',
              address: '0x45eee762aaeA4e5ce317471BDa8782724972Ee19',
              symbol: 'OSWAP',
              decimals: 18,
              chainId: 97,
            },
            {
              name: 'Tether USD',
              address: '0xb9C31Ea1D475c25E58a1bE1a46221db55E5A7C6e',
              symbol: 'USDT.e',
              decimals: 6,
              chainId: 43113,
            },
            {
              name: 'OpenSwap',
              address: '0x78d9D80E67bC80A11efbf84B7c8A65Da51a8EF3C',
              symbol: 'OSWAP',
              decimals: 18,
              chainId: 43113,
            },
          ],
          defaultChainId: 43113,
          networks: [
            {
              chainId: 43113,
            },
            {
              chainId: 97,
            },
          ],
          wallets: [
            {
              name: 'metamask',
            },
          ],
          showHeader: true,
        },
      },
      {
        stepName: 'Step 2',
        data: {
          providers: [
            {
              caption: 'OpenSwap',
              image: 'ipfs://bafkreidoi5pywhyo4hqdltlosvrvefgqj4nuclmjl325exzmjgnyl2cc4y',
              key: 'OpenSwap',
              dexId: 1,
              chainId: 43113,
            },
          ],
          category: 'aggregator',
          tokens: [
            {
              name: 'OpenSwap',
              address: '0x78d9D80E67bC80A11efbf84B7c8A65Da51a8EF3C',
              symbol: 'OSWAP',
              decimals: 18,
              chainId: 43113,
            },
          ],
          defaultChainId: 43113,
          networks: [
            {
              chainId: 43113,
            },
          ],
          wallets: [
            {
              name: 'metamask',
            },
          ],
        },
      },
    ];
  }

  private onChanged() {
    console.log('change step');
  }

  init() {
    super.init();
  }

  render() {
    return (
      <i-panel margin={{ left: '1rem', top: '1rem' }}>
        <i-scom-token-acquisition
          id="elm"
          data={this._steps}
          onChanged={this.onChanged.bind(this)}
        />
      </i-panel>
    );
  }
}
