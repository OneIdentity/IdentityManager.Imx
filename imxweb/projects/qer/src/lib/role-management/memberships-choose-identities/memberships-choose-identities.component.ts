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

import { OverlayRef } from '@angular/cdk/overlay';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EuiLoadingService, EuiSidesheetRef } from '@elemental-ui/core';

import { CollectionLoadParameters, DataModel, DisplayColumns, EntitySchema, IClientProperty, IEntity, TypedEntity, XOrigin } from 'imx-qbm-dbts';
import {
  AuthenticationService,
  buildAdditionalElementsString,
  DataSourceToolbarSettings,
  ISessionState,
  SnackBarService
} from 'qbm';
import { UserModelService } from '../../user/user-model.service';
import { DataManagementService } from '../data-management.service';
import { RoleService } from '../role.service';
import { IdentitiesService } from './identities.service';
import { NotRequestableMembershipsComponent } from './not-requestable-memberships/not-requestable-memberships.component';

@Component({
  selector: 'imx-memberships-choose-identities',
  templateUrl: './memberships-choose-identities.component.html',
  styleUrls: ['./memberships-choose-identities.component.scss', '../sidesheet.scss'],
})
export class MembershipsChooseIdentitiesComponent implements OnInit {
  public dstSettings: DataSourceToolbarSettings;
  public navigationState: CollectionLoadParameters = {};
  public entitySchema: EntitySchema;
  public DisplayColumns = DisplayColumns;
  public displayColumns: IClientProperty[];
  public sessionState: ISessionState;

  private selection: TypedEntity[];
  private dataModel: DataModel;
  private candidatesEntitySchema: EntitySchema;

  constructor(
    private readonly sidesheetRef: EuiSidesheetRef,
    private readonly identityService: IdentitiesService,
    private roleService: RoleService,
    private dataManagementService: DataManagementService,
    private snackbar: SnackBarService,
    private readonly userService: UserModelService,
    private readonly busyService: EuiLoadingService,
    private readonly authentication: AuthenticationService,
    private readonly dialogService: MatDialog
  ) {
    this.entitySchema = this.identityService.getSchema();
    this.displayColumns = [this.entitySchema.Columns[DisplayColumns.DISPLAY_PROPERTYNAME]];
    this.authentication.onSessionResponse.subscribe((sessionState: ISessionState) => (this.sessionState = sessionState));
  }

  public async ngOnInit(): Promise<void> {
    let overlayRef: OverlayRef;
    setTimeout(() => (overlayRef = this.busyService.show()));

    try {
      this.dataModel = await this.roleService.getCandidatesDataModel(this.dataManagementService.entityInteractive.GetEntity().GetKeys()[0]);
      this.candidatesEntitySchema = this.roleService.getMembershipEntitySchema('candidates');
    }
    finally {
      setTimeout(() => this.busyService.hide(overlayRef));
    }
    await this.navigate();
  }

  public onSelectionChanged(selection: TypedEntity[]): void {
    this.selection = selection;
  }

  public async onNavigationStateChanged(newState: CollectionLoadParameters): Promise<void> {
    if (newState) {
      this.navigationState = newState;
    }
    await this.navigate();
  }

  public async onSearch(keywords: string): Promise<void> {
    this.navigationState.StartIndex = 0;
    this.navigationState.search = keywords;
    await this.navigate();
  }

  public async onRequestMemberships(): Promise<void> {
    if (this.selection?.length === 0) {
      return;
    }

    const entity = this.dataManagementService.entityInteractive.GetEntity()
    this.busyService.show();
    try {
      const notRequestableMemberships = await this.identityService.addMemberships(
        this.roleService.ownershipInfo.TableName,
        this.selection,
        entity.GetColumn('XObjectKey').GetValue()
      );

      if (notRequestableMemberships.length > 0) {
        const dialogRef = this.dialogService.open(NotRequestableMembershipsComponent, {
          data: {
            notRequestableMemberships,
            entitySchema: this.entitySchema,
            membershipName: entity.GetDisplay()
          }
        });

        await dialogRef.beforeClosed().toPromise();
      }

      if (notRequestableMemberships.length < this.selection.length) { // there is at least one membership added
        await this.userService.reloadPendingItems();
        this.snackbar.open({
          key: '#LDS#The membership for "{0}" has been successfully added to the shopping cart.',
          parameters: [entity.GetDisplay()],
        });
      }
      this.sidesheetRef.close();
    } finally {
      this.busyService.hide();
    }
  }

  public getSubtitle(entity: any, properties: IClientProperty[]): string {
    return buildAdditionalElementsString(entity.GetEntity(), properties);
  }

  private async navigate(): Promise<void> {
    this.busyService.show();

    try {
      this.dstSettings = {
        dataSource: await this.roleService.getCandidates(
          this.dataManagementService.entityInteractive.GetEntity().GetKeys().join(','),
          {
            ...this.navigationState,
            // exclude candidate identities that already have an assignment request (XOrigin.Ordered)
            xorigin: XOrigin.Ordered
          }
        ),
        entitySchema: this.candidatesEntitySchema,
        navigationState: this.navigationState,
        displayedColumns: this.displayColumns,
        filters: this.dataModel.Filters,
        dataModel: this.dataModel,
        identifierForSessionStore: 'membership-choose-identities'
      };
    } finally {
      this.busyService.hide();
    }
  }
}
