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

import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControl, UntypedFormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import { IEntityColumn } from 'imx-qbm-dbts';
import { BaseCdr, BaseReadonlyCdr } from 'qbm';
import { OwnerCandidateOptions } from './owner.model';
import { OwnerControlService } from './owner-control.service';

@Component({
  selector: 'imx-owner-control',
  templateUrl: './owner-control.component.html',
  styleUrls: ['./owner-control.component.scss']
})
export class OwnerControlComponent implements OnChanges, OnDestroy {

  @Input() public column: IEntityColumn;
  @Input() public isReadOnly: boolean;
  @Output() public formControlCreated = new EventEmitter<AbstractControl>();

  public ownerCandidateOptions = OwnerCandidateOptions;
  public productOwnerCdr: BaseCdr;
  public productOwnerPersonCdr: BaseCdr;
  public ownerSelectionCtrl = new UntypedFormControl(this.ownerCandidateOptions.roles);

  public get uidPersonSelected(): string {
    return this.productOwnerPersonCdr ? this.productOwnerPersonCdr.column.GetValue() : undefined;
  }
  public get uidRoleSelected(): string {
    return this.productOwnerCdr ? this.productOwnerCdr.column.GetValue() : undefined;
  }

  private prdOwnerControl: AbstractControl;
  private prdOwnerPersonControl: AbstractControl;
  private readonly subscribers$: Subscription[] = [];

  constructor(public ownerService: OwnerControlService) { }

  public ngOnChanges(): void {
    this.productOwnerCdr = this.isReadOnly ? new BaseReadonlyCdr(this.column) : new BaseCdr(this.column);
    this.productOwnerPersonCdr = this.ownerService.createGroupOwnerPersonCdr(this.isReadOnly);
  }

  public ngOnDestroy(): void {
    this.subscribers$.forEach((subscription) => {
      if (subscription) {
        subscription.unsubscribe();
      }
    });
  }

  public onFormControlCreated(control: AbstractControl, type: OwnerCandidateOptions, createHandlers?: boolean): void {
    this.formControlCreated.emit(control);
    if (type === this.ownerCandidateOptions.people) {
      this.prdOwnerPersonControl = control;
    } else {
      this.prdOwnerControl = control;
    }
    if (createHandlers) {
      this.setupFormControlHandler(this.prdOwnerPersonControl, this.prdOwnerControl, this.productOwnerCdr);
      this.setupFormControlHandler(this.prdOwnerControl, this.prdOwnerPersonControl, this.productOwnerPersonCdr);
    }
  }

  private setupFormControlHandler(control: AbstractControl, controlToClear: AbstractControl, cdrRef: BaseCdr): void {
    if (control == null) {
      return;
    }
    this.subscribers$.push(
      control.valueChanges.pipe(debounceTime(500)).subscribe((value) => {
        if (value != null && typeof value === 'object') {
          // If a value is selected, clear out any value that might have been set on the other owner control and underlying cdr
          controlToClear.setValue(undefined, { emitEvent: false });
          cdrRef.column.PutValue(undefined);
        }
      })
    );
  }

}
