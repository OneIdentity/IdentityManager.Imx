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

import { Injectable } from '@angular/core';

export const HELPER_ALERT_KEY_PREFIX = 'helperAlertDismissed';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  public get lastUrl(): string { return localStorage.getItem(this.lastUrlKey); }
  public set lastUrl(value: string) {
    if (value) {
      localStorage.setItem(this.lastUrlKey, value);
    } else {
      localStorage.removeItem(this.lastUrlKey);
    }
  }
  private readonly lastUrlKey = 'lastRoute';

  public isHelperAlertDismissed(key: string): boolean {
    return sessionStorage.getItem(key) === 'true';
  }

  public storeHelperAlertDismissal(key: string): void {
    sessionStorage.setItem(key, 'true');
  }

  public storeProperties(key: string, values: string[]): void {
    if (values.length === 0) {
      sessionStorage.setItem(key, '');
    } else {
      sessionStorage.setItem(key, values.join('|'));
    }
  }

  public getProperties(key: string): string[] {
    const text = sessionStorage.getItem(key);
    if (text == null || text === '') {
      return [];
    }
    return text.split('|');
  }

  public removeKeys(...params: string[]): void {
    params.forEach(key => sessionStorage.removeItem(key));
  }
}
