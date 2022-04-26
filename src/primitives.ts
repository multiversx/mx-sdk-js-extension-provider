import { IAddress } from "./interface";
import { ISignature } from "./interface";

export class Address implements IAddress {
    private readonly value: string;

    public constructor(value: string) {
        this.value = value;
    }

    bech32(): string {
        return this.value;
    }
}

export class Signature implements ISignature {
    private readonly value: string;

    constructor(value: string) {
        this.value = value;
    }

    hex() {
        return this.value;
    }
}
