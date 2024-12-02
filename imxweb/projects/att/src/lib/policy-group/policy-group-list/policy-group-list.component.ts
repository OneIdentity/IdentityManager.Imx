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

import { Component } from '@angular/core';
import { EuiSidesheetService } from '@elemental-ui/core';
import { PolicyFilterData, PortalAttestationPolicygroups } from '@imx-modules/imx-api-att';
import {
  CollectionLoadParameters,
  DisplayColumns,
  EntitySchema,
  ExtendedTypedEntityCollection,
  TypedEntityCollectionData,
  ValType,
} from '@imx-modules/imx-qbm-dbts';
import { TranslateService } from '@ngx-translate/core';
import {
  ClassloggerService,
  ClientPropertyForTableColumns,
  ConfirmationService,
  DataTableGroupedData,
  DataViewInitParameters,
  DataViewSource,
  HELP_CONTEXTUAL,
  HelpContextualComponent,
  HelpContextualService,
  SettingsService,
  SnackBarService,
  calculateSidesheetWidth,
} from 'qbm';
import { EditPolicyGroupSidesheetComponent } from '../edit-policy-group-sidesheet/edit-policy-group-sidesheet.component';
import { PolicyGroupService } from '../policy-group.service';

@Component({
  selector: 'imx-policy-group-list',
  templateUrl: './policy-group-list.component.html',
  styleUrls: ['./policy-group-list.component.scss'],
  providers: [DataViewSource],
})
export class PolicyGroupListComponent {
  public readonly entitySchemaPolicy: EntitySchema;
  public readonly DisplayColumns = DisplayColumns;
  public groupedData: { [key: string]: DataTableGroupedData } = {};
  public navigationState: CollectionLoadParameters;
  public isComplienceFrameworkEnabled = false;
  private readonly displayedColumns: ClientPropertyForTableColumns[];

  constructor(
    private readonly policyGroupService: PolicyGroupService,
    private readonly logger: ClassloggerService,
    private readonly settingsService: SettingsService,
    private readonly confirmationService: ConfirmationService,
    private readonly snackbar: SnackBarService,
    private readonly sideSheet: EuiSidesheetService,
    private readonly translator: TranslateService,
    private readonly helpContextualService: HelpContextualService,
    public dataSource: DataViewSource<PortalAttestationPolicygroups>,
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
        untranslatedDisplay: '#LDS#Actions',
      },
    ];
  }

  public async ngOnInit(): Promise<void> {
    await this.navigate();
  }

  private async navigate(): Promise<void> {
    const dataViewInitParameters: DataViewInitParameters<PortalAttestationPolicygroups> = {
      execute: (params: CollectionLoadParameters): Promise<TypedEntityCollectionData<PortalAttestationPolicygroups>> =>
        this.policyGroupService.get(params),
      schema: this.entitySchemaPolicy,
      columnsToDisplay: this.displayedColumns,
      highlightEntity: (policyGroup: PortalAttestationPolicygroups) => {
        this.editPolicy(policyGroup);
      },
    };
    this.dataSource.init(dataViewInitParameters);
  }

  public async delete(policyGroup: PortalAttestationPolicygroups, event: any): Promise<void> {
    event.stopPropagation();
    if (
      await this.confirmationService.confirm({
        Title: '#LDS#Heading Delete Policy Collection',
        Message: '#LDS#Are you sure you want to delete the policy collection?',
      })
    ) {
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
      this.dataSource.updateState();
      this.snackbar.open(message, '#LDS#Close');
    }
  }

  public async editPolicy(policyGroup: PortalAttestationPolicygroups) {
    let data: ExtendedTypedEntityCollection<PortalAttestationPolicygroups, unknown>;
    this.policyGroupService.handleOpenLoader();
    try {
      data = await this.policyGroupService.getPolicyGroupEdit(policyGroup.GetEntity().GetKeys()[0]);
      if (data && data.Data.length > 0) {
        await this.showPolicy(
          data.Data[0],
          data.extendedData ? data.extendedData[0] : undefined,
          await this.translator.get('#LDS#Heading Edit Policy Collection').toPromise(),
          false,
          policyGroup.GetEntity().GetDisplay(),
        );
      }
    } finally {
      this.policyGroupService.handleCloseLoader();
    }
  }

  private async showPolicy(
    policyGroup: PortalAttestationPolicygroups,
    filterData: PolicyFilterData,
    display: string,
    isNew: boolean,
    subtitle: string,
  ): Promise<void> {
    this.helpContextualService.setHelpContextId(
      isNew ? HELP_CONTEXTUAL.AttestationPolicyCollectionsCreate : HELP_CONTEXTUAL.AttestationPolicyCollectionsEdit,
    );
    const sidesheetRef = this.sideSheet.open(EditPolicyGroupSidesheetComponent, {
      title: display,
      subTitle: subtitle,
      padding: '0px',
      width: calculateSidesheetWidth(),
      disableClose: true,
      data: { policyGroup, filterData, isNew, isComplienceFrameworkEnabled: this.isComplienceFrameworkEnabled },
      testId: 'policy-group-list-show-policy-sidesheet',
      headerComponent: HelpContextualComponent,
    });

    const shouldReload = await sidesheetRef.afterClosed().toPromise();
    if (shouldReload) {
      this.dataSource.updateState();
    }
  }

  public async newPolicyGroup(): Promise<void> {
    let policyGroup: PortalAttestationPolicygroups | undefined;
    this.policyGroupService.handleOpenLoader();
    try {
      policyGroup = await this.policyGroupService.buildNewEntity();
      this.logger.trace(this, 'new policy group created', policyGroup);
    } finally {
      this.policyGroupService.handleCloseLoader();
      if (policyGroup) {
        await this.showPolicy(
          policyGroup,
          {
            IsReadOnly: false,
            Filter: { Elements: [], ConcatenationType: 'OR' },
            InfoDisplay: [],
          },
          await this.translator.get('#LDS#Heading Create Policy Collection').toPromise(),
          true,
          '',
        );
      }
    }
  }
}
