/**
 * Full-featured SUI wallet account implementation with signing capabilities.
 */
export default class WalletAccountSui extends WalletAccountReadOnlySui {
    /**
     * Creates a new SUI wallet account.
     *
     * @param {string | Uint8Array} seed - The wallet's [BIP-39](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki) seed phrase.
     * @param {string} path - The SLIP-0010 derivation path (e.g. "0'/0'/0'").
     * @param {SuiWalletConfig} [config] - The configuration object.
     * @returns {Promise<WalletAccountSui>} The wallet account.
     */
    static at(seed: string | Uint8Array, path: string, config?: SuiWalletConfig): Promise<WalletAccountSui>;
    /**
     * @private
     * Use {@link WalletAccountSui.at} instead.
     */
    private constructor();
    /**
     * @private
     */
    private _seed;
    /**
     * @private
     */
    private _path;
    /**
     * The Ed25519 key pair for signing.
     *
     * @private
     * @type {Ed25519Keypair | undefined}
     */
    private _keypair;
    /**
     * Raw Ed25519 public key bytes.
     *
     * @private
     * @type {Uint8Array | undefined}
     */
    private _rawPublicKey;
    /**
     * Raw Ed25519 private key bytes.
     *
     * @private
     * @type {Uint8Array | undefined}
     */
    private _rawPrivateKey;
    /**
     * The derivation path's index of this account.
     *
     * @type {number}
     */
    get index(): number;
    /**
     * The derivation path of this account.
     *
     * @type {string}
     */
    get path(): string;
    /**
     * The account's key pair.
     *
     * @type {KeyPair}
     */
    get keyPair(): KeyPair;
    /**
     * Signs a message.
     *
     * @param {string} message - The message to sign.
     * @returns {Promise<string>} The message's signature (serialized).
     */
    sign(message: string): Promise<string>;
    /**
     * Signs a transaction.
     *
     * @param {SuiTransaction} tx - The transaction to sign.
     * @returns {Promise<string>} The signed transaction (serialized signature).
     */
    signTransaction(tx: SuiTransaction): Promise<string>;
    /**
     * Sends a transaction.
     *
     * @param {SuiTransaction} tx - The transaction.
     * @returns {Promise<TransactionResult>} The transaction's result.
     */
    sendTransaction(tx: SuiTransaction): Promise<TransactionResult>;
    /**
     * Transfers native SUI.
     *
     * @param {string} to - Recipient address.
     * @param {number | bigint} amount - Amount in MIST.
     * @returns {Promise<TransactionResult>}
     */
    send(to: string, amount: number | bigint): Promise<TransactionResult>;
    /**
     * Transfers a token (coin) to another address.
     *
     * @param {TransferOptions} options - The transfer's options.
     * @returns {Promise<TransferResult>} The transfer's result.
     */
    transfer(options: TransferOptions): Promise<TransferResult>;
    /**
     * Publishes a Move package.
     *
     * @param {Object} options - Publish options.
     * @param {string[]} options.modules - Compiled modules as base64 strings.
     * @param {string[]} options.dependencies - Dependencies of the package.
     * @returns {Promise<TransactionResult>}
     */
    publish(options: {
        modules: string[];
        dependencies: string[];
    }): Promise<TransactionResult>;
    /**
     * Executes a Move call.
     *
     * @param {Object} options - Move call options.
     * @param {string} options.target - The target function (e.g. "package::module::function").
     * @param {string[]} [options.typeArguments] - Type arguments for the function.
     * @param {any[]} [options.arguments] - Arguments for the function.
     * @returns {Promise<TransactionResult>}
     */
    moveCall(options: {
        target: string;
        typeArguments?: string[];
        arguments?: any[];
    }): Promise<TransactionResult>;
    /**
     * Returns a read-only copy of the account.
  
     *
     * @returns {Promise<WalletAccountReadOnlySui>} The read-only account.
     */
    toReadOnlyAccount(): Promise<WalletAccountReadOnlySui>;
    _suiReadOnlyAccount: WalletAccountReadOnlySui;
    /**
     * Disposes the wallet account, erasing the private key from memory.
     */
    dispose(): void;
}
export type KeyPair = import("@tetherto/wdk-wallet").KeyPair;
export type TransactionResult = import("@tetherto/wdk-wallet").TransactionResult;
export type TransferOptions = import("@tetherto/wdk-wallet").TransferOptions;
export type TransferResult = import("@tetherto/wdk-wallet").TransferResult;
export type SuiTransaction = import("./wallet-account-read-only-sui.js").SuiTransaction;
export type SuiWalletConfig = import("./wallet-account-read-only-sui.js").SuiWalletConfig;
import WalletAccountReadOnlySui from './wallet-account-read-only-sui.js';
