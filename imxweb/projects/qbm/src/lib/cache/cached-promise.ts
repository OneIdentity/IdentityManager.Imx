/*
 * ONE IDENTITY LLC. PROPRIETARY INFORMATION
 *
 * This software is confidential.  One Identity, LLC. or one of its affiliates or
 * subsidiaries, has supplied this software to you under terms of a
 * license agreement, nondisclosure agreement or both.
 *
 * You may not copy, disclose, or use this software except in accordance with
 * those terms.
 *
 *
 * Copyright 2022 One Identity LLC.
 * ALL RIGHTS RESERVED.
 *
 * ONE IDENTITY LLC. MAKES NO REPRESENTATIONS OR
 * WARRANTIES ABOUT THE SUITABILITY OF THE SOFTWARE,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
 * TO THE IMPLIED WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE, OR
 * NON-INFRINGEMENT.  ONE IDENTITY LLC. SHALL NOT BE
 * LIABLE FOR ANY DAMAGES SUFFERED BY LICENSEE
 * AS A RESULT OF USING, MODIFYING OR DISTRIBUTING
 * THIS SOFTWARE OR ITS DERIVATIVES.
 *
 */

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
