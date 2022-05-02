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
            data: Buffer.from(this.data).toString("base64"),
            chainID: this.chainID,
            version: this.version,
            options: this.options
        };
    }

    applySignature(signature, signedBy) {
        this.signature = signature.hex();
        this.address = signedBy.bech32();
        console.log("applySignature()", this.signature, this.signedBy);
    }
}
