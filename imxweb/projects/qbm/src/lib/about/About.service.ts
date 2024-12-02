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
 * Copyright 2024 One Identity LLC.
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

import { Injectable, OnDestroy } from '@angular/core';

import { AdminSysteminfoThirdparty } from '@imx-modules/imx-api-qbm';
import { CollectionLoadParameters, EntitySchema, ExtendedTypedEntityCollection, TypedEntity } from '@imx-modules/imx-qbm-dbts';

// Create a more general type from either admin or ops since it is available in qbm - use this in qer later
export type SysteminfoThirdparty = { [K in keyof AdminSysteminfoThirdparty]: AdminSysteminfoThirdparty[K] } & TypedEntity;

/**
 * Abstract implementation for getting portal specific metadata.
 */
@Injectable()
export abstract class AboutService implements OnDestroy {
  protected abortController: AbortController;
  constructor() {
    this.abortController = new AbortController();
  }

  ngOnDestroy(): void {
    this.abortCall();
  }

  /**
   * Handles aborting any current requests managed by this service.
   */
  public abortCall(): void {
    this.abortController.abort();
    this.abortController = new AbortController();
  }

  /**
   * Abstract getter for exposing the entity schema via the service.
   */
  abstract get EntitySchema(): EntitySchema;

  /**
   * Abstract method for getting data from the server
   * @param parameters Additional request parameters for the method
   */
  abstract get(
    parameters?: CollectionLoadParameters,
  ): Promise<ExtendedTypedEntityCollection<SysteminfoThirdparty, unknown> | null | undefined>;
}
