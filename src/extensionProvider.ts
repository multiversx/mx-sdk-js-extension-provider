import { Transaction } from "@multiversx/sdk-core/out/core/transaction";
import { Address } from "@multiversx/sdk-core/out/core/address";
import { Message } from "@multiversx/sdk-core/out/core/message";
import { IPlainTransactionObject } from "@multiversx/sdk-core/out/core/interfaces";

import {
  ErrAccountNotConnected,
  ErrCannotSignSingleTransaction,
} from "./errors";
import { Operation } from "./operation";

declare global {
  interface Window {
    /**
     * @deprecated `elrondWallet` will be deprecated in future versions. Please use `multiversxWallet` instead for future compatibility.
     */
    elrondWallet: { extensionId: string };
    multiversxWallet: { extensionId: string };
  }
}

export interface IProviderAccount {
  address: string;
  signature?: string;
}

export class ExtensionProvider {
  private account: IProviderAccount = { address: "" };
  private initialized: boolean = false;
  private static _instance: ExtensionProvider = new ExtensionProvider();

  private constructor() {
    if (ExtensionProvider._instance) {
      throw new Error(
        "Error: Instantiation failed: Use ExtensionProvider.getInstance() instead of new.",
      );
    }
    ExtensionProvider._instance = this;
  }

  public static getInstance(): ExtensionProvider {
    return ExtensionProvider._instance;
  }

  public setAddress(address: string): ExtensionProvider {
    this.account.address = address;
    return ExtensionProvider._instance;
  }

  async init(): Promise<boolean> {
    // Note: `elrondWallet` will be deprecated in future versions.
    // Please use `multiversxWallet` instead for future compatibility.
    if (window && (window.elrondWallet || window.multiversxWallet)) {
      this.initialized = true;
    }
    return this.initialized;
  }

  async login(
    options: {
      callbackUrl?: string;
      token?: string;
    } = {},
  ): Promise<IProviderAccount> {
    if (!this.initialized) {
      throw new Error(
        "Extension provider is not initialised, call init() first",
      );
    }
    const { token } = options;
    const data = token ? token : "";
    await this.startBgrMsgChannel(Operation.Connect, data);
    return this.account;
  }

  async logout(): Promise<boolean> {
    if (!this.initialized) {
      throw new Error(
        "Extension provider is not initialised, call init() first",
      );
    }
    try {
      await this.startBgrMsgChannel(Operation.Logout, this.account.address);
      this.disconnect();
    } catch (error) {
      console.warn("Extension origin url is already cleared!", error);
    }

    return true;
  }

  private disconnect() {
    this.account = { address: "" };
  }

  async getAddress(): Promise<string> {
    if (!this.initialized) {
      throw new Error(
        "Extension provider is not initialised, call init() first",
      );
    }
    return this.account ? this.account.address : "";
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  isConnected(): boolean {
    return Boolean(this.account.address);
  }

  getAccount(): IProviderAccount | null {
    return this.account;
  }

  setAccount(account: IProviderAccount): void {
    this.account = account;
  }

  async signTransaction(transaction: Transaction): Promise<Transaction> {
    this.ensureConnected();

    const signedTransactions = await this.signTransactions([transaction]);

    if (signedTransactions.length != 1) {
      throw new ErrCannotSignSingleTransaction();
    }

    return signedTransactions[0];
  }

  private ensureConnected() {
    if (!this.account.address) {
      throw new ErrAccountNotConnected();
    }
  }

  async signTransactions(transactions: Transaction[]): Promise<Transaction[]> {
    this.ensureConnected();

    const extensionResponse = await this.startBgrMsgChannel(
      Operation.SignTransactions,
      {
        from: this.account.address,
        transactions: transactions.map((transaction) =>
          transaction.toPlainObject(),
        ),
      },
    );

    try {
      const transactionsResponse = extensionResponse.map(
        (transaction: IPlainTransactionObject) =>
          Transaction.newFromPlainObject(transaction),
      );

      return transactionsResponse;
    } catch (error: any) {
      throw new Error(`Transaction canceled: ${error.message}.`);
    }
  }

  async signMessage(messageToSign: Message): Promise<Message> {
    this.ensureConnected();

    const data = {
      account: this.account.address,
      message: Buffer.from(messageToSign.data).toString(),
    };
    const extensionResponse = await this.startBgrMsgChannel(
      Operation.SignMessage,
      data,
    );
    const signatureHex = extensionResponse.signature;
    const signature = Buffer.from(signatureHex, "hex");

    return new Message({
      data: Buffer.from(messageToSign.data),
      address:
        messageToSign.address ?? Address.newFromBech32(this.account.address),
      signer: "extension",
      version: messageToSign.version,
      signature,
    });
  }

  cancelAction() {
    return this.startBgrMsgChannel(Operation.CancelAction, {});
  }

  private startBgrMsgChannel(
    operation: string,
    connectData: any,
  ): Promise<any> {
    return new Promise((resolve) => {
      const requestId = createRequestId();
      const responseType = getResponseType(operation);

      const eventHandler = (event: MessageEvent) => {
        if (!isFromContentScript(event)) {
          return;
        }

        const { type, requestId: responseRequestId, data } = event.data;

        const isLegacyResponse = !type && operation !== Operation.Connect;
        if (type !== responseType && !isLegacyResponse) {
          return;
        }

        if (responseRequestId != null && responseRequestId !== requestId) {
          return;
        }

        window.removeEventListener("message", eventHandler);

        if (operation === Operation.Connect && data && Boolean(data.address)) {
          this.account = data;
        }

        resolve(data);
      };

      window.addEventListener("message", eventHandler, false);

      window.postMessage(
        {
          target: INPAGE_TARGET,
          type: operation,
          data: connectData,
          requestId,
        },
        window.origin,
      );
    });
  }
}

const INPAGE_TARGET = "erdw-inpage";
const CONTENT_SCRIPT_TARGET = "erdw-contentScript";

const getResponseType = (operation: string) => `${operation}Response`;

const isFromContentScript = (event: MessageEvent) =>
  event.isTrusted &&
  event.source === window &&
  event.origin === window.location.origin &&
  event.data?.target === CONTENT_SCRIPT_TARGET;

const createRequestId = () => {
  const bytes = crypto.getRandomValues(new Uint8Array(16));

  return Array.from(bytes, (byte) => `0${byte.toString(16)}`.slice(-2)).join(
    "",
  );
};
