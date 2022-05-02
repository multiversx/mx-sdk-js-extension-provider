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
