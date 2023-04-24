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

import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';
import {
  ColumnDependentReference,
  BaseCdr,
  ClassloggerService,
  TabControlHelper,
  SnackBarService,
  ElementalUiConfigService,
  TabItem,
  ExtService
} from 'qbm';
import { DbObjectKey } from 'imx-qbm-dbts';
import { EuiLoadingService, EuiSidesheetService, EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { AccountSidesheetData } from '../accounts.models';
import { IdentitiesService, ProjectConfigurationService } from 'qer';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { AccountsService } from '../accounts.service';
import { EuiDownloadOptions } from '@elemental-ui/core';
import { AccountsReportsService } from '../accounts-reports.service';
import { AccountTypedEntity } from '../account-typed-entity';

@Component({
  selector: 'imx-account-sidesheet',
  templateUrl: './account-sidesheet.component.html',
  styleUrls: ['./account-sidesheet.component.scss'],
})
export class AccountSidesheetComponent implements OnInit {
  public readonly detailsFormGroup: FormGroup;
  public cdrList: ColumnDependentReference[] = [];
  public linkedIdentitiesManager: DbObjectKey;
  public unsavedSyncChanges = false;
  public initialAccountManagerValue: string;
  public reportDownload: EuiDownloadOptions;
  public neverConnectFormControl = new FormControl();
  public parameters: { objecttable: string; objectuid: string; };

  public dynamicTabs: TabItem[] = [];


  constructor(
    formBuilder: FormBuilder,
    @Inject(EUI_SIDESHEET_DATA) public readonly sidesheetData: AccountSidesheetData,
    private readonly logger: ClassloggerService,
    private readonly busyService: EuiLoadingService,
    private readonly snackbar: SnackBarService,
    private readonly sidesheet: EuiSidesheetService,
    private readonly elementalUiConfigService: ElementalUiConfigService,
    private readonly configService: ProjectConfigurationService,
    private readonly identitiesService: IdentitiesService,
    private readonly accountsService: AccountsService,
    private readonly reports: AccountsReportsService,
    private readonly tabService: ExtService
  ) {
    this.detailsFormGroup = new FormGroup({ formArray: formBuilder.array([]) });

    this.parameters = {
      objecttable: sidesheetData.unsDbObjectKey?.TableName,
      objectuid: sidesheetData.unsDbObjectKey?.Keys.join(',')
    };

    this.reportDownload = {
      ... this.elementalUiConfigService.Config.downloadOptions,
      url: this.reports.accountsReport(30, this.selectedAccount.GetEntity().GetKeys()[0], this.sidesheetData.tableName),
    };
  }

  public ngOnInit(): void {
    this.setup();
  }

  public cancel(): void {
    this.sidesheet.close();
  }

  public async save(): Promise<void> {
    if (this.detailsFormGroup.valid) {
      this.logger.debug(this, `Saving identity change`);
      const overlayRef = this.busyService.show();
      try {
        await this.selectedAccount.GetEntity().Commit(true);
        this.detailsFormGroup.markAsPristine();
        this.snackbar.open({ key: '#LDS#The user account has been successfully saved.' });
        this.sidesheet.close(true);
      } finally {
        this.unsavedSyncChanges = false;
        this.busyService.hide(overlayRef);
      }
    }
  }

  get selectedAccount(): AccountTypedEntity {
    return this.sidesheetData.selectedAccount;
  }

  get formArray(): FormArray {
    return this.detailsFormGroup.get('formArray') as FormArray;
  }

  get identityManagerMatchesAccountManager(): boolean {
    let isMatch = false;

    const objectKeyManager = this.selectedAccount?.objectKeyManagerColumn?.GetValue();

    if (
      this.linkedIdentitiesManager &&
      objectKeyManager?.length
    ) {
      isMatch = objectKeyManager === this.linkedIdentitiesManager.ToXmlString();
    }
    return isMatch;
  }

  get accountManagerIsEditable(): boolean {
    return this.selectedAccount.objectKeyManagerColumn?.GetMetadata().CanEdit();
  }

  public async syncToIdentityManager(event: MatSlideToggleChange): Promise<void> {
    const objectKeyManagerColumn = this.selectedAccount.objectKeyManagerColumn;

    if (objectKeyManagerColumn != null && event.checked) {
      await objectKeyManagerColumn.PutValue(this.linkedIdentitiesManager.ToXmlString());
      this.detailsFormGroup.markAsDirty();
      this.unsavedSyncChanges = true;
    }
  }

  private async setup(): Promise<void> {
    /**
     * Resolve an issue where the mat-tab navigation arrows could appear on first load
     */
    setTimeout(() => {
      TabControlHelper.triggerResizeEvent();
    });

    const cols = (await this.configService.getConfig()).OwnershipConfig.EditableFields[this.parameters.objecttable]

      this.cdrList = cols
        .map(column => 
          this.getCdr(column,this.selectedAccount)
        ).filter(elem=> elem != null);

    this.dynamicTabs = (await this.tabService.getFittingComponents<TabItem>('accountSidesheet',
    (ext) =>  ext.inputData.checkVisibility(this.parameters)))
    .sort((tab1: TabItem, tab2: TabItem) => tab1.sortOrder - tab2.sortOrder);

    this.setupIdentityManagerSync();
  }

  private async setupIdentityManagerSync(): Promise<void> {
    this.initialAccountManagerValue = this.selectedAccount.objectKeyManagerColumn?.GetValue();
    const linkedIdentityId = this.selectedAccount.uidPersonColumn?.GetValue();
    if (linkedIdentityId) {
      this.linkedIdentitiesManager = await this.getLinkedIdentitiesManager(
        linkedIdentityId,
        this.sidesheetData.unsDbObjectKey.TableName
      );
    }
  }

  private async getLinkedIdentitiesManager(linkedIdentityId: string, tableName: string): Promise<DbObjectKey> {
    const identityData = await this.identitiesService.getPerson(linkedIdentityId);
    if (identityData?.UID_PersonHead.value) {
      const managerAccountData = await this.accountsService.getAccount(
        {
          TableName: tableName,
          Keys: [identityData.UID_PersonHead.value]
        },
        'UID_Person'
      );

      if (managerAccountData) {
        return new DbObjectKey(tableName, managerAccountData.GetEntity().GetKeys());
      }
    }

    return undefined;
  }

  private getCdr (column: string, entity: AccountTypedEntity): ColumnDependentReference{
    try{
      const col = entity.GetEntity().GetColumn(column) ;
      return new BaseCdr(col);
    } catch{ return undefined;} 
   }

}
