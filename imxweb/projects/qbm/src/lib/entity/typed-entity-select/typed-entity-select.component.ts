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

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';

import { TypedEntity } from 'imx-qbm-dbts';
import { LdsReplacePipe } from '../../lds-replace/lds-replace.pipe';
import { TypedEntitySelectionData } from './typed-entity-selection-data.interface';
import { TypedEntitySelectorComponent } from './typed-entity-selector/typed-entity-selector.component';

@Component({
  selector: 'imx-typed-entity-select',
  templateUrl: './typed-entity-select.component.html',
  styleUrls: ['./typed-entity-select.component.scss']
})
export class TypedEntitySelectComponent implements OnInit {
  @Input() public data: TypedEntitySelectionData;

  @Output() public readonly controlCreated = new EventEmitter<UntypedFormControl>();
  @Output() public readonly selectionChanged = new EventEmitter<TypedEntity[]>();

  public readonly control = new UntypedFormControl();

  public loading = false;

  private selected: TypedEntity[];

  constructor(
    private readonly translate: TranslateService,
    private readonly ldsReplace: LdsReplacePipe,
    private readonly sidesheet: EuiSidesheetService
  ) { }

  public async ngOnInit(): Promise<void> {
    if (this.data) {
      this.loading = true;

      this.control.setValue(await this.data.getInitialDisplay(), { emitEvent: false });
      this.controlCreated.emit(this.control);

      this.loading = false;
    }
  }

  public async editAssignment(): Promise<void> {
    if (this.selected == null) {  // beim erste Mal aus der Datenbank holen
      this.loading = true;
      this.selected = await this.data.getSelected();
      this.loading = false;
    }

    const selection = await this.sidesheet.open(
      TypedEntitySelectorComponent,
      {
        title: await this.translate.get(this.data.title || this.data.valueWrapper.display).toPromise(),
        padding: '0',
        width: 'max(600px, 60%)',
        testId: `typed-entity-selector-${this.data.valueWrapper.name}`,
        data: {
          getTyped: this.data.dynamicFkRelation ? undefined : this.data.getTyped,
          isMultiValue: true,
          preselectedEntities: this.selected,
          fkTables: this.data.dynamicFkRelation?.tables,
          preselectedTableName: this.data.dynamicFkRelation?.getSelectedTableName(this.selected)
        }
      }
    ).afterClosed().toPromise();

    if (selection) {
      if (!this.data.valueWrapper.canEdit) {
        return;
      }

      this.selected = selection;

      this.selectionChanged.emit(selection);

      this.control.markAsDirty();

      await this.update(true);
    }
  }

  private async update(emitEvent: boolean): Promise<void> {
    if (this.selected?.length > 0) {
      const entities = this.selected.map(item => item.GetEntity());
      this.control.setValue(
        entities.length === 1 ? entities[0].GetDisplay() :
          this.ldsReplace.transform(await this.translate.get('#LDS#{0} items selected').toPromise(), entities.length),
        { emitEvent }
      );
    } else {
      this.control.setValue(
        undefined,
        { emitEvent }
      );
    }
  }
}
