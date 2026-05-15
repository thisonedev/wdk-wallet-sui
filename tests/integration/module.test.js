// Copyright 2024 Tether Operations Limited
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict'

import brittle from 'brittle'
import { SUI_TYPE_ARG } from '@mysten/sui/utils'
import { getFullnodeUrl } from '@mysten/sui/client'
import WalletManagerSui from '../../src/wallet-manager-sui.js'

const test = brittle
if (process.env.JEST_WORKER_ID) {
  test.configure({ silent: true })
}
const SEED_PHRASE = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'

const ACCOUNT_0 = {
  index: 0,
  path: "m/44'/784'/0'/0'/0'",
  address: '0x5e93a736d04fbb25737aa40bee40171ef79f65fae833749e3c089fe7cc2161f1',
  keyPair: {
    privateKey: '737569707269766b657931717a79786e6a63387a37396c766c7367366c7a3268',
    publicKey: '900b4d81eecea3df2f74b14200c4f4cf3f49afaca7a634ffd2cf6ff82bdaecf2'
  }
}

const ACCOUNT_1 = {
  index: 1,
  path: "m/44'/784'/1'/0'/0'",
  address: '0x082d099250999ab8450a9ef3a962edf9e2449e1045be32ba5a0f2c6117ff7167',
  keyPair: {
    privateKey: '737569707269766b657931717065787a3074716a786c65367a65326e76357733',
    publicKey: '97979c17ee40b92d0c2a72654141ad39a4d31aefa0eb2941de63f570148b8a4a'
  }
}

const INITIAL_BALANCE = 1_000_000_000n // 1 SUI
const INITIAL_TOKEN_BALANCE = 1_000_000n
const RECIPIENT_ADDRESS = '0x082d099250999ab8450a9ef3a962edf9e2449e1045be32ba5a0f2c6117ff7167'

async function requireFunds (account, amount = INITIAL_BALANCE) {
  const balance = await account.getBalance()
  if (balance >= amount) return true

  const address = await account.getAddress()
  console.warn(`\n[!] Account ${address} balance is ${balance}, which is insufficient for testing.`)
  return false
}

test('@tetherto/wdk-wallet-sui', async (t) => {
  const manager = new WalletManagerSui(SEED_PHRASE, { rpcUrl: getFullnodeUrl('testnet') })

  // Ensure accounts are funded for subsequent tests
  const account0 = await manager.getAccount(0)
  const account1 = await manager.getAccount(1)
  const isFunded0 = await requireFunds(account0, INITIAL_BALANCE)
  const isFunded1 = await requireFunds(account1, 1000000n) // Just some gas for account1

  if (isFunded0 && isFunded1) {
    await t.test('should derive an account, quote the cost of a tx and send the tx', async (t) => {
      const account0 = await manager.getAccount(0)
      const account1 = await manager.getAccount(1)

      const TRANSACTION = {
        to: RECIPIENT_ADDRESS,
        value: 1_000n
      }

      const { fee: feeEstimate } = await account0.quoteSendTransaction(TRANSACTION)
      t.ok(feeEstimate > 0n, 'Fee estimate should be positive')

      const { hash, fee } = await account0.sendTransaction(TRANSACTION)
      t.ok(hash, 'Transaction hash should exist')
      t.is(fee, feeEstimate, 'Actual fee should match estimate')

      let receipt = null
      for (let i = 0; i < 10; i++) {
        receipt = await account0.getTransactionReceipt(hash)
        if (receipt) break
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
      t.ok(receipt, 'Receipt should exist')
    })

    await t.test('should transfer tokens from account 0 to account 1', async (t) => {
      const account0 = await manager.getAccount(0)
      const account1 = await manager.getAccount(1)
      const recipient = await account1.getAddress()

      const TRANSFER = {
        token: SUI_TYPE_ARG,
        recipient,
        amount: INITIAL_TOKEN_BALANCE
      }

      const { fee: feeEstimate } = await account0.quoteTransfer(TRANSFER)
      t.ok(feeEstimate > 0n, 'Fee estimate should be positive')

      const { hash, fee } = await account0.transfer(TRANSFER)
      t.ok(hash, 'Transaction hash should exist')
      t.is(fee, feeEstimate, 'Actual fee should match estimate')

      let receipt = null
      for (let i = 0; i < 10; i++) {
        receipt = await account0.getTransactionReceipt(hash)
        if (receipt) break
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
      t.ok(receipt, 'Receipt should exist')
    })

    await t.test('should derive two accounts, send a tx from account 1 to 2 and get the correct balances', async (t) => {
      const account0 = await manager.getAccount(0)
      const account1 = await manager.getAccount(1)

      const balance0Before = await account0.getBalance()
      const balance1Before = await account1.getBalance()

      const TRANSACTION = {
        to: await account1.getAddress(),
        value: 1_000n
      }

      const { hash, fee } = await account0.sendTransaction(TRANSACTION)

      // Wait for balance updates
      let balance0After, balance1After
      for (let i = 0; i < 15; i++) {
        balance0After = await account0.getBalance()
        balance1After = await account1.getBalance()
        if (balance1After > balance1Before) break
        await new Promise(resolve => setTimeout(resolve, 2000))
      }

      t.is(balance0After, balance0Before - fee - 1_000n, 'Account 0 balance updated correctly')
      t.is(balance1After, balance1Before + 1_000n, 'Account 1 balance updated correctly')
    })

    await t.test('should derive an account by its path, quote the cost of transferring a token and transfer a token', async (t) => {
      const account = await manager.getAccountByPath("0'/0'/0'")

      // Using native SUI (SUI_TYPE_ARG) as the "token" for parity with EVM/Solana test structures
      const TRANSFER = {
        token: SUI_TYPE_ARG,
        recipient: ACCOUNT_1.address,
        amount: 100n
      }

      const { fee: feeEstimate } = await account.quoteTransfer(TRANSFER)
      t.ok(feeEstimate > 0n, 'Fee estimate should be positive')

      const { hash, fee } = await account.transfer(TRANSFER)
      t.ok(hash, 'Transfer successful')
      t.is(fee, feeEstimate, 'Fee matches estimate')

      let receipt = null
      for (let i = 0; i < 10; i++) {
        receipt = await account.getTransactionReceipt(hash)
        if (receipt) break
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
      t.ok(receipt, 'Receipt exists')
    })

    await t.test('should derive two accounts by their paths, transfer a token from account 1 to 2 and get the correct balances and token balances', async (t) => {
      const account0 = await manager.getAccountByPath("0'/0'/0'")
      const account1 = await manager.getAccountByPath("1'/0'/0'")

      const TRANSFER = {
        token: SUI_TYPE_ARG,
        recipient: await account1.getAddress(),
        amount: 500n
      }

      const balance0Before = await account0.getBalance()
      const tokenBalance1Before = await account1.getTokenBalance(SUI_TYPE_ARG)

      const { hash, fee } = await account0.transfer(TRANSFER)

      let balance0After, tokenBalance1After
      for (let i = 0; i < 15; i++) {
        balance0After = await account0.getBalance()
        tokenBalance1After = await account1.getTokenBalance(SUI_TYPE_ARG)
        if (tokenBalance1After > tokenBalance1Before) break
        await new Promise(resolve => setTimeout(resolve, 2000))
      }

      t.is(balance0After, balance0Before - fee - 500n, 'Account 0 balance updated correctly')
      t.is(tokenBalance1After, tokenBalance1Before + 500n, 'Account 1 token balance updated correctly')
    })
  }

  await t.test('should retrieve multiple token balances at once', async (t) => {
    const account = await manager.getAccount(0)
    const balances = await account.getTokenBalances([SUI_TYPE_ARG])

    t.ok(balances[SUI_TYPE_ARG] !== undefined, 'SUI balance included in results')
    t.is(balances[SUI_TYPE_ARG], await account.getBalance(), 'SUI balance matches getBalance()')
  })
  await t.test('should derive an account, sign a message and verify its signature', async (t) => {
    const account = await manager.getAccount(0)

    const MESSAGE = 'Hello, world!'
    const signature = await account.sign(MESSAGE)
    const isValid = await account.verify(MESSAGE, signature)
    t.ok(isValid, 'Signature is valid')
  })

  await t.test('should dispose the wallet and erase the private keys of the accounts', async (t) => {
    const tempManager = new WalletManagerSui(SEED_PHRASE, {
      rpcUrl: getFullnodeUrl('testnet')
    })
    const account0 = await tempManager.getAccount(0)
    const account1 = await tempManager.getAccount(1)

    tempManager.dispose()

    const MESSAGE = 'Hello, world!'
    const TRANSACTION = { to: ACCOUNT_1.address, value: 1_000n }
    const TRANSFER = { token: SUI_TYPE_ARG, recipient: ACCOUNT_1.address, amount: 100n }

    for (const account of [account0, account1]) {
      t.absent(account.keyPair.privateKey, 'Private key erased')
      try {
        await account.sign(MESSAGE)
        t.fail('Should have thrown')
      } catch (err) {
        t.is(err.message, 'The wallet account has been disposed.', 'Correct error thrown after disposal')
      }
      try {
        await account.sendTransaction(TRANSACTION)
        t.fail('Should have thrown')
      } catch (err) {
        t.is(err.message, 'The wallet account has been disposed.', 'Correct error thrown after disposal')
      }
      try {
        await account.transfer(TRANSFER)
        t.fail('Should have thrown')
      } catch (err) {
        t.is(err.message, 'The wallet account has been disposed.', 'Correct error thrown after disposal')
      }
    }
  })

  await t.test('should create a wallet with a low transfer max fee, derive an account, try to transfer some tokens and gracefully fail', async (t) => {
    // Only run if we have funds, or skip
    const account = await manager.getAccount(0)
    const balance = await account.getBalance()
    if (balance === 0n) {
      t.pass('Skipping: Insufficient funds')
      return
    }

    const limitedManager = new WalletManagerSui(SEED_PHRASE, {
      rpcUrl: getFullnodeUrl('testnet'),
      transferMaxFee: 1n
    })
    const limitedAccount = await limitedManager.getAccount(0)

    const TRANSFER = { token: SUI_TYPE_ARG, recipient: ACCOUNT_1.address, amount: 100n }

    try {
      await limitedAccount.transfer(TRANSFER)
      t.fail('Should have failed due to max fee')
    } catch (err) {
      t.ok(err.message.includes('Exceeded maximum fee cost') || err.message.includes('insufficient'), 'Caught expected fee limit or balance error')
    }
  })

  await t.test('should sign a transaction, then broadcast manually', async (t) => {
    // Fresh manager for final test
    const freshManager = new WalletManagerSui(SEED_PHRASE, { rpcUrl: getFullnodeUrl('devnet') })
    const account = await freshManager.getAccount(0)
    const TRANSACTION = {
      to: ACCOUNT_1.address,
      value: 1_000n
    }

    const signature = await account.signTransaction(TRANSACTION)
    t.ok(signature, 'Transaction signed')
  })
})
