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

import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { QamApiService } from '../../qam-api-client.service';
import { AssignedResourceAccessData, PortalDgeResources, ResourceAccessData } from '../../TypedClient';
import { BusyService } from 'qbm';
import { Subscription } from 'rxjs';

@Component({
  templateUrl: './dug-access.component.html',
  styleUrls: ['./dug-access.component.scss'],
  selector: 'imx-dge-access',
})
export class DugAccessComponent implements OnInit, OnDestroy {
  @Input() public dug: PortalDgeResources;
  @Input() public IsReadOnly: boolean = false;

  public isShowEffectivePermissions: boolean = false;

  public trusteeTypes: { [id: number]: string };

  /** assigned access permissions */
  public assigned: AssignedResourceAccessData;

  /** effective access permissions */
  public data: ResourceAccessData;

  public isLoading: boolean = false;

  public busyService = new BusyService();
  private busySubscription: Subscription;

  constructor(
    private readonly api: QamApiService,
    private readonly changeDetector: ChangeDetectorRef,
  ) {
    this.busySubscription = this.busyService.busyStateChanged.subscribe((state: boolean) => {
      this.isLoading = state;
      this.changeDetector.detectChanges();
    });
  }

  public ngOnDestroy(): void {
    this.busySubscription?.unsubscribe();
  }

  public async ngOnInit() {
    const isBusy = this.busyService.beginBusy();
    try {
      const uidDug = this.dug.GetEntity().GetKeys()[0];
      this.trusteeTypes = await this.api.getTrusteeTypes();
      this.data = await this.api.client.portal_dge_resources_access_get(uidDug);
      this.assigned = await this.api.client.portal_dge_resources_trusteeandpolicyrightset_get(uidDug);
    } finally {
      isBusy.endBusy();
    }
  }


  public ldsAssignedAccess =
    '#LDS#Access permissions are assigned to the following accounts and groups. If the access permissions are not correct, you can request a modification.';
}
