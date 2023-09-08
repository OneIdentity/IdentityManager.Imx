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
 * Copyright 2023 One Identity LLC.
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

import { Injectable } from "@angular/core";
import { CachedPromise } from "imx-qbm-dbts";
import { Subscription } from "rxjs";
import { AuthenticationService } from "../authentication/authentication.service";

/** Provides caching for promises. */
@Injectable({
  providedIn: 'root'
})
export class CacheService {

  constructor(private readonly authService: AuthenticationService) {
  }

  private defaultOptions: CacheOptions = {
    flushOnAuthentication: true
  };

  /** Returns a new cached promise. The cache options can be configured
   * in the `opts` object.
   * @param func Construction function for a new promise.
   */
  public buildCache<T>(func: () => Promise<T>, opts?: CacheOptions): CachedPromise<T> {

    var o = { ...this.defaultOptions, opts };

    var subscription: Subscription;
    const cachedPromise = new CachedPromise(func, () => { subscription?.unsubscribe(); });
    
    if (o.flushOnAuthentication) {
      subscription = this.authService.onSessionResponse.subscribe(() => cachedPromise.reset());
    }

    return cachedPromise;
  }
}

export interface CacheOptions {
  /** Sets whether the cache will be flushed on authentication events, i.e.
   * when the user logs on or off.
   */
  flushOnAuthentication?: boolean
}
