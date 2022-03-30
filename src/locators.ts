import { ErrIncorrectSetup } from "./errors";
import { ISignableMessageFactory, ITransactionFactory } from "./interface";

export class TransactionFactoryLocator {
    private static factory: ITransactionFactory;

    static setTransactionFactory(factory: ITransactionFactory) {
        this.factory = factory;
    }

    static getTransactionFactory() {
        if (!this.factory) {
            throw new ErrIncorrectSetup("[ITransactionFactory] isn't set on [TransactionFactoryLocator]");
        }

        return this.factory;
    }
}

export class SignableMessageFactoryLocator {
    private static factory: ISignableMessageFactory;

    static setMessageFactory(factory: ISignableMessageFactory) {
        this.factory = factory;
    }

    static getMessageFactory() {
        if (!this.factory) {
            throw new ErrIncorrectSetup("[ISignableMessageFactory] isn't set on [SignableMessageFactoryLocator]");
        }

        return this.factory;
    }
}
