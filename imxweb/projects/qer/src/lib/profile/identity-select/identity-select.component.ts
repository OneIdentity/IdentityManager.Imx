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

import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';

import { EuiSelectOption } from '@elemental-ui/core';
import { IEntity } from 'imx-qbm-dbts';

@Component({
  selector: 'imx-identity-select',
  templateUrl: './identity-select.component.html',
  styleUrls: ['./identity-select.component.scss']
})
export class IdentitySelectComponent implements OnChanges {
  public readonly control = new UntypedFormControl(undefined);

  public options: EuiSelectOption[];

  @Input() public entities: IEntity[];
  @Input() public preselectedEntity: IEntity;
  @Input() public confirmChange: { check: () => Promise<boolean> };

  @Output() public selectionChange = new EventEmitter<string>();

  private selectedId: string;

  constructor() {
    this.filter = this.filter.bind(this);
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes.entities || changes.display) {
      if (this.entities) {
        this.options = this.entities.map(entity => ({
          display: entity.GetDisplay(),
          value: this.getId(entity)
        }));
      } else {
        this.options = undefined;
      }
    }

    if (changes.preselectedEntity) {
      this.selectedId = this.getId(this.preselectedEntity);
      this.control.setValue(this.selectedId, { emitEvent: false });
    }

    if (this.options?.length > 1 || this.control.value == null) {
      this.control.enable();
    } else {
      this.control.disable();
    }
  }

  public async onSelectionChange(value: string): Promise<void> {
    if (this.confirmChange && !(await this.confirmChange.check())) {
      // revert change if not confirmed:
      this.control.setValue(this.selectedId, { emitEvent: false });
      return;
    }

    this.selectedId = value;
    this.selectionChange.emit(value);
  }

  public filter(option: EuiSelectOption, searchInputValue: string): boolean {
    return option.display.toString().toUpperCase().trim().includes(searchInputValue.toUpperCase().trim());
  }

  private getId(entity: IEntity): string {
    return entity.GetKeys().join(',');
  }
}
