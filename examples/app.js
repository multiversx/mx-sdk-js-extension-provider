import assert from "assert";
import { ExtensionProvider } from "../out/extensionProvider";
import { Address } from "../out/primitives";

export async function login() {
    let provider = ExtensionProvider.getInstance();
    await provider.init();
    let address = await provider.login();
    console.log("Address:", address);
}

export async function signTransactions() {
    let provider = ExtensionProvider.getInstance();

    let firstTransaction = new DummyTransaction({
        nonce: 42,
        value: "1",
        receiver: new Address("erd1uv40ahysflse896x4ktnh6ecx43u7cmy9wnxnvcyp7deg299a4sq6vaywa"),
        gasPrice: 1000000000,
        gasLimit: 50000,
        data: "",
        chainID: "T",
        version: 1
    });

    let firstTransactionSigned = await provider.signTransaction(firstTransaction);

    assert(firstTransaction === firstTransactionSigned, "The extension provider should return the same object passed as input");
    console.log("First transaction, upon signing:");
    console.log(firstTransaction);
}

export async function signMessages() {
    let provider = ExtensionProvider.getInstance();

    let message = new DummyMessage({
        message: Buffer.from("hello")
    });
    let messageSigned = await provider.signMessage(message);

    assert(message === messageSigned, "The extension provider should return the same object passed as input");
    console.log("Message, upon signing:");
    console.log(messageSigned);
}

class DummyTransaction {
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

class DummyMessage {
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
