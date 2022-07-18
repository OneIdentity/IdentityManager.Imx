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

import { AfterViewInit, Component, EventEmitter, Input, Output } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';

import { ValueStruct } from 'imx-qbm-dbts';
import { ColumnDependentReference } from 'qbm';
import { JustificationService } from '../justification.service';

@Component({
  selector: 'imx-decision-reason',
  templateUrl: './decision-reason.component.html',
  styleUrls: ['./decision-reason.component.scss']
})
export class DecisionReasonComponent implements AfterViewInit {
  @Input() public reasonStandard: ColumnDependentReference;
  @Input() public reasonFreetext: ColumnDependentReference;
  @Input() public maxReasonType: number;

  @Output() public controlCreated = new EventEmitter<AbstractControl>();

  private readonly formGroup = new FormGroup({});
  private readonly reasonFreetextControl: { name: string, control?: AbstractControl } = { name: 'freetext' };

  constructor(private readonly justificationService: JustificationService) { }

  public ngAfterViewInit(): void {
    this.controlCreated.emit(this.formGroup);
  }

  public addReasonStandard(control: AbstractControl): void {
    setTimeout(() => this.formGroup.addControl('standard', control));
  }

  public addReasonFreetext(control?: AbstractControl): void {
    if (this.reasonFreetextControl.control == null) {
      this.reasonFreetextControl.control = control;
    }
    setTimeout(() => this.formGroup.addControl(this.reasonFreetextControl.name, this.reasonFreetextControl.control));
  }

  public async checkReason(value: ValueStruct<string>): Promise<void> {
    const justification = await this.justificationService.get(value.DataValue);

    this.formGroup.removeControl(this.reasonFreetextControl.name);
    this.reasonFreetext.minLength = Math.max((justification && justification.RequiresText.value ? 1 : 0),
      (this.maxReasonType ?? 0) < 2 ? 0 : 1);

    this.addReasonFreetext();
  }
}
