export class DummyTransaction {
    nonce = 0;
    value = "";
    receiver = null;
    sender = null;
    gasPrice = 0;
    gasLimit = 0;
    data = "";
    chainID = "";
    version = 0;
    options = undefined;
    signature = null;

    constructor(init) {
        Object.assign(this, init);
    }

    toPlainObject() {
        return {
            nonce: this.nonce,
            value: this.value,
            receiver: this.receiver.bech32(),
            gasPrice: this.gasPrice,
            gasLimit: this.gasLimit,
            data: this.data,
            chainID: this.chainID,
            version: this.version,
            options: this.options
        };
    }

    applySignature(signature, signedBy) {
        console.log("applySignature()", signature.hex(), signedBy.bech32());
        this.signature = signature;
        this.sender = signedBy;
    }
}
