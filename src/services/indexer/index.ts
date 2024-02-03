import { ApiService } from "../api";

export interface FetchNewTransactionsQueryParams {
  fromDate?: Date;
  limit?: number;
}

export interface FetchTransactionsQueryParams {
  maxDate?: Date;
  limit?: number;
  offset?: number;
}

interface IndexerResponse {
  array?: any[];
  object?: any;
  meta?: { limit: number; offset: number; total: number };
  response_type: "array" | "object";
}

export type TransactionStatusType =
  | "sending"
  | "pending"
  | "success"
  | "failed";

export type TransactionDateType = {
  description: string;
};

export interface TransactionType {
  created_at: string;
  data: TransactionDateType | null;
  from: string;
  hash: string;
  nonce: number;
  status: TransactionStatusType;
  to: string;
  token_id: number;
  tx_hash: string;
  value: number;
}

export class IndexerService {
  constructor(private api: ApiService, private token: string) {
    this.api = api;
    this.token = token;
  }

  async fetchNewTransactions(
    address: string,
    {
      fromDate = new Date(),
      limit = 10,
    }: FetchNewTransactionsQueryParams | undefined = {
      fromDate: new Date(),
      limit: 10,
    }
  ): Promise<TransactionType[]> {
    const response = await this.api.get(
      `/logs/v2/transfers/${
        this.token
      }/${address}/new?fromDate=${fromDate.toISOString()}&limit=${limit}`
    );

    if (response.response_type !== "array") {
      throw new Error("Invalid response type");
    }

    if (!response.array) {
      throw new Error("Invalid response");
    }

    return response.array;
  }

  async fetchTransactions(
    address: string,
    {
      maxDate = new Date(),
      limit = 10,
      offset = 0,
    }: FetchTransactionsQueryParams | undefined = {
      maxDate: new Date(),
      limit: 10,
      offset: 0,
    }
  ): Promise<TransactionType[]> {
    const response: IndexerResponse = await this.api.get(
      `/logs/v2/transfers/${
        this.token
      }/${address}?maxDate=${maxDate.toISOString()}&limit=${limit}&offset=${offset}`
    );

    if (response.response_type !== "array") {
      throw new Error("Invalid response type");
    }

    if (!response.array) {
      throw new Error("Invalid response");
    }

    return response.array;
  }

  listenForNewTransactions(
    address: string,
    onNewTransactions: (txs: TransactionType[]) => void
  ): () => void {
    this.pollingAddress = address;

    this.lastFetchedTransactionDate = new Date(new Date().getTime() - 1000);

    this.pollForNewTransactions(address, onNewTransactions);

    return () => {
      this.pollingAddress = undefined;
    };
  }

  lastFetchedTransactionDate: Date | undefined;
  pollingAddress: string | undefined;

  async pollForNewTransactions(
    address: string,
    onNewTransactions: (txs: TransactionType[]) => void
  ): Promise<void> {
    if (!this.pollingAddress || this.pollingAddress !== address) {
      // make sure we don't start polling two addresses at the same time
      return;
    }

    // TODO: stop duplicate pollling

    const txs = await this.fetchNewTransactions(address, {
      fromDate: this.lastFetchedTransactionDate,
    });

    if (txs.length) {
      onNewTransactions(txs);
      this.lastFetchedTransactionDate = new Date(
        new Date(txs[0].created_at).getTime() + 500
      );
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));

    return this.pollForNewTransactions(address, onNewTransactions);
  }
}
