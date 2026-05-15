'use strict'

import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import WalletAccountSui from '../src/wallet-account-sui.js'
import { Transaction } from '@mysten/sui/transactions'

const TEST_SEED = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'
const RECIPIENT_ADDRESS = '0x082d099250999ab8450a9ef3a962edf9e2449e1045be32ba5a0f2c6117ff7167'
const TEST_PATH = "0'/0'/0'"

describe('WalletAccountSui', () => {
  let account
  let mockClient

  beforeEach(async () => {
    mockClient = {
      signAndExecuteTransaction: jest.fn(),
      dryRunTransactionBlock: jest.fn().mockResolvedValue({
        effects: { status: { status: 'success' }, gasUsed: { computationCost: 1000, storageCost: 100, storageRebate: 0 } }
      }),
      getCoins: jest.fn().mockResolvedValue({ data: [{ coinObjectId: '0x1', balance: '1000000000' }] }),
      getReferenceGasPrice: jest.fn().mockResolvedValue(1000n)
    }
    // Setup Account
    account = await WalletAccountSui.at(TEST_SEED, TEST_PATH, { provider: mockClient })
    
    // Mock Transaction.build to prevent full async build calls
    jest.spyOn(Transaction.prototype, 'build').mockResolvedValue(new Uint8Array([0]))
  })

  describe('keyPair', () => {
    it('should have consistent keyPair', () => {
      const keyPair = account.keyPair
      expect(keyPair.publicKey).toBeDefined()
      expect(keyPair.privateKey).toBeDefined()
      expect(keyPair.publicKey).toBeInstanceOf(Uint8Array)
      expect(keyPair.privateKey).toBeInstanceOf(Uint8Array)
    })
  })

  describe('path', () => {
    it('should follow SLIP-0010 SUI derivation path format', () => {
      expect(account.path).toBe("m/44'/784'/0'/0'/0'")
    })
  })

  describe('getAddress', () => {
    it('should return a valid SUI address', async () => {
      const address = await account.getAddress()
      expect(address).toMatch(/^0x[a-f0-9]{64}$/)
    })

    it('should throw error for invalid mnemonic', async () => {
      expect(() => new WalletAccountSui('invalid seed', "0'/0'/0'"))
        .toThrow('The seed phrase is invalid.')
    })
  })

  describe('sign', () => {
    const MESSAGE = 'Dummy message to sign.'

    it('should return the correct signature', async () => {
      const signature = await account.sign(MESSAGE)

      expect(typeof signature).toBe('string')
    })

    it('should throw if signing with disposed account', async () => {
      account.dispose()
      await expect(account.sign('hello')).rejects.toThrow('The wallet account has been disposed.')
    })
  })

  describe('signTransaction', () => {
    it('should sign a transaction', async () => {
      const tx = new Transaction()
      const sig = await account.signTransaction(tx)
      expect(typeof sig).toBe('string')
    })

    it('should sign a native transfer transaction in signTransaction', async () => {
      const sig = await account.signTransaction({ to: RECIPIENT_ADDRESS, value: 1000n })
      expect(sig).toBeDefined()
    })

    it('should throw if signTransaction has invalid transaction', async () => {
      await expect(account.signTransaction({})).rejects.toThrow('Invalid transaction object.')
    })

    it('should throw if account is disposed', async () => {
      account.dispose()
      await expect(account.signTransaction(new Transaction())).rejects.toThrow('The wallet account has been disposed.')
    })
  })

  describe('sendTransaction', () => {
    it('should successfully send a transaction', async () => {
      mockClient.signAndExecuteTransaction.mockResolvedValue({ digest: '0xhash' })
      const tx = new Transaction()
      const result = await account.sendTransaction(tx)
      expect(result.hash).toBe('0xhash')
    })

    it('should throw if transferMaxFee is exceeded', async () => {
      const limitedAccount = await WalletAccountSui.at(TEST_SEED, TEST_PATH, { 
        provider: mockClient,
        transferMaxFee: 10n
      })
      mockClient.dryRunTransactionBlock.mockResolvedValue({
        effects: { status: { status: 'success' }, gasUsed: { computationCost: 100, storageCost: 0, storageRebate: 0 } }
      })

      await expect(limitedAccount.sendTransaction({ to: '0x1', value: 1000n }))
        .rejects.toThrow('Exceeded maximum fee cost for transaction. Fee: 100, Max: 10')
    })

    it('should throw if sendTransaction has no provider', async () => {
      const disconnectedAccount = await WalletAccountSui.at(TEST_SEED, TEST_PATH)
      await expect(disconnectedAccount.sendTransaction({ to: '0x1', value: 1n })).rejects.toThrow('The wallet must be connected to a provider to send transactions.')
    })

    it('should throw if account is disposed', async () => {
      account.dispose()
      await expect(account.sendTransaction(new Transaction())).rejects.toThrow('The wallet account has been disposed.')
    })
  })

  describe('send', () => {
    it('should successfully send native SUI', async () => {
      mockClient.signAndExecuteTransaction.mockResolvedValue({ digest: '0xhash' })
      const result = await account.send(RECIPIENT_ADDRESS, 1000n)
      expect(result.hash).toBe('0xhash')
    })

    it('should throw if recipient is invalid', async () => {
      await expect(account.send('invalid', 1000n)).rejects.toThrow('Invalid recipient address.')
    })

    it('should throw if amount is 0 in send', async () => {
      await expect(account.send(RECIPIENT_ADDRESS, 0n)).rejects.toThrow('Amount must be greater than 0.')
    })
  })

  describe('transfer', () => {
    it('should successfully transfer tokens', async () => {
      mockClient.signAndExecuteTransaction.mockResolvedValue({ digest: '0xhash' })
      const result = await account.transfer({
        token: '0x2::sui::SUI',
        recipient: RECIPIENT_ADDRESS,
        amount: 1000n
      })
      expect(result.hash).toBe('0xhash')
    })

    it('should throw if transfer options are invalid', async () => {
      await expect(account.transfer({ token: '', recipient: '0x1', amount: 1n })).rejects.toThrow('Invalid token (coin) type.')
      await expect(account.transfer({ token: '0x2', recipient: '', amount: 1n })).rejects.toThrow('Invalid recipient address.')
      await expect(account.transfer({ token: '0x2', recipient: '0x1', amount: 0n })).rejects.toThrow('Amount must be greater than 0.')
    })

    it('should throw if account is disposed', async () => {
      account.dispose()
      await expect(account.transfer({ token: '0x2::sui::SUI', recipient: '0x1', amount: 1n })).rejects.toThrow('The wallet account has been disposed.')
    })
  })

  describe('publish', () => {
    it('should successfully publish a package', async () => {
      mockClient.signAndExecuteTransaction.mockResolvedValue({ digest: '0xhash' })
      const result = await account.publish({ modules: ['a'], dependencies: [] })
      expect(result.hash).toBe('0xhash')
    })

    it('should throw if account is disposed', async () => {
      account.dispose()
      await expect(account.publish({ modules: ['a'], dependencies: [] })).rejects.toThrow('The wallet account has been disposed.')
    })
  })

  describe('moveCall', () => {
    it('should successfully execute a move call', async () => {
      mockClient.signAndExecuteTransaction.mockResolvedValue({ digest: '0xhash' })
      const result = await account.moveCall({ target: '0x2::coin::transfer' })
      expect(result.hash).toBe('0xhash')
    })

    it('should handle object and pure arguments in moveCall', async () => {
      mockClient.signAndExecuteTransaction.mockResolvedValue({ digest: '0xhash' })

      // Use a Uint8Array to satisfy tx.pure() requirement for serialized value
      const result = await account.moveCall({
        target: '0x2::coin::transfer',
        arguments: ['0x123', new Uint8Array([1, 2, 3])]
      })
      expect(result.hash).toBe('0xhash')
    })

    it('should throw if account is disposed', async () => {
      account.dispose()
      await expect(account.moveCall({ target: '0x2::coin::transfer' })).rejects.toThrow('The wallet account has been disposed.')
    })
  })

  describe('toReadOnlyAccount', () => {
    it('should return a read-only account', async () => {
      const readOnly = await account.toReadOnlyAccount()
      const address = await account.getAddress()
      expect(readOnly.constructor.name).toBe('WalletAccountReadOnlySui')
      expect(await readOnly.getAddress()).toBe(address)
    })

    it('should verify a valid signature', async () => {
      const message = 'Hello Sui'
      const signature = await account.sign(message)
      const readOnly = await account.toReadOnlyAccount()

      const isValid = await readOnly.verify(message, signature)
      expect(isValid).toBe(true)
    })

    it('should return the same instance on subsequent calls', async () => {
      const readOnly1 = await account.toReadOnlyAccount()
      const readOnly2 = await account.toReadOnlyAccount()
      expect(readOnly1).toBe(readOnly2)
    })
  })

  describe('dispose', () => {
    it('should erase private keys', async () => {
      expect(account.keyPair.privateKey).toBeDefined()
      account.dispose()
      expect(account.keyPair.privateKey).toBeUndefined()
    })

    it('should handle multiple dispose calls safely', async () => {
      account.dispose()
      expect(() => account.dispose()).not.toThrow()
    })

    it('should clear private key from memory for different accounts', async () => {
      const tempAccount = await WalletAccountSui.at(TEST_SEED, "0'/0'/99'")
      expect(tempAccount.keyPair.privateKey).toBeDefined()
      tempAccount.dispose()
      expect(tempAccount.keyPair.privateKey).toBeUndefined()
    })
  })
})
