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

import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EuiLoadingService, EuiSidesheetRef, EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { OwnershipInformation } from 'imx-api-qer';
import { CollectionLoadParameters, DisplayColumns, EntitySchema, IClientProperty, IEntity, TypedEntity, XOrigin } from 'imx-qbm-dbts';
import { AuthenticationService, DataSourceToolbarFilter, DataSourceToolbarSettings, ISessionState, SnackBarService } from 'qbm';
import { UserModelService } from '../../user/user-model.service';
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
  public filterOptions: DataSourceToolbarFilter[] = [];
  public sessionState: ISessionState;

  private selection: TypedEntity[];

  constructor(
    @Inject(EUI_SIDESHEET_DATA)
    public data: {
      id: string;
      entity: IEntity;
      ownershipInfo: OwnershipInformation;
    },
    private readonly sidesheetRef: EuiSidesheetRef,
    private readonly identityService: IdentitiesService,
    private membershipService: RoleService,
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
    this.filterOptions = await this.identityService.getFilterOptions();
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

    this.busyService.show();

    try {
      const inactiveIdentities = await this.identityService.addMemberships(
        this.data.ownershipInfo,
        this.selection,
        this.data.entity.GetColumn('XObjectKey').GetValue()
      );

      if (inactiveIdentities.length > 0) {
        const dialogRef = this.dialogService.open(NotRequestableMembershipsComponent, {
          data: {
            inactiveIdentities,
            entitySchema: this.entitySchema,
            membershipName: this.data.entity.GetDisplay()
          }
        });

        await dialogRef.beforeClosed().toPromise();
      }

      if (inactiveIdentities.length < this.selection.length) { // there is at least one membership added
        await this.userService.reloadPendingItems();
        this.snackbar.open({
          key: '#LDS#The membership for "{0}" has been successfully added to the shopping cart.',
          parameters: [this.data.entity.GetColumn('DepartmentName').GetDisplayValue()],
        });
      }
      this.sidesheetRef.close();
    } finally {
      this.busyService.hide();
    }
  }

  private async navigate(): Promise<void> {
    this.busyService.show();
    try {
      this.dstSettings = {
        dataSource: await this.membershipService.getCandidates(
          this.data.ownershipInfo,
          this.data.entity.GetKeys()[0],
          {
            ...this.navigationState,

            // exclude candidate identities that already have an assignment request (XOrigin.Ordered)
            xorigin: XOrigin.Ordered
          }
        ),
        entitySchema: this.entitySchema,
        navigationState: this.navigationState,
        displayedColumns: this.displayColumns,
        filters: this.filterOptions,
      };
    } finally {
      this.busyService.hide();
    }
  }
}
