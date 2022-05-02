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

import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { EuiSidesheetRef, EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { Subscription } from 'rxjs';

import { PortalItshopPatternPrivate, } from 'imx-api-qer';
import { TypedEntity } from 'imx-qbm-dbts';

import {
  BaseCdr,
  ClassloggerService,
  ColumnDependentReference,
  ConfirmationService,
  DataTableComponent,
  TabControlHelper,
} from 'qbm';
import { ItshopPatternService } from '../itshop-pattern.service';
import { ItShopPatternChangedType } from '../itshop-pattern-changed.enum';

@Component({
  selector: 'imx-itshop-pattern-create-sidesheet',
  templateUrl: './itshop-pattern-create-sidesheet.component.html',
  styleUrls: ['./itshop-pattern-create-sidesheet.component.scss']
})
export class ItshopPatternCreateSidesheetComponent implements OnInit, OnDestroy {

  public get formArray(): FormArray {
    return this.detailsFormGroup.get('formArray') as FormArray;
  }
  public cdrList: ColumnDependentReference[] = [];
  public readonly detailsFormGroup: FormGroup;

  public detailsInfoText = '#LDS#Here you can specify the details of the new request template.';

  @ViewChild(DataTableComponent) public table: DataTableComponent<TypedEntity>;

  private closeSubscription: Subscription;

  constructor(
    formBuilder: FormBuilder,
    @Inject(EUI_SIDESHEET_DATA) public data: {
      pattern: PortalItshopPatternPrivate
    },
    private readonly patternService: ItshopPatternService,
    private readonly sideSheetRef: EuiSidesheetRef,
    private readonly logger: ClassloggerService,
    confirmation: ConfirmationService
  ) {
    this.detailsFormGroup = new FormGroup({ formArray: formBuilder.array([]) });

    this.closeSubscription = this.sideSheetRef.closeClicked().subscribe(async () => {
      if (await confirmation.confirm({
        Title: '#LDS#Heading Cancel Creating',
        Message: '#LDS#Are you sure you want to cancel creating the request template?'
      })) {
        this.sideSheetRef.close();
      }
    });
  }

  public async ngOnInit(): Promise<void> {

    /**
     * Resolve an issue where the mat-tab navigation arrows could appear on first load
     */
    setTimeout(() => {
      TabControlHelper.triggerResizeEvent();
    });

    await this.setupDetailsTab();
  }

  public ngOnDestroy(): void {
    if (this.closeSubscription) {
      this.closeSubscription.unsubscribe();
    }
  }

  public async save(): Promise<void> {
    if (this.detailsFormGroup.valid) {
      this.logger.debug(this, `Saving itshop pattern changes`);
      this.patternService.handleOpenLoader();
      try {
        await this.data.pattern.GetEntity().Commit(true);
        this.detailsFormGroup.markAsPristine();
        this.sideSheetRef.close(ItShopPatternChangedType.Saved);
      } finally {
        this.patternService.handleCloseLoader();
      }
    }
  }

  private async setupDetailsTab(): Promise<void> {
    this.cdrList = [
      new BaseCdr(this.data.pattern.Ident_ShoppingCartPattern.Column),
      new BaseCdr(this.data.pattern.Description.Column),
    ];

  }
}
