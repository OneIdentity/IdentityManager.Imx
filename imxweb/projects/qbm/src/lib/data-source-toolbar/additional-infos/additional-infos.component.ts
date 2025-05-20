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
 * Copyright 2024 One Identity LLC.
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

import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSelectionListChange } from '@angular/material/list';
import { DataModel, EntitySchema, IClientProperty } from '@imx-modules/imx-qbm-dbts';
import { ClientPropertyForTableColumns } from '../client-property-for-table-columns';

@Component({
  selector: 'imx-additional-infos',
  templateUrl: './additional-infos.component.html',
  styleUrls: ['./additional-infos.component.scss'],
})
export class AdditionalInfosComponent implements OnInit {
  public possibleProperties: ClientPropertyForTableColumns[];

  public infoText = '#LDS#Select the columns you want to add.';
  public infoTextLong =
    '#LDS#Here you can add additional columns to your table. Additionally, you can change the order using drag and drop. Move the mouse pointer over the shaded area and drag the element to the desired location.';

  public get result(): { all: IClientProperty[]; optionals: IClientProperty[] } {
    return { all: this.data.preselectedProperties, optionals: this.optionals };
  }

  public get optionals(): ClientPropertyForTableColumns[] {
    return this.data.preselectedProperties.filter((elem) => this.isRemoveable(elem));
  }

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public readonly data: {
      dataModel: DataModel;
      entitySchema: EntitySchema;
      displayedColumns: ClientPropertyForTableColumns[];
      additionalPropertyNames: ClientPropertyForTableColumns[];
      preselectedProperties: ClientPropertyForTableColumns[];
      additionalColumns: ClientPropertyForTableColumns[];
      type: 'list' | 'columns';
    },
    public dialogRef: MatDialogRef<AdditionalInfosComponent>,
  ) {}

  public ngOnInit(): void {
    const possiblePropertiesWithDuplicates = this.data.additionalPropertyNames.concat(this.data.displayedColumns);
    this.possibleProperties = possiblePropertiesWithDuplicates
      .filter((element, index) => possiblePropertiesWithDuplicates.findIndex((prop) => prop.ColumnName === element.ColumnName) === index)
      .sort((prop1, prop2) => AdditionalInfosComponent.compareNames(prop1, prop2));
  }

  public drop(event: CdkDragDrop<string[]>): void {
    moveItemInArray(this.data.preselectedProperties, event.previousIndex, event.currentIndex);
  }

  public remove(property: IClientProperty): void {
    const position = this.data.preselectedProperties.findIndex((elem) => elem.ColumnName === property.ColumnName);
    this.data.preselectedProperties.splice(position, 1);
  }

  public isChecked(property: IClientProperty): boolean {
    return this.data.preselectedProperties.find((elem) => elem.ColumnName === property.ColumnName) != null;
  }

  public updateSelected(event: MatSelectionListChange): void {
    if (event.options[0].selected) {
      // add new columns before first item with afterAdditionals = true or at the end
      let index = this.data.preselectedProperties.findIndex((elem) => elem.afterAdditionals === true);
      this.data.preselectedProperties.splice(index === -1 ? this.data.preselectedProperties.length : index, 0, event.options[0].value);

      index = this.optionals.findIndex((elem) => elem.afterAdditionals === true);
      this.optionals.splice(index === -1 ? this.optionals.length : index, 0, event.options[0].value);
    } else {
      // Find item and remove it
      let position = this.data.preselectedProperties.findIndex((elem) => elem.ColumnName === event.options[0].value.ColumnName);
      this.data.preselectedProperties.splice(position, 1);

      position = this.optionals.findIndex((elem) => elem.ColumnName === event.options[0].value.ColumnName);
      this.optionals.splice(position, 1);
    }
  }

  public isRemoveable(property: IClientProperty): boolean {
    return (
      this.data.displayedColumns.find((elem) => elem.ColumnName === property.ColumnName) == null &&
      this.data.additionalColumns.find((elem) => elem.ColumnName === property.ColumnName) == null
    );
  }

  private static compareNames(column1: IClientProperty, column2: IClientProperty): number {
    return (column1.Display || column1.ColumnName)?.localeCompare(column2.Display || column2.ColumnName || '') ?? 0;
  }
}
