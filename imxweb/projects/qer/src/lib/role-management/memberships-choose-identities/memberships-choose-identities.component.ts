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

import { OverlayRef } from '@angular/cdk/overlay';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EuiLoadingService, EuiSidesheetRef } from '@elemental-ui/core';
import { ViewConfigData } from 'imx-api-qer';

import { CollectionLoadParameters, DataModel, DisplayColumns, EntitySchema, IClientProperty, TypedEntity, XOrigin } from 'imx-qbm-dbts';
import {
  AuthenticationService,
  buildAdditionalElementsString,
  DataSourceToolbarSettings,
  DataSourceToolbarViewConfig,
  ISessionState,
  SnackBarService,
} from 'qbm';
import { UserModelService } from '../../user/user-model.service';
import { ViewConfigService } from '../../view-config/view-config.service';
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

  public selection: TypedEntity[] = [];
  private dataModel: DataModel;
  private viewConfig: DataSourceToolbarViewConfig;
  private viewConfigPath = 'attestation/approve';
  private candidatesEntitySchema: EntitySchema;

  constructor(
    private readonly sidesheetRef: EuiSidesheetRef,
    private readonly identityService: IdentitiesService,
    private viewConfigService: ViewConfigService,
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
      this.viewConfig = await this.viewConfigService.getInitialDSTExtension(this.dataModel, this.viewConfigPath);
      this.candidatesEntitySchema = this.roleService.getMembershipEntitySchema('candidates');
    } finally {
      setTimeout(() => this.busyService.hide(overlayRef));
    }
    await this.navigate(true);
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

    const entity = this.dataManagementService.entityInteractive.GetEntity();
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
            membershipName: entity.GetDisplay(),
          },
        });

        await dialogRef.beforeClosed().toPromise();
      }

      if (notRequestableMemberships.length < this.selection.length) {
        // there is at least one membership added
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

  public async updateConfig(config: ViewConfigData): Promise<void> {
    await this.viewConfigService.putViewConfig(config);
    this.viewConfig = await this.viewConfigService.getDSTExtensionChanges(this.viewConfigPath);
    this.dstSettings.viewConfig = this.viewConfig;
  }

  public async deleteConfigById(id: string): Promise<void> {
    await this.viewConfigService.deleteViewConfig(id);
    this.viewConfig = await this.viewConfigService.getDSTExtensionChanges(this.viewConfigPath);
    this.dstSettings.viewConfig = this.viewConfig;
  }

  public getSubtitle(entity: any, properties: IClientProperty[]): string {
    return buildAdditionalElementsString(entity.GetEntity(), properties);
  }

  private async navigate(isInitialLoad: boolean = false): Promise<void> {
    this.busyService.show();

    try {
      this.dstSettings = {
        dataSource: isInitialLoad
          ? { totalCount: 0, Data: [] }
          : await this.roleService.getCandidates(this.dataManagementService.entityInteractive.GetEntity().GetKeys().join(','), {
              ...this.navigationState,
              // exclude candidate identities that already have an assignment request (XOrigin.Ordered)
              xorigin: XOrigin.Ordered,
            }),
        entitySchema: this.candidatesEntitySchema,
        navigationState: this.navigationState,
        displayedColumns: this.displayColumns,
        filters: this.dataModel.Filters,
        dataModel: this.dataModel,
        viewConfig: this.viewConfig,
      };
    } finally {
      this.busyService.hide();
    }
  }
}
