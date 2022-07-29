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

import { Injectable } from '@angular/core';
import { EuiLoadingService } from '@elemental-ui/core';

import { ArcApiService } from '../../services/arc-api-client.service';

@Injectable({
  providedIn: 'root'
})
export class DeleteDataService {

  constructor(        
    private readonly loader: EuiLoadingService, 
    private readonly arcClient: ArcApiService
  ) { }

  public async deleteData(domaintype: string, authorityId: string): Promise<void> {
    return this.handlePromiseLoader(this.arcClient.client.portal_targetsystem_delete(domaintype, authorityId));
  }

  private handlePromiseLoader(promise: Promise<any>): Promise<any> {
    const loaderRef = this.loader.show();
    return promise.finally(() => this.loader.hide(loaderRef));
  }

}
