/**
 * The base class for exceptions (errors).
 */
 export class Err extends Error {
    inner: Error | undefined = undefined;

    public constructor(message: string, inner?: Error) {
        super(message);
        this.inner = inner;
    }
}

/**
 * Signals an incorrect setup.
 */
export class ErrIncorrectSetup extends Err {
    public constructor(message: string) {
        super(`Incorrect setup: ${message}`);
    }
}
