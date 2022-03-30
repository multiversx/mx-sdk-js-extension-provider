import { ExtensionProvider } from "../out/extensionProvider";
import { TransactionFactoryLocator, SignableMessageFactoryLocator } from "../out/locators";

export async function main() {
    let provider = ExtensionProvider.getInstance();
    await provider.init();
    let address = await provider.login();
    console.log("Address:", address);

    // Setup transaction factory (dependency of extension provider).
    TransactionFactoryLocator.setTransactionFactory({
        fromPlainObject: function(obj) {
            console.log("transactionFactory.fromPlainObject()");
            console.log(obj);
            // In production, if using erdjs, a Transaction object could be created & returned.
            return obj;
        }
    });

    // Setup message factory (dependency of extension provider).
    SignableMessageFactoryLocator.setMessageFactory({
        fromPlainObject: function(obj) {
            console.log("messageFactory.fromPlainObject()");
            console.log(obj);
            // In production, if using erdjs, a SignableMessage object could be created & returned.
            return obj;
        }
    });

    // Sign a transaction
    let firstTransaction = await provider.signTransaction({
        toPlainObject: function() {
            return {
                nonce: 42,
                value: "1",
                receiver: "erd1uv40ahysflse896x4ktnh6ecx43u7cmy9wnxnvcyp7deg299a4sq6vaywa",
                gasPrice: 1000000000,
                gasLimit: 50000,
                data: "",
                chainID: "T"
            };
        }
    });

    console.log("First transaction, upon signing:");
    console.log(firstTransaction);

    // Sign & broadcast another transaction.
    // This should fail (bad nonce etc.)
    await provider.sendTransaction({
        toPlainObject: function() {
            return {
                nonce: 43,
                value: "1",
                receiver: "erd1uv40ahysflse896x4ktnh6ecx43u7cmy9wnxnvcyp7deg299a4sq6vaywa",
                gasPrice: 1000000000,
                gasLimit: 200000,
                data: Buffer.from("hello").toString("base64"),
                chainID: "T"
            };
        }
    });

    // Sign a message.
    let message = await provider.signMessage({
        message: "hello"
    });

    console.log("Message, upon signing:");
    console.log(message);
}
