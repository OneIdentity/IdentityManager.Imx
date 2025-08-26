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

import { ChangeDetectorRef, Component, Inject } from '@angular/core';
import { FormGroup, UntypedFormArray } from '@angular/forms';
import { EUI_SIDESHEET_DATA, EuiLoadingService, EuiSidesheetRef } from '@elemental-ui/core';
import { ValueStruct } from '@imx-modules/imx-qbm-dbts';
import {
  BusyService,
  CdrFactoryService,
  ColumnDependentReference,
  ConfirmationService,
  SnackBarService
} from 'qbm';
import { Subscription } from 'rxjs';
import { DugOverviewService } from '../../dug-overview/dug-overview.service';
import { PortalDgeResourcesbyid } from '../../TypedClient';

interface DugResourceFormGroup {
  array: UntypedFormArray;
}


@Component({
  selector: 'imx-dug-assign-ownership-sidesheet',
  templateUrl: './dug-assign-ownership-sidesheet.component.html',
  styleUrl: './dug-assign-ownership-sidesheet.component.scss'
})
export class DugAssignOwnershipSidesheetComponent {
  public dug: PortalDgeResourcesbyid[] = [];
  public busyService = new BusyService();
  public subscriptions: Subscription[] = [];

  public dugResourceFormGroup = new FormGroup<DugResourceFormGroup>({ array: new UntypedFormArray([]) });
  public cdrOwnerShip: (ColumnDependentReference | undefined)[] = [];
  public isLoading = true;

  public get saveDisabled(): boolean {
    return (
      !this.dugResourceFormGroup.dirty ||
      this.dugResourceFormGroup.invalid 
    );
  }

  constructor(
    @Inject(EUI_SIDESHEET_DATA) public readonly data: { uid: string[], identifier: string },
    private readonly dugOverviewProvider: DugOverviewService,
    private readonly loadingService: EuiLoadingService,
    private readonly cdrFactory: CdrFactoryService,
    private readonly snackbar: SnackBarService,
    private readonly changeDetector: ChangeDetectorRef,
    private readonly sidesheetRef: EuiSidesheetRef,
    confirm: ConfirmationService,
  ) {
    this.subscriptions.push(
      this.busyService.busyStateChanged.subscribe((state: boolean) => {
        this.isLoading = state;
        this.changeDetector.detectChanges();
      }),
    );
    this.subscriptions.push(
      sidesheetRef.closeClicked().subscribe(async () => {
        if (!this.saveDisabled && !(await confirm.confirmLeaveWithUnsavedChanges())) {
          return;
        }

        sidesheetRef.close(false);
      }),
    );
  }

  public async ngOnInit(): Promise<void> {
    const isBusy = this.busyService.beginBusy();
    try { 
      this.dug = await Promise.all(this.data.uid.map(uid => this.dugOverviewProvider.getDugResourceById(uid)));
      this.cdrOwnerShip = this.cdrFactory
          .buildCdrFromColumnList(this.dug[0].GetEntity(), [
            'UID_PersonResponsible',
          ])
          .filter((elem) => elem);
        
    } finally {
      isBusy.endBusy();
    }
  }

  public ngOnDestroy(): void {
    this.subscriptions?.forEach((elem) => elem?.unsubscribe());
  }

  public async save(): Promise<void> {
    const overlay = this.loadingService.show();
    try {
      for (const dugItem of this.dug) {
        await dugItem.GetEntity().Commit();
      }
      this.sidesheetRef.close(true)
      this.snackbar.open({ key: '#LDS#The resource has been saved' });
    } finally {
      this.loadingService.hide(overlay);
    }
  }

  public async savePersonResponsible(value: ValueStruct<string>): Promise<void> {
    await Promise.all(
      this.dug.slice(1).map(dug =>{
        dug.GetEntity().GetColumn('UID_PersonResponsible').PutValue(value?.DataValue);
      })
    );
  }
}
