import { IDappProvider, ISignableMessage, ISignableMessageFactory, ISignedMessage, ISignedTransaction, ITransaction, ITransactionFactory } from "./interface";
import { SignableMessageFactoryLocator, TransactionFactoryLocator } from "./locators";

declare global {
  interface Window {
    elrondWallet: { extensionId: string };
  }
}

interface IExtensionAccount {
  address: string;
  name?: string;
  signature?: string;
}

export class ExtensionProvider implements IDappProvider {
  public account: IExtensionAccount;
  private initialized: boolean = false;
  private static _instance: ExtensionProvider = new ExtensionProvider();
  
  private constructor() {
    if (ExtensionProvider._instance) {
      throw new Error(
        "Error: Instantiation failed: Use ExtensionProvider.getInstance() instead of new."
      );
    }
    this.account = { address: "" };
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
    if (window && window.elrondWallet) {
      this.initialized = true;
    }
    return this.initialized;
  }

  async login(
    options: {
      callbackUrl?: string;
      token?: string;
    } = {}
  ): Promise<string> {
    if (!this.initialized) {
      throw new Error(
        "Extension provider is not initialised, call init() first"
      );
    }
    const { token } = options;
    const data = token ? token : "";
    await this.startBgrMsgChannel("connect", data);
    return this.account.address;
  }

  async logout(): Promise<boolean> {
    if (!this.initialized) {
      throw new Error(
        "Extension provider is not initialised, call init() first"
      );
    }
    try {
      await this.startBgrMsgChannel("logout", this.account.address);
    } catch (error) {
      console.warn("Extension origin url is already cleared!", error);
    }

    return true;
  }

  async getAddress(): Promise<string> {
    if (!this.initialized) {
      throw new Error(
        "Extension provider is not initialised, call init() first"
      );
    }
    return this.account ? this.account.address : "";
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  async isConnected(): Promise<boolean> {
    return !!this.account;
  }

  async sendTransaction(transaction: ITransaction): Promise<ISignedTransaction> {
    const txResponse = await this.startBgrMsgChannel("sendTransactions", {
      from: this.account.address,
      transactions: [transaction.toPlainObject()],
    });

    return this.getTransactionFactory().fromPlainObject(txResponse[0]);
  }

  async signTransaction(transaction: ITransaction): Promise<ISignedTransaction> {
    const txResponse = await this.startBgrMsgChannel("signTransactions", {
      from: this.account.address,
      transactions: [transaction.toPlainObject()],
    });
    return this.getTransactionFactory().fromPlainObject(txResponse[0]);
  }

  async signTransactions(
    transactions: Array<ITransaction>
  ): Promise<Array<ITransaction>> {
    transactions = transactions.map((transaction) =>
      transaction.toPlainObject()
    );
    let txResponse = await this.startBgrMsgChannel("signTransactions", {
      from: this.account.address,
      transactions: transactions,
    });
    try {
      // TODO: Find out whether transaction.applySignature() is better suited here,
      // It seems that the extension only sets "sender" and "signature" 
      // (version, nonce, chainID, gasLimit etc. do not seem to ever be overridden).
      // If so, we don't need factories here.
      txResponse = txResponse.map((transaction: any) =>
        this.getTransactionFactory().fromPlainObject(transaction)
      );
    } catch (error) {
      throw new Error("Transaction canceled.");
    }

    return txResponse;
  }

  async signMessage(message: ISignableMessage): Promise<ISignedMessage> {
    const data = {
      account: this.account.address,
      // TODO: Why not message.serializeForSigningRaw()?
      message: message.message.toString(),
    };
    const signResponse = await this.startBgrMsgChannel("signMessage", data);
    // TODO: Find out whether message.applySignature() is better suited here.
    // If so, we don't need factories here.
    const signedMsg = this.getMessageFactory().fromPlainObject({
      // TODO: Why not signResponse.address?
      address: data.account,
      message: Buffer.from(signResponse.message),
      signature: signResponse.signature
    });

    return signedMsg;
  }

  cancelAction() {
    return this.startBgrMsgChannel("cancelAction", {});
  }

  private startBgrMsgChannel(
    operation: string,
    connectData: any
  ): Promise<any> {
    return new Promise((resolve) => {
      window.postMessage(
        {
          target: "erdw-inpage",
          type: operation,
          data: connectData,
        },
        window.origin
      );

      const eventHandler = (event: any) => {
        if (event.isTrusted && event.data.target === "erdw-contentScript") {
          if (event.data.type === "connectResponse") {
            this.account = event.data.data;
            window.removeEventListener("message", eventHandler);
            resolve(event.data.data);
          } else {
            window.removeEventListener("message", eventHandler);
            resolve(event.data.data);
          }
        }
      };
      window.addEventListener("message", eventHandler, false);
    });
  }

  private getTransactionFactory(): ITransactionFactory {
    return TransactionFactoryLocator.getTransactionFactory();
  }

  private getMessageFactory(): ISignableMessageFactory {
    return SignableMessageFactoryLocator.getMessageFactory();
  }
}
