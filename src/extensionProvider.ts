import { ISignableMessage, ITransaction } from "./interface";
import { Address, Signature } from "./primitives";
import { Operation } from "./operation";
import { ErrCannotSignSingleTransaction } from "./errors";

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

export class ExtensionProvider {
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
    await this.startBgrMsgChannel(Operation.Connect, data);
    return this.account.address;
  }

  async logout(): Promise<boolean> {
    if (!this.initialized) {
      throw new Error(
        "Extension provider is not initialised, call init() first"
      );
    }
    try {
      await this.startBgrMsgChannel(Operation.Logout, this.account.address);
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

  async signTransaction<T extends ITransaction>(transaction: T): Promise<T> {
    const signedTransactions = await this.signTransactions([transaction]);
    
    if (signedTransactions.length != 1) {
      throw new ErrCannotSignSingleTransaction();
    }

    return signedTransactions[0];
  }

  async signTransactions<T extends ITransaction>(transactions: T[]): Promise<T[]> {
    const extensionResponse = await this.startBgrMsgChannel(Operation.SignTransactions, {
      from: this.account.address,
      transactions: transactions.map(transaction => transaction.toPlainObject()),
    });

    try {
      for (let i = 0; i < transactions.length; i++) {
        const transaction = transactions[i];
        const plainSignedTransaction = extensionResponse[i];

        transaction.applySignature(new Signature(plainSignedTransaction.signature), new Address(this.account.address));
      }

      return transactions;
    } catch (error: any) {
      throw new Error(`Transaction canceled: ${error.message}.`);
    }
  }

  async signMessage<T extends ISignableMessage>(message: T): Promise<T> {
    const data = {
      account: this.account.address,
      message: message.message.toString()
    };
    const extensionResponse = await this.startBgrMsgChannel(Operation.SignMessage, data);
    message.applySignature(new Signature(extensionResponse.signature), new Address(this.account.address));
    return message;
  }

  cancelAction() {
    return this.startBgrMsgChannel(Operation.CancelAction, {});
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
            if(event.data.data && Boolean(event.data.data.address)) {
              this.account = event.data.data
            }
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
}
