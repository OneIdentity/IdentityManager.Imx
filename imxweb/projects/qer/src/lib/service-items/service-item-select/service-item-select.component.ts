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
import { EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';

import { TypedEntity } from 'imx-qbm-dbts';
import { LdsReplacePipe } from 'qbm';
import { ServiceItemsSelectorComponent } from '../service-items-selector/service-items-selector.component';
import { TypedEntitySelectionData } from './typed-entity-selection-data.interface';

@Component({
  selector: 'imx-service-item-select',
  templateUrl: './service-item-select.component.html',
  styleUrls: ['./service-item-select.component.scss']
})
export class ServiceItemSelectComponent implements OnChanges {
  @Input() data: TypedEntitySelectionData;

  @Output() public readonly controlCreated = new EventEmitter<UntypedFormControl>();

  public readonly imxIdentifier = 'imx-service-item-select';

  public readonly control = new UntypedFormControl();

  public readonly columnContainer = {
    display: '',
    canEdit: true,
    isValueRequired: false
  };

  public loading = false;

  constructor(
    private readonly translate: TranslateService,
    private readonly ldsReplace: LdsReplacePipe,
    private readonly sidesheet: EuiSidesheetService
  ) { }

  public async ngOnChanges(__: SimpleChanges): Promise<void> {
    if (this.data) {
      this.update(this.data.selected, false);
      this.columnContainer.display = this.data.display;
      this.controlCreated.emit(this.control);
    }
  }

  public async editAssignment(): Promise<void> {
    const selection = await this.sidesheet.open(
      ServiceItemsSelectorComponent,
      {
        title: await this.translate.get(this.data.title).toPromise(),
        subTitle: this.data.parent.GetEntity().GetDisplay(),
        padding: '0',
        width: 'max(600px, 60%)',
        data: {
          getTyped: this.data.getTyped,
          isMultiValue: true,
          preselectedEntities: this.data.selected
        }
      }
    ).afterClosed().toPromise();

    if (selection) {
      if (!this.columnContainer.canEdit) {
        return;
      }

      this.control.markAsDirty();
      await this.update(selection);

      this.data.selected = selection;
    }
  }

  private async update(selection: TypedEntity[], emitEvent: boolean = true): Promise<void> {
    const entities = selection?.map(item => item.GetEntity());
    if (entities?.length > 0) {
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
