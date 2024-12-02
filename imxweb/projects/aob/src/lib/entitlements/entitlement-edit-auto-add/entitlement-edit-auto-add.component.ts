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

import { Component, Inject, OnDestroy } from '@angular/core';
import { EUI_SIDESHEET_DATA, EuiLoadingService, EuiSidesheetRef, EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';
import _ from 'lodash';
import { Subscription } from 'rxjs';

import { EntitlementToAddData, PortalApplication, SqlWizardWrite } from '@imx-modules/imx-api-aob';
import { isExpressionInvalid, SqlExpression, SqlWizardExpression } from '@imx-modules/imx-qbm-dbts';
import { calculateSidesheetWidth, ConfirmationService, SnackBarService } from 'qbm';
import { EntitlementEditAutoAddService } from './entitlement-edit-auto-add.service';
import { EntitlementToAddDataWrapperService } from './entitlement-to-add-data-wrapper.service';
import { MappedEntitlementsPreviewComponent } from './mapped-entitlements-preview/mapped-entitlements-preview.component';

@Component({
  templateUrl: './entitlement-edit-auto-add.component.html',
})
export class EntitlementEditAutoAddComponent implements OnDestroy {
  private subscriptions: Subscription[] = [];
  private reload = false;
  public exprHasntChanged = true;

  public sqlExpression: SqlWizardExpression;

  public checkChanges(): void {
    this.exprHasntChanged = _.isEqual(this.data.sqlExpression, this.sqlExpression);
  }

  public get controlsInvalid(): boolean {
    return this.exprHasntChanged || (!this.sqlExpression.IsUnsupported && this.isConditionInvalid());
  }

  constructor(
    @Inject(EUI_SIDESHEET_DATA) public data: { sqlExpression: SqlWizardExpression; application: PortalApplication },
    public readonly svc: EntitlementEditAutoAddService,
    private readonly sidesheetRef: EuiSidesheetRef,
    private readonly entitlementToAddWrapperService: EntitlementToAddDataWrapperService,
    private readonly busyService: EuiLoadingService,
    private readonly snackbar: SnackBarService,
    private readonly sidesheet: EuiSidesheetService,
    private readonly translateService: TranslateService,
    confirm: ConfirmationService,
  ) {
    this.subscriptions.push(
      sidesheetRef.closeClicked().subscribe(async () => {
        if (this.exprHasntChanged || (await confirm.confirmLeaveWithUnsavedChanges())) sidesheetRef.close(this.reload);
      }),
    );
    this.sqlExpression = _.cloneDeep(data.sqlExpression);
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach((elem) => elem.unsubscribe());
  }

  public async showResults(withSave: boolean): Promise<void> {
    this.showBusyIndicator();
    let elements: EntitlementToAddData;
    try {
      await this.setExtendedData(this.sqlExpression.Expression);
      elements = await this.svc.showEntitlementsToMap(this.data.application.InteractiveEntityStateData);
    } finally {
      this.busyService.hide();
    }
    if (!elements) {
      return;
    }

    const entitlementToAdd = this.entitlementToAddWrapperService.buildTypedEntities(elements);
    const saveChanges: { save: boolean; map: boolean } = await this.sidesheet
      .open(MappedEntitlementsPreviewComponent, {
        title: await this.translateService.get('#LDS#Heading View Matching Application Entitlements').toPromise(),
        subTitle: this.data.application.GetEntity().GetDisplay(),
        padding: '0px',
        width: calculateSidesheetWidth(1000),
        testId: 'mapped-entitlements-preview-sidesheet',
        data: {
          entitlementToAdd,
          withSave,
        },
      })
      .afterClosed()
      .toPromise();

    this.reload = true;

    if (withSave && saveChanges?.save) {
      this.showBusyIndicator();
      try {
        await this.data.application.GetEntity().Commit(false);
        if (saveChanges.map) {
          this.svc.mapEntitlementsToApplication(this.data.application.UID_AOBApplication.value);
        }
      } finally {
        this.busyService.hide();
      }
      this.sidesheetRef.close(true);
      this.snackbar.open({
        key: saveChanges.map
          ? '#LDS#The conditions for automatically added application entitlements have been changed. The application entitlements are added now. This may take some time.'
          : '#LDS#The conditions for automatically added application entitlements have been changed.',
      });
    } else {
      // reset the extended data if you do not save the data
      this.showBusyIndicator();
      try {
        await this.setExtendedData(this.data.sqlExpression.Expression);
      } finally {
        this.busyService.hide();
      }
    }
  }

  public isConditionInvalid(): boolean {
    // check if the sqlWizard has a valid expression
    return (
      this.exprHasntChanged ||
      this.sqlExpression?.Expression?.Expressions?.length === 0 ||
      isExpressionInvalid(this.sqlExpression) ||
      !this.hasValuesSet(this.sqlExpression?.Expression)
    );
  }

  private hasValuesSet(sqlExpression: SqlExpression | undefined, checkCurrent: boolean = false): boolean {
    const current = !checkCurrent || sqlExpression?.Value != null;

    if (!!sqlExpression?.Expressions?.length) {
      return current && !!sqlExpression?.Expressions?.every((elem) => this.hasValuesSet(elem, true));
    }

    return current;
  }

  private async setExtendedData(sqlExpression: SqlExpression | undefined): Promise<void> {
    const SqlExpression: SqlWizardWrite = { Filters: [] };
    if (sqlExpression) {
      SqlExpression.Filters?.push(sqlExpression);
    }
    return this.data.application.setExtendedData({
      ...this.data.application.extendedData,
      ...{
        SqlExpression,
      },
    });
  }

  private showBusyIndicator(): void {
    if (this.busyService.overlayRefs.length === 0) {
      this.busyService.show();
    }
  }
}
