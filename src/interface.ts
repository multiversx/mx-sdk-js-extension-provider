export interface IDappProvider {
    init(): Promise<boolean>;
    login(options?: {callbackUrl?: string; token?: string; addressIndex?: number}): Promise<string>;
    logout(options?: {callbackUrl?: string}): Promise<boolean>;
    getAddress(): Promise<string>;
    isInitialized(): boolean;
    isConnected(): Promise<boolean>;
    sendTransaction(transaction: ITransaction, options?: {callbackUrl?: string}): Promise<ISignedTransaction>;
    signTransaction(transaction: ITransaction, options?: {callbackUrl?: string}): Promise<ISignedTransaction>;
    signTransactions(transaction: Array<ITransaction>, options?: {callbackUrl?: string}): Promise<Array<ISignedTransaction>>;
    signMessage(transaction: ISignableMessage, options?: {callbackUrl?: string}): Promise<ISignedMessage>;
}

export interface ITransaction {
    toPlainObject(): any;
}

export interface ISignedTransaction {
}

export interface ISignableMessage {
    message: Buffer;
}

export interface ISignedMessage {
}

export interface ITransactionFactory {
    fromPlainObject(obj: any): ISignedTransaction;
}

export interface ISignableMessageFactory {
    fromPlainObject(obj: any): ISignedMessage;
}
