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

import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormArray, FormGroup, FormArray } from '@angular/forms';
import { Subscription } from 'rxjs';
import { EuiSidesheetRef, EUI_SIDESHEET_DATA } from '@elemental-ui/core';

import { IEntityColumn, TypedEntity } from 'imx-qbm-dbts';
import { PortalRespApplication } from 'imx-api-apc';
import { BusyService, CdrFactoryService, ColumnDependentReference, ConfirmationService } from 'qbm';
import { SoftwareService } from '../software.service';

/**
 * internal interface for the main form
 */
interface ServiceItemGroup {
  serviceItemParameter: UntypedFormArray;
}

/**
 * internal interface for the service item form
 */
interface SoftwareFormGroup{
  array: UntypedFormArray
}

@Component({
  templateUrl: './software-sidesheet.component.html',
  styleUrls: ['./software-sidesheet.component.scss'],
})
export class SoftwareSidesheetComponent implements OnInit, OnDestroy {
  
  public cdrList: ColumnDependentReference[];
  public softwareFormGroup = new FormGroup<SoftwareFormGroup>({ array: new UntypedFormArray([]) });

  public serviceItemGroup = new FormGroup<ServiceItemGroup>({ serviceItemParameter: new FormArray([]) });
  public isLoading = false;

  public serviceItem: TypedEntity;

  public get withProduct(): boolean {
    const value = this.productColumn?.GetValue();
    return value != null && value != '';
  }

  public get productColumn(): IEntityColumn | undefined {
    return this.entity == null ? undefined : CdrFactoryService.tryGetColumn(this.entity.GetEntity(), 'UID_AccProduct');
  }

  private subscriptions: Subscription[] = [];
  private entity: PortalRespApplication;
  private editableFields: string[];
  private busyService = new BusyService();

  constructor(
    @Inject(EUI_SIDESHEET_DATA)
    public readonly data: {
      uidSoftware: string;
    },
    private cdrFactory: CdrFactoryService,
    private readonly changeDetector: ChangeDetectorRef,
    private readonly softwareService: SoftwareService,
    sidesheetRef: EuiSidesheetRef,
    confirmation: ConfirmationService
  ) {
    this.subscriptions.push(
      sidesheetRef.closeClicked().subscribe(async () => {
        if ((this.serviceItemGroup?.dirty || this.softwareFormGroup.dirty) && !(await confirmation.confirmLeaveWithUnsavedChanges())) {
          return;
        }
        sidesheetRef.close(false);
      })
    );

    this.subscriptions.push(
      this.busyService.busyStateChanged.subscribe((state: boolean) => {
        this.isLoading = state;
        this.changeDetector.detectChanges();
      })
    );
  }

  public async ngOnInit(): Promise<void> {
    const isBusy = this.busyService.beginBusy();
    try {
      //Load main item and service item
      this.entity = await this.softwareService.getInteractive(this.data.uidSoftware);
      //load editable fields
      this.editableFields = await this.softwareService.getEditableFields('Application', this.entity.GetEntity());
      this.serviceItem = this.productColumn ? await this.softwareService.getServiceItem(this.productColumn.GetValue()) : null;
      // build cdr
      this.cdrList = this.cdrFactory.buildCdrFromColumnList(this.entity.GetEntity(), this.editableFields);
    } finally {
      isBusy.endBusy();
    }
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  /**
   * Saves the main data and reloads the form for further editing
   */
  public async submit(): Promise<void> {
    const isBusy = this.busyService.beginBusy();
    try {
      await this.entity.GetEntity().Commit();
      this.entity = await this.softwareService.getInteractive(this.data.uidSoftware);
      this.softwareFormGroup.controls.array.clear();

      this.cdrList = this.cdrFactory.buildCdrFromColumnList(this.entity.GetEntity(), this.editableFields);

      this.softwareFormGroup.markAsPristine();
      this.changeDetector.detectChanges();
    } finally {
      isBusy.endBusy();
    }
  }

  /**
   * Saves the service item and reloads the form for further editing
   */
  public async saveServiceItem(): Promise<void> {
    const isBusy = this.busyService.beginBusy();
    try {
      await this.serviceItem.GetEntity().Commit();
      this.serviceItemGroup.controls.serviceItemParameter.clear();
      this.serviceItem = this.productColumn ? await this.softwareService.getServiceItem(this.productColumn.GetValue()) : null;
      this.serviceItemGroup.markAsPristine();
    } finally {
      isBusy.endBusy();
    }
  }
}
