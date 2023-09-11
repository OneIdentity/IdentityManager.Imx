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

import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { EuiLoadingService, EuiSidesheetRef, EUI_SIDESHEET_DATA } from '@elemental-ui/core';

import { OwnershipInformation } from 'imx-api-qer';
import { TypedEntity } from 'imx-qbm-dbts';
import { AuthenticationService, CdrFactoryService, ColumnDependentReference, ConfirmationService, GlobalErrorHandler, SnackBarService } from 'qbm';
import { RoleService } from '../role.service';

@Component({
  selector: 'imx-new-role',
  templateUrl: './new-role.component.html',
  styleUrls: ['./new-role.component.scss'],
})
export class NewRoleComponent implements OnInit, OnDestroy {
  public readonly formGroup = new FormGroup({});
  public cdrList: ColumnDependentReference[];
  public errorState = false;

  private currentUser: string;
  private subscriptions: Subscription[] = [];

  constructor(
    @Inject(EUI_SIDESHEET_DATA)
    private data: {
      typedEntity: TypedEntity;
      info: OwnershipInformation;
      isAdmin: boolean;
      parentDepartmentUid?: string;
    },
    private sidesheetRef: EuiSidesheetRef,
    private busyService: EuiLoadingService,
    private cdrService: CdrFactoryService,
    private snackbar: SnackBarService,
    private roleService: RoleService,
    private errorhandler: GlobalErrorHandler,
    authentication: AuthenticationService,
    confirmation: ConfirmationService
  ) {
    this.subscriptions.push(authentication.onSessionResponse.subscribe((session) => (this.currentUser = session.UserUid)));
    this.subscriptions.push(
      this.sidesheetRef.closeClicked().subscribe(async (result) => {
        if (this.formGroup?.dirty) {
          const closeConfirmation = await confirmation.confirmLeaveWithUnsavedChanges();
          if(closeConfirmation){
            this.sidesheetRef.close(false);
          }
        }else{
          this.sidesheetRef.close(result)
        }
      })
    );
  }

  public async ngOnInit(): Promise<void> {
    const fields = await this.roleService.getEditableFields(this.data.info.TableName, this.data.typedEntity.GetEntity(), true);
    this.cdrList = this.cdrService.buildCdrFromColumnList(this.data.typedEntity.GetEntity(), fields);
    this.errorhandler.resetMessage();
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  public addControl(name: string, control: AbstractControl): void {
    this.formGroup.addControl(name, control);
  }

  public async save(): Promise<void> {
    const over = this.busyService.show();
    let success = false;
    try {
      if (!this.data.isAdmin) {
        const column = CdrFactoryService.tryGetColumn(this.data.typedEntity.GetEntity(), 'UID_PersonHead');
        await column?.PutValue(this.currentUser);
      }
      await this.data.typedEntity.GetEntity().Commit();
      success = true;
    }catch (error){
      this.errorState = true;
      throw new Error(error);
    } finally {
      this.busyService.hide(over);

      if (success) {
        this.sidesheetRef.close(true);
        this.snackbar.open({
          key: this.roleService.getRoleTranslateKeys(this.data.info.TableName).createSnackbar,
        });
      }
    }
  }
}
