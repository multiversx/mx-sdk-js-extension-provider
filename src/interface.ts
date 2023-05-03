export interface IAddress {
    bech32(): string;
}

export interface ITransactionVersion {
    valueOf(): number;
}

export interface ITransactionOptions {
    valueOf(): number;
}

export interface ITransaction {
    getVersion(): ITransactionVersion;
    setVersion(version: ITransactionVersion): void;
    getOptions(): ITransactionOptions;
    setOptions(options: ITransactionOptions): void;
    getGuardian(): IAddress | null;
    setGuardian(guardian: IAddress): void;

    toPlainObject(): any;
    applySignature(signature: Buffer): void;
    applyGuardianSignature(signature: Buffer): void;
}

export interface ISignableMessage {
    message: Buffer;
    applySignature(signature: Buffer): void;
}
