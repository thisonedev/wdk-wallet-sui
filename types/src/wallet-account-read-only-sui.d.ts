/**
 * Read-only SUI wallet account implementation.
 */
export default class WalletAccountReadOnlySui extends WalletAccountReadOnly {
    /**
     * Creates a new SUI read-only wallet account.
     *
     * @param {string} addr - The account's address.
     * @param {Omit<SuiWalletConfig, 'transferMaxFee'>} [config] - The configuration object.
     */
    constructor(addr: string, config?: Omit<SuiWalletConfig, "transferMaxFee">);
    /**
     * The read-only wallet account configuration.
     *
     * @protected
     * @type {Omit<SuiWalletConfig, 'transferMaxFee'>}
     */
    protected _config: Omit<SuiWalletConfig, "transferMaxFee">;
    /**
     * A SUI client for RPC requests.
     *
     * @protected
     * @type {SuiClientType | undefined}
     */
    protected _client: SuiClientType | undefined;
    /**
     * Returns the account balances for multiple coins.
     *
     * @param {string[]} coinTypes - The types of the coins.
     * @returns {Promise<Record<string, bigint>>} A mapping of coin types to their balances (in base units).
     */
    getTokenBalances(coinTypes: string[]): Promise<Record<string, bigint>>;
    /**
     * Returns the metadata for a specific coin type.
     *
     * @param {string} coinType - The type of the coin.
     * @returns {Promise<import('@mysten/sui/client').CoinMetadata | null>} The coin metadata.
     */
    getTokenMetadata(coinType: string): Promise<import("@mysten/sui/client").CoinMetadata | null>;
    /**
     * Quotes the costs of a send transaction operation.
     *
     * @param {SuiTransaction} tx - The transaction.
     * @returns {Promise<Omit<TransactionResult, 'hash'>>} The transaction's quotes.
     */
    quoteSendTransaction(tx: SuiTransaction): Promise<Omit<TransactionResult, "hash">>;
    /**
     * Retrieves a transaction receipt by its digest.
     *
     * @param {string} hash - The transaction's digest.
     * @returns {Promise<SuiTransactionReceipt | null>} The receipt, or null if not found.
     */
    getTransactionReceipt(hash: string): Promise<SuiTransactionReceipt | null>;
    /**
     * Calculates the fee for a given transaction.
     *
     * @protected
     * @param {SuiTransaction} tx - The transaction.
     * @returns {Promise<bigint>} The calculated transaction fee in MIST.
     */
    protected _getTransactionFee(tx: SuiTransaction): Promise<bigint>;
    /**
     * Builds a transaction for native SUI transfer.
     *
     * @protected
     * @param {string} to - The recipient's address.
     * @param {number | bigint} value - The amount of SUI to send (in MIST).
     * @returns {Promise<Transaction>} The constructed transaction.
     */
    protected _buildNativeTransferTransaction(to: string, value: number | bigint): Promise<Transaction>;
    /**
     * Builds a transaction for coin transfer.
     *
     * @protected
     * @param {string} coinType - The type of the coin.
     * @param {string} recipient - The recipient's address.
     * @param {number | bigint} amount - The amount to transfer.
     * @returns {Promise<Transaction>} The constructed transaction.
     */
    protected _buildCoinTransferTransaction(coinType: string, recipient: string, amount: number | bigint): Promise<Transaction>;
}
export type SuiClientType = import("@mysten/sui/client").SuiClient;
export type SuiTransactionReceipt = import("@mysten/sui/client").SuiTransactionBlockResponse;
export type TransactionResult = import("@tetherto/wdk-wallet").TransactionResult;
export type TransferOptions = import("@tetherto/wdk-wallet").TransferOptions;
export type TransferResult = import("@tetherto/wdk-wallet").TransferResult;
export type SimpleSuiTransaction = {
    /**
     * - The recipient's SUI address.
     */
    to: string;
    /**
     * - The amount of SUI to send in MIST (1 SUI = 1,000,000,000 MIST).
     */
    value: number | bigint;
};
export type SuiTransaction = SimpleSuiTransaction | Transaction;
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
    /**
     * - Maximum allowed fee in MIST for transfer operations.
     */
    transferMaxFee?: number | bigint;
};
import { WalletAccountReadOnly } from '@tetherto/wdk-wallet';
import { Transaction } from '@mysten/sui/transactions';
