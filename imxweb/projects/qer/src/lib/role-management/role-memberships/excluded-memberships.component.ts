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

import { Component, OnInit, ViewChild } from '@angular/core';
import { EuiLoadingService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';
import { PortalRolesExclusions } from 'imx-api-qer';
import { CollectionLoadParameters, EntitySchema, IClientProperty, TypedEntity, TypedEntityCollectionData } from 'imx-qbm-dbts';
import {
  DataSourceToolbarFilter,
  DataSourceToolbarSettings,
  DataTableComponent,
  HELPER_ALERT_KEY_PREFIX,
  SnackBarService,
  StorageService
} from 'qbm';
import { ACTION_DISMISS } from '../../itshop-config/requests.service';
import { QerApiService } from '../../qer-api-client.service';
import { DataManagementService } from '../data-management.service';

const helperAlertKey = `${HELPER_ALERT_KEY_PREFIX}_roleMembership`;
const LdsMembersAdded = '#LDS#The members have been successfully assigned. It may take some time for the changes to take effect.';
const LdsMembersByDynamicRole = '#LDS#Here you can see the members that are originally assigned by a dynamic role but have been excluded. Additionally, you can add these excluded members back by removing the exclusion.';

@Component({
  selector: 'imx-excluded-memberships',
  templateUrl: './excluded-memberships.component.html',
  styleUrls: ['./excluded-memberships.component.scss', './role-sidesheet-tabs.scss']
})
export class ExcludedMembershipsComponent implements OnInit {
  // Replaces the former input
  public uidDynamicGroup: string;

  @ViewChild('dataTableExclusions', { static: false }) public dataTableExclusions: DataTableComponent<PortalRolesExclusions>;

  public LdsMembersByDynamicRole = LdsMembersByDynamicRole;
  public LdsNotIncludedInDynamicRole = '#LDS#Not assigned by a dynamic role';

  public filterOptions: DataSourceToolbarFilter[] = [];
  public dstSettingsExcludedMembers: DataSourceToolbarSettings;
  public navigationStateExcludedMembers: CollectionLoadParameters = {};
  public selectedExclusions: PortalRolesExclusions[] = [];
  public schema: EntitySchema;

  get showHelperAlert(): boolean {
    return !this.storageService.isHelperAlertDismissed(helperAlertKey);
  }

  public displayedColumnsExcluded: IClientProperty[] = [];

  constructor(
    private readonly qerApiClient: QerApiService,
    private dataManagementService: DataManagementService,
    private readonly translate: TranslateService,
    private readonly snackbar: SnackBarService,
    private readonly busyService: EuiLoadingService,
    private readonly storageService: StorageService
  ) { }


  public async ngOnInit(): Promise<void> {
    this.uidDynamicGroup = this.dataManagementService.entityInteractive.GetEntity().GetColumn('UID_DynamicGroup').GetValue();
    this.schema = this.qerApiClient.typedClient.PortalRolesExclusions.GetSchema();
    this.displayedColumnsExcluded = [
      this.schema.Columns.UID_Person,
      this.schema.Columns.Description
    ];
    await this.navigateExcludedMembers();
  }

  public async onNavigationStateExcludedChanged(newState?: CollectionLoadParameters): Promise<void> {
    if (newState) {
      this.navigationStateExcludedMembers = newState;
    }
    await this.navigateExcludedMembers();
  }

  public onExclusionSelected(selected: PortalRolesExclusions[]): void {
    this.selectedExclusions = selected;
  }



  public onHelperDismissed(): void {
    this.storageService.storeHelperAlertDismissal(helperAlertKey);
  }

  public async onSearchExcluded(keywords: string): Promise<void> {
    this.navigationStateExcludedMembers = { ...this.navigationStateExcludedMembers , ...{StartIndex:0, search:keywords}};
    await this.navigateExcludedMembers();
  }


  public async removeExclusions(): Promise<void> {
    const overlayRef = this.busyService.show();
    try {
      await this.removeRequestConfigMemberExclusions(this.selectedExclusions);
      await this.navigateExcludedMembers();

      this.translate.get([LdsMembersAdded, ACTION_DISMISS]).subscribe((translations: any[]) => {
        this.snackbar.open({ key: translations[LdsMembersAdded] }, translations[ACTION_DISMISS], { duration: 10000 });
      });
      // Reset table selections (removing references to now deleted members)
      this.dataTableExclusions.clearSelection();
    } finally {
      this.busyService.hide(overlayRef);
    }
  }
  private async navigateExcludedMembers(data?: TypedEntityCollectionData<TypedEntity>): Promise<void> {
    const overlayRef = this.busyService.show();
    try {
      if (!data) {
        data = await this.qerApiClient.typedClient.PortalRolesExclusions.Get(this.uidDynamicGroup,
          this.navigationStateExcludedMembers);
      }
      this.dstSettingsExcludedMembers = {
        displayedColumns: this.displayedColumnsExcluded,
        dataSource: data,
        entitySchema: this.schema,
        navigationState: this.navigationStateExcludedMembers,
        filters: this.filterOptions,
      };
    } finally {
      this.busyService.hide(overlayRef);
    }
  }

  private removeRequestConfigMemberExclusions(exclusions: PortalRolesExclusions[]): Promise<any> {
    const promises = [];
    exclusions.forEach((exclusion) => {
      const memberUid = exclusion.UID_Person?.value;
      promises.push(this.qerApiClient.client.portal_roles_exclusions_delete(this.uidDynamicGroup, memberUid));
    });
    return Promise.all(promises);
  }

}
