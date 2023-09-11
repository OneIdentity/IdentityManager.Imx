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

import { Component, Inject, OnDestroy } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { EuiSidesheetRef, EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { Subscription } from 'rxjs';

import { PortalApplicationNew } from 'imx-api-aob';
import { IEntityColumn, IWriteValue, ValueStruct } from 'imx-qbm-dbts';
import { BaseCdr, ColumnDependentReference, ConfirmationService } from 'qbm';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'imx-application-create',
  templateUrl: './application-create.component.html',
  styleUrls: ['./application-create.component.scss']
})
export class ApplicationCreateComponent implements OnDestroy {
  public readonly form = new UntypedFormGroup({});

  public name: ColumnDependentReference;
  public readonly description: ColumnDependentReference;
  public readonly serviceCategory: ColumnDependentReference;
  public readonly manager: ColumnDependentReference;
  public readonly owner: ColumnDependentReference;
  public readonly imageColumn: IEntityColumn;

  private readonly nameColumn: IEntityColumn;
  private readonly subscriptions: Subscription[] = [];

  constructor(
    @Inject(EUI_SIDESHEET_DATA) data: { application: PortalApplicationNew; },
    private readonly sidesheetRef: EuiSidesheetRef,
    private readonly translateService: TranslateService,
    confirmation: ConfirmationService
  ) {
    this.imageColumn = data.application.JPegPhoto.Column;

    this.nameColumn = data.application.Ident_AOBApplication.Column;
    this.name = new BaseCdr(this.nameColumn);

    this.description = new BaseCdr(data.application.Description.Column);

    this.serviceCategory = new class {
      public get hint(): string {
        return this.property.value?.length > 0 ? '' :
        this.translateService.instant('#LDS#If you do not select a service category, a service category with the same name as the application is created and assigned.');
      }
      public readonly column = this.property.Column;
      constructor(
        private readonly property: IWriteValue<string>,
        private readonly translateService: TranslateService,
      ) {}
      public readonly isReadOnly = () => !this.property.GetMetadata().CanEdit();
    }(data.application.UID_AccProductGroup, this.translateService);

    this.manager = new BaseCdr(data.application.UID_PersonHead.Column);

    this.owner = new BaseCdr(data.application.UID_AERoleOwner.Column);

    this.subscriptions.push(sidesheetRef.closeClicked().subscribe(async () => {
      if ((data.application.GetEntity().GetDiffData()?.Data?.length > 0 || !this.form.pristine) &&
        !(await confirmation.confirmLeaveWithUnsavedChanges())) {
        return;
      }

      sidesheetRef.close(false);
    }));
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  public async updateName(value: ValueStruct<string>): Promise<void> {
    const name = this.name.column.GetValue();
    if (name == null || name.length === 0) {
      await this.name.column.PutValue(value?.DisplayValue);
      this.name = new BaseCdr(this.nameColumn);
    }
  }

  public async save(): Promise<void> {
    this.sidesheetRef.close(true);
  }
}
