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

import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, UntypedFormControl } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';

@Component({
  selector: 'imx-service-item-tags',
  templateUrl: './service-item-tags.component.html',
  styleUrls: ['./service-item-tags.component.scss']
})
export class ServiceItemTagsComponent implements OnInit {
  public readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  public readonly control = new UntypedFormControl();
  public readonly label = '#LDS#Tags';

  @Input() public selection: string[] = [];
  @Input() public loading: boolean;

  @Output() public readonly controlCreated = new EventEmitter<AbstractControl>();

  public ngOnInit(): void {
    this.controlCreated.emit(this.control);
  }

  public addTag(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    if ((value || '').trim() && this.selection.indexOf((value || '').trim()) < 0) {
      this.selection.push(value.trim());
      this.control.markAsDirty();
    }
    if (input) {
      input.value = '';
    }
  }

  public removeTag(tag: string): void {
    const index = this.selection.indexOf(tag);
    if (index >= 0) {
      this.selection.splice(index, 1);
      this.control.markAsDirty();
    }
  }
}
