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

import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { EuiLoadingService, EuiSidesheetRef } from '@elemental-ui/core';
import { IEntity } from 'imx-qbm-dbts';
import { RoleService } from '../role.service';
import { ConfirmationService, ExtService, TabItem } from 'qbm';
import { MatTabGroup } from '@angular/material/tabs';
import { Subscription } from 'rxjs';
import { DataManagementService } from '../data-management.service';

@Component({
  selector: 'imx-role-detail',
  templateUrl: './role-detail.component.html',
  styleUrls: ['./role-detail.component.scss'],
})
export class RoleDetailComponent implements OnInit, OnDestroy {
  @ViewChild('tabs') public tabs: MatTabGroup;
  public dynamicTabs: TabItem[] = [];
  public parameters: { tablename: string; entity: IEntity };
  public subscriptions$: Subscription[] = [];

  private defaultClickHandler: Function;
  private canClose = true;
  private autoMembershipsValid = true;
  private confirmIsOpen = false;

  constructor(
    private busyService: EuiLoadingService,
    private readonly sidesheetRef: EuiSidesheetRef,
    private readonly roleService: RoleService,
    private dataManagementService: DataManagementService,
    private readonly confirm: ConfirmationService,
    private readonly tabService: ExtService
  ) {
    this.parameters = {
      tablename: this.roleService.ownershipInfo.TableName,
      entity: this.dataManagementService.entityInteractive.GetEntity(),
    };
    this.dataManagementService.mainDataDirty$.subscribe((flag) => {
      this.canClose = !flag;
    });
    this.dataManagementService.autoMembershipDirty$.subscribe((flag) => {
      this.autoMembershipsValid = !flag;
    });
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

  public get objectType(): string {
    return this.dataManagementService.entityInteractive.GetEntity().TypeName;
  }

  public get objectUid(): string {
    return this.dataManagementService.entityInteractive.GetEntity().GetKeys().join(',');
  }

  public async ngOnInit(): Promise<void> {
    /**
     * Resolve an issue where the mat-tab navigation arrows could appear on first load
     */
    this.subscriptions$.push(
      this.sidesheetRef.componentInstance.onOpen().subscribe(() => {
        // Recalculate header
        this.tabs.updatePagination();
      })
    );
    this.dynamicTabs = (
      await this.tabService.getFittingComponents<TabItem>('roleOverview', (ext) => ext.inputData.checkVisibility(this.parameters))
    ).sort((tab1: TabItem, tab2: TabItem) => tab1.sortOrder - tab2.sortOrder);

    // implement tab checking logic
    this.defaultClickHandler = this.tabs._handleClick;
    this.tabs._handleClick = async (tab, header, index) => {
      const isNewTab = index !== this.tabs.selectedIndex;
      if (!isNewTab) {
        return;
      }
      if (this.leavingWithDirty()) {
        if (await this.confirm.confirmLeaveWithUnsavedChanges(null, null, true)) {
          // Need to reload the interactive entity to discard old data
          this.busyService.show();
          try {
            this.dataManagementService.autoMembershipDirty(false);
            this.dataManagementService.mainDataDirty(false);
            await this.dataManagementService.setInteractive();
          } finally {
            this.busyService.hide();
          }
        }
      }
      this.defaultClickHandler.apply(this.tabs, [tab, header, index]);
    };
  }

  public ngOnDestroy(): void {
    this.subscriptions$.map((sub) => sub.unsubscribe());
  }

  public leavingWithDirty(): boolean {
    const leavingMainWithDirty = this.tabs.selectedIndex === 0 && !this.canClose;
    const leavingMemWithDirty = this.tabs.selectedIndex === 1 && !this.autoMembershipsValid;
    return leavingMainWithDirty || leavingMemWithDirty;
  }

  public async checkConfirmation(): Promise<boolean> {
    // Check if we leave maindata or membership with dirty data, assumes position of 0 and 1 resp.
    const leavingMainWithDirty = this.tabs.selectedIndex === 0 && !this.canClose;
    const leavingMemWithDirty = this.tabs.selectedIndex === 1 && !this.autoMembershipsValid;
    let resp = true;
    if (leavingMainWithDirty || leavingMemWithDirty) {
      resp = await this.confirm.confirmLeaveWithUnsavedChanges(null, null, true);
    }
    return resp;
  }

  public canHaveMemberships(): boolean {
    return this.roleService.canHaveMemberships();
  }

  public canHaveEntitlements(): boolean {
    return this.roleService.canHaveEntitlements();
  }
}
