import { Injectable } from "@angular/core";

import { Subscription } from "rxjs";
import { AuthenticationService } from "../authentication/authentication.service";
import { CachedPromise } from "./cached-promise";

/** Provides caching for promises. */
@Injectable()
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
    const cachedPromise = new CachedPromise(func, () => { subscription?.unsubscribe(); });
    var subscription: Subscription;
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
