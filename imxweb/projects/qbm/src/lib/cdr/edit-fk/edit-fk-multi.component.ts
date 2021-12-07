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
 * Copyright 2021 One Identity LLC.
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

import { Component, EventEmitter, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { EuiSidesheetService } from '@elemental-ui/core';

import { CdrEditor } from '../cdr-editor.interface';
import { EntityColumnContainer } from '../entity-column-container';
import { ColumnDependentReference } from '../column-dependent-reference.interface';
import { ClassloggerService } from '../../classlogger/classlogger.service';
import { FkAdvancedPickerComponent } from '../../fk-advanced-picker/fk-advanced-picker.component';
import { ValueStruct } from 'imx-qbm-dbts';
import { ForeignKeySelection } from '../../fk-advanced-picker/./foreign-key-selection.interface';
import { LdsReplacePipe } from '../../lds-replace/lds-replace.pipe';
import { MultiValueService } from '../../multi-value/multi-value.service';
import { FkHierarchicalDialogComponent } from '../../fk-hierarchical-dialog/fk-hierarchical-dialog.component';

@Component({
  selector: 'imx-edit-fk-multi',
  templateUrl: './edit-fk-multi.component.html',
  styleUrls: ['./edit-fk-multi.component.scss']
})
export class EditFkMultiComponent implements CdrEditor, OnInit {
  public readonly control = new FormControl();

  public readonly columnContainer = new EntityColumnContainer<string>();

  public readonly valueHasChanged = new EventEmitter<any>();
  public loading = false;

  private isHierarchical: boolean;


  /**
   * Creates a new EditFkMultiComponent for column dependent reference with a foreign key relation.
   * @param logger Log service.
   * @param sidesheet Dialog to open the pickerdialog for selecting objects.
   */
  constructor(
    private readonly logger: ClassloggerService,
    private readonly sidesheet: EuiSidesheetService,
    private readonly translateService: TranslateService,
    private readonly ldsReplace: LdsReplacePipe,
    private readonly multiValueProvider: MultiValueService
  ) { }

  public async ngOnInit(): Promise<void> {
    this.loading = true;
    try {
      const candidateCollection = await this.columnContainer.fkRelations[0].Get({ PageSize: 5 });
      this.isHierarchical = candidateCollection.Hierarchy != null;
    } finally {
      this.loading = false;
    }
  }

  /**
   * Binds a column dependent reference to the component
   * @param cdref a column dependent reference
   */
  public async bind(cdref: ColumnDependentReference): Promise<void> {
    if (cdref && cdref.column) {
      this.columnContainer.init(cdref);
      this.control.setValue(
        await this.multiValueToDisplay({
          DataValue: this.columnContainer.value,
          DisplayValue: this.columnContainer.displayValue
        }),
        { emitEvent: false }
      );
      if (this.columnContainer.isValueRequired && this.columnContainer.canEdit) {
        this.control.setValidators(control => control.value == null || control.value.length === 0 ? { required: true } : null);
      }
      this.logger.trace(this, 'Control initialized');
    } else {
      this.logger.error(this, 'The Column Dependent Reference is undefined');
    }
  }

  /**
   * @ignore
   * Opens a dialog for selecting fk objects
   */
  public async editAssignment(): Promise<void> {
    const dialogRef = this.sidesheet.open(this.isHierarchical ? FkHierarchicalDialogComponent : FkAdvancedPickerComponent, {
      title: this.ldsReplace.transform(await this.translateService.get('#LDS#Heading Edit {0}').toPromise(),
      await this.translateService.get(this.columnContainer?.display).toPromise()),
      headerColour: 'iris-blue',
      panelClass: 'imx-sidesheet',
      padding: '0',
      disableClose: true,
      width: '60%',
      testId: this.isHierarchical ? 'edit-fk-multi-hierarchy-sidesheet' : 'edit-fk-multi-sidesheet',
      data: {
        idList: this.multiValueProvider.getValues(this.columnContainer.value),
        fkRelations: this.columnContainer.fkRelations,
        isRequired: this.columnContainer.isValueRequired,
        isMultiValue: true
      }
    });

    dialogRef.afterClosed().subscribe(async (selection: ForeignKeySelection) => {
      if (selection) {
        if (!this.columnContainer.canEdit) {
          return;
        }

        const value = selection.candidates && selection.candidates.length > 0 ?
          {
            DataValue: this.multiValueProvider.getMultiValue(selection.candidates.map(v => v.DataValue)),
            DisplayValue: this.multiValueProvider.getMultiValue(selection.candidates.map(v => v.DisplayValue))
          } :
          {
            DataValue: undefined,
            DisplayValue: undefined
          };

        this.control.setValue(await this.multiValueToDisplay(value), { emitEvent: false });
        this.control.markAsDirty();

        await this.writeValue(value);
      } else {
        this.logger.debug(this, 'dialog cancel');
      }
    });
  }

  /**
   * updates the value for the CDR
   * @param value the new value
   */
  private async writeValue(value: ValueStruct<string>): Promise<void> {
    this.logger.debug(this, 'writeValue - called with', value);

    if (!this.columnContainer.canEdit) {
      return;
    }


    try {
      if (this.columnContainer.value === value.DataValue &&
        this.columnContainer.displayValue === value.DisplayValue) {
        return;
      }

      this.loading = true;
      this.logger.debug(this, 'writeValue - updateCdrValue...');
      await this.columnContainer.updateValueStruct(value);
      this.loading = false;
    } catch (e) {
      this.logger.error(this, e);
    } finally {
      const valueAfterWrite = await this.multiValueToDisplay({
        DataValue: this.columnContainer.value,
        DisplayValue: this.columnContainer.displayValue
      });
      this.loading = false;
      if (this.control.value !== valueAfterWrite) {
        this.control.setValue(valueAfterWrite, { emitEvent: false });
        this.control.markAsDirty();
        this.logger.debug(this, 'writeValue - form control value is set to', this.control.value);
      }
    }

    this.valueHasChanged.emit(value);
  }

  private async multiValueToDisplay(value: ValueStruct<string>): Promise<string> {
    const values = this.multiValueProvider.getValues(value.DataValue);

    if (values == null) {
      this.logger.debug(this, 'multiValueToDisplay - no values - returning undefined');
      return undefined;
    }

    if (values.length === 1) {
      this.logger.debug(this, 'multiValueToDisplay - returning single value');
      return value.DisplayValue;
    }

    if (values.length === 0) {
      this.logger.debug(this, 'multiValueToDisplay - returning empty string');
      return '';
    }

    this.logger.debug(this, 'multiValueToDisplay - multi value, returning descriptive message');
    return this.ldsReplace.transform(await this.translateService.get('#LDS#{0} items selected').toPromise(), values.length);
  }
}
