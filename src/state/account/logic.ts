import { useRef } from "react"
import { ethers, JsonRpcProvider } from "ethers"
import { AccountStateType, useAccountState } from "./state"
import { ConfigType } from "@/types/config"
import contractAbi from "smartcontracts/build/contracts/erc20/erc20.abi.json"
import {
  FetchTransactionsQueryParams,
  IndexerService,
  TransactionStatusType,
} from "@/services/indexer"
import { ApiService } from "@/services/api"
import { BundlerService } from "@/services/bundler"
import { CredentialsService } from "@/services/credentials"

class AccountLogic {
  private credentials = new CredentialsService()

  private provider: JsonRpcProvider
  private indexer: IndexerService
  private bundler: BundlerService

  constructor(
    private state: AccountStateType,
    private config: ConfigType,
    private account: string
  ) {
    this.state = state
    this.config = config
    this.account = account

    const api = new ApiService(this.config.indexer.url)
    this.indexer = new IndexerService(api, this.config.token.address)
    this.bundler = new BundlerService(this.config)

    this.provider = new JsonRpcProvider(this.config.node.url)
  }

  fetchBalance = async (accountAddress: string) => {
    this.state.fetchBalanceRequest()
    try {
      if (!accountAddress) {
        throw new Error("Account address is required")
      }
      const provider = new JsonRpcProvider(this.config.node.url)
      const tokenContract = new ethers.Contract(
        this.config.token.address,
        contractAbi,
        provider
      )

      const balance = await tokenContract.balanceOf(accountAddress)

      this.state.fetchBalanceSuccess(balance)
    } catch (e) {
      this.state.fetchBalanceFailure()
    }
  }

  fetchTransactions = async (
    address: string,
    params?: FetchTransactionsQueryParams
  ) => {
    try {
      this.state.fetchTransactionsRequest()

      const txs = await this.indexer.fetchTransactions(address, params)

      this.state.fetchTransactionsSuccess(txs)
    } catch (error) {
      this.state.fetchTransactionsFailure()
    }
  }

  cancel?: () => void

  startListeningForTransactions = async (address: string) => {
    try {
      this.cancel = this.indexer.listenForNewTransactions(address, (txs) =>
        this.state.addNewTransactions(txs)
      )
    } catch (error) {
      console.error("Error listening for transactions", error)
    }
  }

  stopListeningForTransactions = () => {
    this.cancel?.()

    this.cancel = undefined
  }

  send = async (to: string, amount: string, description?: string) => {
    try {
      this.state.txSendRequest()

      const privateKey = this.credentials.getPrivateKey()
      if (!privateKey) {
        throw new Error("Private key is required")
      }

      const signer = new ethers.Wallet(privateKey, this.provider)

      const userop = await this.bundler.sendERC20Token(
        signer,
        this.config.token.address,
        this.account,
        to,
        amount,
        description
      )

      const value = ethers.parseUnits(amount, this.config.token.decimals)

      this.state.txSendSuccess({
        from: this.account,
        to,
        value,
        created_at: new Date().toISOString(),
        hash: "", // unknown until we have a sync endpoint
        data: description !== undefined ? { description } : null,
        nonce: userop.nonce,
        status: "sending",
        token_id: 0,
        tx_hash: "", // unknown until we have a sync endpoint
      })
    } catch (error) {
      console.error("Error sending transaction", error)
      this.state.txSendFailure()
    }
  }
}

export const useAccountLogic = (config: ConfigType, account: string) => {
  const state = useAccountState()
  const logicRef = useRef(new AccountLogic(state, config, account))
  return logicRef.current
}
