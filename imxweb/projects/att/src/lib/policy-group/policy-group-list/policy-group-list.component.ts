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

import { Component } from '@angular/core';
import{PolicyGroupService} from '../policy-group.service';
import {
  ClassloggerService,
  ConfirmationService,
  DataSourceToolbarFilter,
  DataSourceToolbarGroupData,
  DataSourceToolbarSettings,
  DataTableGroupedData,
  ClientPropertyForTableColumns,
  SettingsService,
  SnackBarService,
  HelpContextualComponent,
  HelpContextualService,
  HELP_CONTEXTUAL
} from 'qbm';
import {
  CollectionLoadParameters,
  DisplayColumns,
  ValType,
  ExtendedTypedEntityCollection,
  EntitySchema,
  DataModel
} from 'imx-qbm-dbts';
import { PolicyFilterData, PortalAttestationPolicygroups } from 'imx-api-att';
import { EuiSidesheetService } from '@elemental-ui/core';
import { EditPolicyGroupSidesheetComponent } from '../edit-policy-group-sidesheet/edit-policy-group-sidesheet.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'imx-policy-group-list',
  templateUrl: './policy-group-list.component.html',
  styleUrls: ['./policy-group-list.component.scss']
})

export class PolicyGroupListComponent {


  public dstSettings: DataSourceToolbarSettings;
  public readonly entitySchemaPolicy: EntitySchema;
  public readonly DisplayColumns = DisplayColumns;
  public groupedData: { [key: string]: DataTableGroupedData } = {};
  public navigationState: CollectionLoadParameters;
  public isComplienceFrameworkEnabled = false; private groupData: DataSourceToolbarGroupData;

  private filterOptions: DataSourceToolbarFilter[] = [];
  private readonly displayedColumns: ClientPropertyForTableColumns[];
  private dataModel: DataModel;

  constructor( private readonly policyGroupService:PolicyGroupService ,
    private readonly logger: ClassloggerService,
    private readonly settingsService: SettingsService,
    private readonly confirmationService: ConfirmationService,
    private readonly snackbar: SnackBarService,
    private readonly sideSheet: EuiSidesheetService,
    private readonly translator: TranslateService,
    private readonly helpContextualService: HelpContextualService
    ) {
    this.navigationState = { PageSize: this.settingsService.DefaultPageSize, StartIndex: 0 };
    this.entitySchemaPolicy = policyGroupService.AttestationPolicyGroupSchema;
    this.displayedColumns = [
      this.entitySchemaPolicy.Columns['Ident_AttestationPolicyGroup'],
      this.entitySchemaPolicy.Columns['UID_PersonOwner'],
      this.entitySchemaPolicy.Columns['UID_QERPickCategory'],
      {
        ColumnName: 'actions',
        Type: ValType.String,
        afterAdditionals: true,
        untranslatedDisplay: '#LDS#Actions'
      }
    ];
   }

  public async ngOnInit(): Promise<void> {
    await this.navigate();
  }

  private async navigate(): Promise<void> {
    this.policyGroupService.handleOpenLoader();
    try {
      const policies = await this.policyGroupService.get(this.navigationState);
      this.logger.trace(this, 'interactive policy loaded', policies);

      this.dstSettings = {
        displayedColumns: this.displayedColumns,
        dataSource: policies,
        filters: this.filterOptions,
        groupData: this.groupData,
        entitySchema: this.entitySchemaPolicy,
        navigationState: this.navigationState,
        dataModel: this.dataModel
      };
    } finally {
      this.policyGroupService.handleCloseLoader();
    }
  }
  public async onSearch(keywords: string): Promise<void> {
    this.navigationState = {
      ...this.navigationState,
      ...{
        StartIndex: 0,
        search: keywords,
      }
    };
    this.logger.trace(this, 'navigation state change to ', this.navigationState);
    return this.navigate();
  }

  public async onNavigationStateChanged(newState: CollectionLoadParameters): Promise<void> {
    this.navigationState = newState;
    this.logger.trace(this, 'navigation state change to ', this.navigationState);
    await this.navigate();
  }

  public async onGroupingChange(groupKey: string): Promise<void> {
    this.policyGroupService.handleOpenLoader();
    try {
      const groupedData = this.groupedData[groupKey];
      groupedData.data = await this.policyGroupService.get(groupedData.navigationState);
      groupedData.settings = {
        displayedColumns: this.dstSettings.displayedColumns,
        dataModel: this.dstSettings.dataModel,
        dataSource: groupedData.data,
        entitySchema: this.dstSettings.entitySchema,
        navigationState: groupedData.navigationState
      };
    } finally {
     this.policyGroupService.handleCloseLoader();
    }
  }

  public async delete(policyGroup: PortalAttestationPolicygroups, event: any): Promise<void> {
    event.stopPropagation();
    if (await this.confirmationService.confirm({
      Title: '#LDS#Heading Delete Policy Collection',
      Message: '#LDS#Are you sure you want to delete the policy collection?'
    })) {
      this.policyGroupService.handleOpenLoader();
      try {
        const key = policyGroup.GetEntity().GetKeys()[0];
        await this.policyGroupService.deleteAttestationPolicyGroup(key);
        this.logger.debug(this, `policy ${key} deleted`);
      } finally {
        this.policyGroupService.handleCloseLoader();
      }
      const message = {
        key: '#LDS#The policy collection has been successfully deleted.',
      };
      this.navigate();
      this.snackbar.open(message, '#LDS#Close');
    }
  }

  public async editPolicy(policyGroup: PortalAttestationPolicygroups){
    let data: ExtendedTypedEntityCollection<PortalAttestationPolicygroups, {}>;
    this.policyGroupService.handleOpenLoader();
    try {
      data = await this.policyGroupService.getPolicyGroupEdit(policyGroup.GetEntity().GetKeys()[0]);
    } finally {
      this.policyGroupService.handleCloseLoader();
      if (data && data.Data.length > 0) {
        await this.showPolicy(
          data.Data[0],
          data.extendedData? data.extendedData[0]: undefined,
          await this.translator.get('#LDS#Heading Edit Policy Collection').toPromise(),
          false,
          policyGroup.GetEntity().GetDisplay());
      }
    }
  }

  private async showPolicy(
    policyGroup: PortalAttestationPolicygroups,
    filterData: PolicyFilterData,
    display: string,
    isNew: boolean,
    subtitle: string
  ): Promise<void> {
    this.helpContextualService.setHelpContextId(isNew? HELP_CONTEXTUAL.AttestationPolicyCollectionsCreate : HELP_CONTEXTUAL.AttestationPolicyCollectionsEdit);
    const sidesheetRef = this.sideSheet.open(EditPolicyGroupSidesheetComponent, {
      title: display,
      subTitle: subtitle,
      padding: '0px',
      width: 'max(600px, 60%)',
      disableClose: true,
      data: { policyGroup, filterData, isNew, isComplienceFrameworkEnabled: this.isComplienceFrameworkEnabled },
      testId: 'policy-group-list-show-policy-sidesheet',
      headerComponent: HelpContextualComponent
    });

    const shouldReload = await sidesheetRef.afterClosed().toPromise();
    if (shouldReload) { this.navigate(); }
  }

  public async newPolicyGroup(): Promise<void> {
    let policyGroup: PortalAttestationPolicygroups;
    this.policyGroupService.handleOpenLoader();
    try {
    policyGroup = await this.policyGroupService.buildNewEntity();
      this.logger.trace(this, 'new policy group created', policyGroup);
    } finally {
      this.policyGroupService.handleCloseLoader();
      if (policyGroup) {
        await this.showPolicy(policyGroup, {
          IsReadOnly: false,
          Filter: { Elements: [], ConcatenationType: 'OR' },
          InfoDisplay: []
        },
        await this.translator.get('#LDS#Heading Create Policy Collection').toPromise(), true,"");
      }
    }
  }
}
