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

import { Component, ErrorHandler, EventEmitter, Inject, Output } from '@angular/core';
import { AbstractControl, UntypedFormGroup } from '@angular/forms';
import { EUI_SIDESHEET_DATA, EuiLoadingService, EuiSidesheetRef } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';

import { MatDialog } from '@angular/material/dialog';
import { PortalApplication, PortalShops } from '@imx-modules/imx-api-aob';
import { DbObjectKey, TypedEntity } from '@imx-modules/imx-qbm-dbts';
import {
  ClassloggerService,
  ConfirmationService,
  LdsReplacePipe,
  SnackBarService,
  TranslationEditorComponent,
  TypedEntitySelectionData,
} from 'qbm';
import { AccountsService } from '../../accounts/accounts.service';
import { ShopsService } from '../../shops/shops.service';
import { ApplicationContent } from '../application-content.interface';
import { SelectionContainer } from './selection-container';

@Component({
  selector: 'imx-edit-application',
  templateUrl: './edit-application.component.html',
})
export class EditApplicationComponent implements ApplicationContent {
  public readonly applicationForm = new UntypedFormGroup({});

  public shopsData: TypedEntitySelectionData;
  public accountsData: TypedEntitySelectionData;

  @Output() public readonly close = new EventEmitter<string>();

  private readonly shopsSelection = new SelectionContainer((item: PortalShops) => item.UID_ITShopOrg.value);
  private readonly accountsSelection = new SelectionContainer((item: TypedEntity) => item.GetEntity().GetKeys().join());

  constructor(
    private readonly logger: ClassloggerService,
    public readonly shopsProvider: ShopsService,
    private readonly snackbar: SnackBarService,
    private readonly busyService: EuiLoadingService,
    public readonly accountsProvider: AccountsService,
    private readonly errorHandler: ErrorHandler,
    private readonly sidesheetRef: EuiSidesheetRef,
    private readonly confirmation: ConfirmationService,
    private readonly translate: TranslateService,
    private readonly ldsReplace: LdsReplacePipe,
    @Inject(EUI_SIDESHEET_DATA) public application: PortalApplication,
    private readonly dialog: MatDialog,
  ) {
    this.sidesheetRef.closeClicked().subscribe(async () => {
      if (!this.hasUnsavedChanges()) {
        await this.cancelProcess();
        return;
      }

      if (await this.confirmation.confirmLeaveWithUnsavedChanges()) {
        await this.cancelProcess();
      }
    });

    this.accountsData = this.getAccountsData();
    this.shopsData = this.getShopsData();
  }

  public shopSelectionChanged(selection: TypedEntity[]): void {
    this.shopsSelection.selected = selection as PortalShops[];
  }

  public accountSelectionChanged(selection: TypedEntity[]): void {
    this.accountsSelection.selected = selection;
  }

  public canSubmit(): boolean {
    return this.hasUnsavedChanges() && !this.applicationForm.invalid;
  }

  public hasUnsavedChanges(): boolean {
    return this.application != null && this.applicationForm.dirty;
  }

  public async submitData(): Promise<void> {
    if (this.busyService.overlayRefs.length === 0) {
      this.busyService.show();
    }
    try {
      await this.saveShops();

      await this.saveAccounts();

      this.logger.debug(this, 'submitData - commit application changes...');

      await this.application.GetEntity().Commit(true);
      this.applicationForm.markAsPristine();
      this.close.emit(this.application?.UID_AOBApplication?.value);
      this.snackbar.open({ key: '#LDS#The application has been successfully saved.' }, '#LDS#Close', { duration: 3000 });
    } catch (error) {
      this.errorHandler.handleError(error);
    } finally {
      this.busyService.hide();
      this.sidesheetRef.close();
    }
  }

  public async cancelProcess(): Promise<void> {
    if (this.hasUnsavedChanges()) {
      this.applicationForm.markAsPristine();
      this.snackbar.open({ key: '#LDS#The changes were discarded.' }, '#LDS#Close', { duration: 3000 });
    }

    this.close.emit(this.application?.UID_AOBApplication?.value);
    this.sidesheetRef.close();
  }

  public editTranslation() {
    const dialogConfig = {
      data: this.application,
      width: '600px',
    };
    this.dialog.open(TranslationEditorComponent, dialogConfig);
  }

  public addAndValidate(event: { name: string; control: AbstractControl }) {
    this.applicationForm.addControl(event.name, event.control);
    event.control.updateValueAndValidity();
  }

  private getShopsData(): TypedEntitySelectionData<PortalShops> {
    return {
      title: '#LDS#Heading Edit IT Shop Structures',
      valueWrapper: {
        display: this.shopsProvider.display,
        name: 'shops',
        canEdit: true,
      },
      getInitialDisplay: async () => {
        const info = await this.shopsProvider.getFirstAndCount(this.application.UID_AOBApplication.value);
        if (info.first) {
          return this.buildInitalValue(info.first, info.count);
        }
        return '';
      },
      getSelected: async () => {
        this.shopsSelection.init(
          (await this.shopsProvider.getApplicationInShop(this.application.UID_AOBApplication.value, { PageSize: 100000 }))?.Data || [],
        );
        return this.shopsSelection.selected;
      },
      getTyped: (parameters) => this.shopsProvider.get(parameters),
    };
  }

  private async saveShops(): Promise<void> {
    if (this.shopsData) {
      this.logger.debug(this, 'submitData - update shops...');
      const result = await this.shopsProvider.updateApplicationInShops(this.application, this.shopsSelection.getChangeSet());
      if (!result) {
        this.logger.error(this, 'Attempt to update the shops failed');
      }
    }
  }

  private getAccountsData(): TypedEntitySelectionData {
    return {
      title: '#LDS#Heading Edit User Accounts',
      valueWrapper: {
        display: this.accountsProvider.display,
        name: 'accounts',
        canEdit: true,
      },
      getInitialDisplay: async () => {
        const info = await this.accountsProvider.getFirstAndCount(this.application.UID_AOBApplication.value);
        if (info.first) {
          return this.buildInitalValue(info.first, info.count);
        }
        return '';
      },
      getSelected: async () => {
        this.accountsSelection.init(
          await this.accountsProvider.getAssigned(this.application.UID_AOBApplication.value, { PageSize: 100000 }),
        );
        return this.accountsSelection.selected;
      },
      dynamicFkRelation: {
        tables: this.accountsProvider.getCandidateTables(),
        getSelectedTableName: (selected) => {
          if (selected?.length > 0) {
            return DbObjectKey.FromXml(selected[0].GetEntity().GetColumn('XObjectKey').GetValue()).TableName;
          }
          return '';
        },
      },
    };
  }

  private async saveAccounts(): Promise<void> {
    if (this.accountsData) {
      this.logger.debug(this, 'submitData - update accounts...');
      const result = await this.accountsProvider.updateApplicationUsesAccounts(this.application, this.accountsSelection.getChangeSet());
      if (!result) {
        this.logger.error(this, 'Attempt to update the accounts failed');
      }
    }
  }

  private async buildInitalValue(entity: TypedEntity, count: number): Promise<string> {
    return count < 1
      ? ''
      : count === 1
        ? entity.GetEntity().GetDisplay()
        : this.ldsReplace.transform(await this.translate.get('#LDS#{0} items selected').toPromise(), count);
  }
}
