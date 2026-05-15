export default class WalletManagerSui extends WalletManager {
    /**
     * Creates a new wallet manager for the SUI blockchain.
     *
     * @param {string | Uint8Array} seed - The wallet's [BIP-39](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki) seed phrase.
     * @param {SuiWalletConfig} [config] - The configuration object.
     */
    constructor(seed: string | Uint8Array, config?: SuiWalletConfig);
    /**
     * A SUI client for RPC requests.
     *
     * @protected
     * @type {SuiClientType | undefined}
     */
    protected _client: SuiClientType | undefined;
    /**
     * Returns the wallet account at a specific index.
     *
     * @example
     * // Returns the account with derivation path m/44'/784'/index'/0'/0'
     * const account = await wallet.getAccount(1);
     * @param {number} [index] - The index of the account to get (default: 0).
     * @returns {Promise<WalletAccountSui>} The account.
     */
    getAccount(index?: number): Promise<WalletAccountSui>;
    /**
     * Returns the wallet account at a specific derivation path.
     *
     * @example
     * // Returns the account with derivation path m/44'/784'/0'/0'/1'
     * const account = await wallet.getAccountByPath("0'/0'/1'");
     * @param {string} path - The derivation path (e.g. "0'/0'/0'").
     * @returns {Promise<WalletAccountSui>} The account.
     */
    getAccountByPath(path: string): Promise<WalletAccountSui>;
}
export type SuiClientType = import("@mysten/sui/client").SuiClient;
export type FeeRates = import("@tetherto/wdk-wallet").FeeRates;
export type SuiWalletConfig = {
    /**
     * - The SUI RPC endpoint(s).
     */
    rpcUrl?: string | string[];
    /**
     * - A pre-configured SUI client.
     */
    provider?: SuiClientType;
    /**
     * - The SUI network to connect to (default: 'mainnet').
     */
    network?: "mainnet" | "testnet" | "devnet" | "localnet";
    /**
     * - The number of retries for RPC requests (default: 3).
     */
    retries?: number;
};
import WalletManager from '@tetherto/wdk-wallet';
import WalletAccountSui from './wallet-account-sui.js';
