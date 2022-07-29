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

import { Component, OnInit } from '@angular/core';
import { EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';

import { PortalAdminApplicationrole } from 'imx-api-qer';
import { CollectionLoadParameters, DisplayColumns, EntitySchema } from 'imx-qbm-dbts';
import { DataSourceToolbarSettings, HELPER_ALERT_KEY_PREFIX, StorageService } from 'qbm';
import { AdminMembersComponent } from '../admin-members/admin-members.component';
import { AdminMembersService } from '../admin-members/admin-members.service';

const helperAlertKey = `${HELPER_ALERT_KEY_PREFIX}_adminGroups`;

@Component({
  selector: 'imx-admin',
  templateUrl: './admin-groups.component.html',
  styleUrls: ['./admin-groups.component.scss']
})
export class AdminGroupsComponent implements OnInit {

  public get showHelperAlert(): boolean {
    return !this.storageService.isHelperAlertDismissed(helperAlertKey);
  }

  public dstSettings: DataSourceToolbarSettings;
  private readonly entitySchema: EntitySchema;

  constructor(
    private readonly sidesheet: EuiSidesheetService,
    private readonly admins: AdminMembersService,
    private readonly storageService: StorageService,
    private readonly translate: TranslateService
  ) {
    this.entitySchema = this.admins.adminApplicationRoleSchema;
  }

  public async ngOnInit(): Promise<void> {
    this.getData();
  }

  public async getData(newState?: CollectionLoadParameters): Promise<void> {
    const navigationState = {
      ...(this.dstSettings?.navigationState ?? { StartIndex: 0, PageSize: 25 }),
      ...newState
    };

    this.dstSettings = {
      displayedColumns: [
        this.entitySchema.Columns[DisplayColumns.DISPLAY_LONG_PROPERTYNAME],
        this.entitySchema.Columns.Description
      ],
      dataSource: await this.admins.getGroupInfo(
        [
          'ADS-AEROLE-NAMESPACEADMIN-ADS',
          'ATT-AEROLE-ATTESTATIONADMIN-ADMIN',
          'QER-AEROLE-ITSHOPADMIN-ADMIN',
          'QER-AEROLE-ITSHOP-INTERVENTION',
          'ATT-AEROLE-ATTESTATION-INTERVENTION'
        ],
        navigationState
      ),
      entitySchema: this.entitySchema,
      navigationState
    };
  }

  public onHelperDismissed(): void {
    this.storageService.storeHelperAlertDismissal(helperAlertKey);
  }

  public async editRoleMembership(role: PortalAdminApplicationrole): Promise<void> {
    this.sidesheet.open(
      AdminMembersComponent,
      {
        title: await this.translate.get('#LDS#Heading Edit Application Role').toPromise(),
        headerColour: 'blue',
        bodyColour: 'asher-gray',
        padding: '0px',
        width: 'max(600px, 60%)',
        data: { role }
      }
    );
  }
}
