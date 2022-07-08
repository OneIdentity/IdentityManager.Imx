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
 * Copyright 2021 One Identity LLC.
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

import { Component, Inject, Injector, OnInit, ViewChild } from '@angular/core';
import { EuiSidesheetRef, EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { OwnershipInformation } from 'imx-api-qer';
import { IEntity } from 'imx-qbm-dbts';
import { RoleService } from '../role.service';
import { ConfirmationService, ExtService, TabControlHelper, TabItem } from 'qbm';
import { MatTabGroup } from '@angular/material/tabs';

@Component({
  selector: 'imx-role-detail',
  templateUrl: './role-detail.component.html',
  styleUrls: ['./role-detail.component.scss'],
})
export class RoleDetailComponent implements OnInit {
  @ViewChild('tabs') public tabs: MatTabGroup;
  public dynamicTabs: TabItem[] = [];
  public parameters: { tablename: string; entity: IEntity };

  private canClose = true;
  private autoMembershipsValid = true;
  private confirmIsOpen = false;

  constructor(
    @Inject(EUI_SIDESHEET_DATA)
    public data: {
      entity: IEntity;
      isAdmin: boolean;
      ownershipInfo: OwnershipInformation;
      editableFields: string[];
    },
    private readonly sidesheetRef: EuiSidesheetRef,
    private readonly roleService: RoleService,
    private readonly membershipService: RoleService,
    private readonly confirm: ConfirmationService,
    private readonly tabService: ExtService
  ) {

    this.parameters = {
      tablename: this.data.ownershipInfo.TableName,
      entity: this.data.entity
    };
    this.roleService.dataDirtySubject.subscribe((flag) => {
      this.canClose = !flag;
    });
    this.roleService.autoMembershipDirty$.subscribe((flag) => {
      this.autoMembershipsValid = !flag;
    })
    this.sidesheetRef.closeClicked().subscribe(async (result) => {
      if (this.confirmIsOpen) {
        return;
      }
      if (!this.canClose || !this.autoMembershipsValid) {
        this.confirmIsOpen = true;
        const close = await this.confirm.confirmLeaveWithUnsavedChanges(null, null, true);
        this.confirmIsOpen = false;
        if (close) {
          this.sidesheetRef.close();
        }
      } else {
        this.sidesheetRef.close(result);
      }
    });
  }

  public async ngOnInit(): Promise<void> {
    /**
     * Resolve an issue where the mat-tab navigation arrows could appear on first load
     */
    setTimeout(() => {
      TabControlHelper.triggerResizeEvent();
    });
    this.dynamicTabs = (await this.tabService.getFittingComponents<TabItem>('roleOverview',
      (ext) =>  ext.inputData.checkVisibility(this.parameters)))
      .sort((tab1: TabItem, tab2: TabItem) => tab1.sortOrder - tab2.sortOrder);

  }

  public canHaveMemberships(): boolean {
    return this.membershipService.canHaveMemberships(this.data.ownershipInfo.TableName);
  }

  public canHaveEntitlements(): boolean {
    return this.membershipService.canHaveEntitlements(this.data.ownershipInfo.TableName);
  }
}
