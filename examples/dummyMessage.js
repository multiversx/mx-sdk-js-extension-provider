export class DummyMessage {
    address = null;
    message = Buffer.from("");
    signature = null;

    constructor(init) {
        Object.assign(this, init);
    }

    applySignature(signature, signedBy) {
        this.signature = signature.hex();
        this.address = signedBy.bech32();
        console.log("applySignature()", this.signature, this.signedBy);
    }
}
