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

import { Component, ViewChild, Output, EventEmitter, Input } from '@angular/core';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';

@Component({
  selector: 'imx-auto-complete',
  templateUrl: './auto-complete.component.html',
  styleUrls: ['./auto-complete.component.scss']
})
export class AutoCompleteComponent {

  public filterText = '';
  public filteredOptions: string[];

  @Input() public availableOptions: any[];
  @Input() public placeholder: string;
  @ViewChild(MatAutocompleteTrigger, { static: true }) public autocomplete: MatAutocompleteTrigger;

  @Output() public valueChanged: EventEmitter<string> = new EventEmitter<string>();

  public EmitValueChangedEvent(): void {
    this.valueChanged.emit(this.filterText);
    this.autocomplete.closePanel();
  }

  public filterOptions(): void {
    this.filteredOptions = this.availableOptions
      .filter(app => app.toLocaleLowerCase().includes(this.filterText.toLocaleLowerCase()));
  }

  public clearText(): void {
    this.filterText = '';
    this.filterOptions();
    this.EmitValueChangedEvent();
  }

}
