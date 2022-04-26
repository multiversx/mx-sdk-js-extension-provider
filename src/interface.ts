export interface IDappProvider {
    init(): Promise<boolean>;
    login(options?: {callbackUrl?: string; token?: string; addressIndex?: number}): Promise<string>;
    logout(options?: {callbackUrl?: string}): Promise<boolean>;
    getAddress(): Promise<string>;
    isInitialized(): boolean;
    isConnected(): Promise<boolean>;
    sendTransaction<T extends ITransaction>(transaction: T, options?: {callbackUrl?: string}): Promise<T>;
    signTransaction<T extends ITransaction>(transaction: T, options?: {callbackUrl?: string}): Promise<T>;
    signTransactions<T extends ITransaction>(transaction: Array<T>, options?: {callbackUrl?: string}): Promise<Array<T>>;
    signMessage<T extends ISignableMessage>(message: T, options?: {callbackUrl?: string}): Promise<T>;
}

export interface ISignature {
    hex(): string;
}

export interface IAddress {
    bech32(): string;
}

export interface ITransaction {
    toPlainObject(): any;
    applySignature(signature: ISignature, signedBy: IAddress): void;
}

export interface ISignableMessage {
    message: Buffer;
    applySignature(signature: ISignature, signedBy: IAddress): void;
}
