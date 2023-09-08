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
import { Router } from '@angular/router';

import { DbObjectKey } from 'imx-qbm-dbts';

/**
 * Service for navigation between elements of an object sheet.
 * 
 * @deprecated This service is deprecated and will be removed in a future version.
 */
@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private lastKnownObjectKey: DbObjectKey;

  constructor(
    private readonly router: Router) { }

  /**
   * Navigate to the given location and stores the object key if present.
   */
  public navigate(routeCommands: any[], objectKey?: DbObjectKey): void {
    if (objectKey) {
      this.lastKnownObjectKey = objectKey;
    }

    this.router.navigate(routeCommands);
  }

  /**
   * Returns the stores object key.
   */
  public getLastKnownObjectKey(): DbObjectKey {
    return this.lastKnownObjectKey;
  }
}
