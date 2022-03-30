export interface IDappProvider {
    init(): Promise<boolean>;
    login(options?: {callbackUrl?: string; token?: string; addressIndex?: number}): Promise<string>;
    logout(options?: {callbackUrl?: string}): Promise<boolean>;
    getAddress(): Promise<string>;
    isInitialized(): boolean;
    isConnected(): Promise<boolean>;
    sendTransaction(transaction: ITransaction, options?: {callbackUrl?: string}): Promise<ITransaction>;
    signTransaction(transaction: ITransaction, options?: {callbackUrl?: string}): Promise<ITransaction>;
    signTransactions(transaction: Array<ITransaction>, options?: {callbackUrl?: string}): Promise<Array<ITransaction>>;
    signMessage(transaction: ISignableMessage, options?: {callbackUrl?: string}): Promise<ISignableMessage>;
}

export interface ITransaction {
    toPlainObject(): any;
}

export interface ISignableMessage {
    message: Buffer;
}

export interface ITransactionFactory {
    fromPlainObject(obj: any): ITransaction;
}

export interface ISignableMessageFactory {
    fromPlainObject(obj: any): ISignableMessage;
}
