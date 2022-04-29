export class DummyMessage {
    address = null;
    message = Buffer.from("");
    signature = null;

    constructor(init) {
        Object.assign(this, init);
    }

    applySignature(signature, signedBy) {
        console.log("applySignature()", signature.hex(), signedBy.bech32());
        this.signature = signature;
        this.address = signedBy;
    }
}
