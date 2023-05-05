export class CachedPromise<T>
{
    constructor(private readonly promiseFactory: () => Promise<T>,
        private readonly unsubscribeFunc?: () => void) { }

    private promise: Promise<T>;

    /** Returns the (possibly cached) promise. */
    public get(): Promise<T> {
        if (!this.promise)
            this.promise = this.promiseFactory();

        // retry the next time
        this.promise.catch(_ => { this.promise = null; });
        return this.promise;
    }

    /** Flushes this cache. */
    public reset() {
        this.promise = null;
    }

    /** Unsubscribes from events that flush this cache. */
    unsubscribe() {
        if (this.unsubscribeFunc) {
            this.unsubscribeFunc();
        }
    }
}
