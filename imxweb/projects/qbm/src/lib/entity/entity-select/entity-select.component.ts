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

import { AfterContentInit, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { AbstractControl, UntypedFormControl, Validators } from '@angular/forms';
import { EuiSelectOption } from '@elemental-ui/core';

import { IClientProperty, IEntity } from 'imx-qbm-dbts';

@Component({
  selector: 'imx-entity-select',
  templateUrl: './entity-select.component.html',
  styleUrls: ['./entity-select.component.scss']
})
export class EntitySelectComponent implements OnChanges, AfterContentInit {
  public readonly control = new UntypedFormControl(undefined, Validators.required);

  public options: EuiSelectOption[];

  @Input() public title: string;
  @Input() public placeholder: string;
  @Input() public display: { primary?: IClientProperty, secondary?: IClientProperty };
  @Input() public entities: IEntity[];

  @Output() public controlCreated = new EventEmitter<AbstractControl>();

  @Output() public selectionChange = new EventEmitter<IEntity>();

  constructor() {
    this.filter = this.filter.bind(this);
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['entities'] || changes['display']) {
      if (this.entities) {
        this.options = this.entities.map(entity => ({
          display: this.display?.primary ?
            (entity.GetColumn(this.display.primary.ColumnName).GetDisplayValue() || entity.GetDisplay()) : entity.GetDisplay(),
          displayDetail: this.display?.secondary ?
            entity.GetColumn(this.display.secondary.ColumnName).GetDisplayValue() : undefined,
          value: entity
        }));
      } else {
        this.options = undefined;
      }
    }
  }

  public ngAfterContentInit(): void {
    this.controlCreated.emit(this.control);
  }

  public filter(option: EuiSelectOption, searchInputValue: string): boolean {
    return option.display.toString().toUpperCase().trim().includes(searchInputValue.toUpperCase().trim())
      || (option.displayDetail && option.displayDetail.toString().toUpperCase().trim().includes(searchInputValue.toUpperCase().trim()));
  }


  // TODO: Check Upgrade
  // public onChange(event: any): void {
  //   this.selectionChange.emit(event.value);
  // }
}
