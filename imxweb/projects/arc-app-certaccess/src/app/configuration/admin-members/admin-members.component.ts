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

import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { Subscription } from 'rxjs';

import { PortalAdminApplicationrole, PortalAdminApplicationroleMembers } from 'imx-api-qer';
import { CollectionLoadParameters, DisplayColumns, EntitySchema, TypedEntity } from 'imx-qbm-dbts';
import { AuthenticationService, DataSourceToolbarSettings, DataTableComponent, HELPER_ALERT_KEY_PREFIX, ISessionState, SnackBarService, StorageService } from 'qbm';
import { AdminMembersService } from './admin-members.service';
import { RequestsEntitySelectorComponent } from '../requests-selector/requests-entity-selector.component';

const helperAlertKey = `${HELPER_ALERT_KEY_PREFIX}_adminMembers`;

@Component({
  selector: 'imx-admin-members',
  templateUrl: './admin-members.component.html',
  styleUrls: ['./admin-members.component.scss']
})
export class AdminMembersComponent implements OnInit, OnDestroy {

  public get showHelperAlert(): boolean {
    return !this.storageService.isHelperAlertDismissed(helperAlertKey);
  }

  public dstSettings: DataSourceToolbarSettings;

  public userIsMember: boolean;

  public selectedMembers: PortalAdminApplicationroleMembers[];

  public role: {
    uid: string;
    displayLong: string;
    description: string;
  };

  public readonly status = {
    enabled: (item: PortalAdminApplicationroleMembers): boolean => {
      return item.XOrigin?.value === 1;
    }
  };

  @ViewChild(DataTableComponent) private table: DataTableComponent<TypedEntity>;

  private readonly entitySchema: EntitySchema;
  private readonly subscriptions: Subscription[] = [];

  constructor(
    @Inject(EUI_SIDESHEET_DATA) data: { role: PortalAdminApplicationrole; },
    private readonly admins: AdminMembersService,
    private readonly storageService: StorageService,
    private readonly snackbar: SnackBarService,
    private readonly dialog: MatDialog,
    authentication: AuthenticationService
  ) {
    this.entitySchema = this.admins.adminApplicationRoleMembersSchema;
    this.role = {
      uid: data.role.GetEntity().GetKeys().join(),
      displayLong: data.role.GetEntity().GetDisplayLong(),
      description: data.role.Description.Column.GetDisplayValue()
    };

    this.subscriptions.push(authentication.onSessionResponse.subscribe(async (sessionState: ISessionState) =>
      this.userIsMember = await this.admins.userIsMember(this.role.uid, sessionState)
    ));
  }

  public async ngOnInit(): Promise<void> {
    return this.getData();
  }

  public async ngOnDestroy(): Promise<void> {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  public onHelperDismissed(): void {
    this.storageService.storeHelperAlertDismissal(helperAlertKey);
  }

  public async search(search: string): Promise<void> {
    return this.getData({ search });
  }

  public selectionChanged(members: PortalAdminApplicationroleMembers[]): void {
    this.selectedMembers = members;
  }

  public async add(): Promise<void> {
    const property = this.entitySchema.Columns.UID_Person;
    const entity = this.admins.createNew(this.role.uid).GetEntity();
    const fk = entity.GetFkCandidateProvider().getProviderItem(property.FkRelation.ParentColumnName, property.FkRelation.ParentTableName);

    const isMobile = document.body.offsetWidth <= 768;

    const selection = await this.dialog.open(RequestsEntitySelectorComponent, {
      width: isMobile ? '90vw' : '60vw',
      maxWidth: isMobile ? '90vw' : '80vw',
      minHeight: '60vh',
      data: {
        get: (parameters: CollectionLoadParameters) => fk.load(entity, parameters),
        GetFilterTree: parentKey => fk.getFilterTree(entity, parentKey),
        isMultiValue: true
      }
    }).afterClosed().toPromise();

    if (selection) {
      await this.admins.add(this.role.uid, selection);
      await this.getData();
      this.snackbar.open({ key: '#LDS#The members have been successfully added.' });
    }
  }

  public async delete(): Promise<void> {
    await this.admins.delete(this.role.uid, this.selectedMembers);
    await this.getData();
    this.table?.clearSelection();
    this.snackbar.open({ key: '#LDS#The members have been successfully removed.' });
  }

  public async getData(newState?: CollectionLoadParameters): Promise<void> {
    const navigationState = {
      ...(this.dstSettings?.navigationState ?? { StartIndex: 0, PageSize: 25 }),
      ...newState
    };

    this.dstSettings = {
      displayedColumns: [
        this.entitySchema.Columns[DisplayColumns.DISPLAY_PROPERTYNAME]
      ],
      dataSource: await this.admins.get(this.role.uid, navigationState),
      entitySchema: this.entitySchema,
      navigationState
    };
  }
}
