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

import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSelectionListChange } from '@angular/material/list';
import { DataModel, EntitySchema, IClientProperty } from 'imx-qbm-dbts';

@Component({
  selector: 'imx-additional-infos',
  templateUrl: './additional-infos.component.html',
  styleUrls: ['./additional-infos.component.scss']
})
export class AdditionalInfosComponent implements OnInit {

  public possibleProperties: IClientProperty[];

  public optionals: IClientProperty[];

  public get result(): any {
    return { all: this.data.preselectedProperties, optionals: this.optionals };
  }

  constructor(
    @Inject(MAT_DIALOG_DATA) public readonly data: {
      dataModel: DataModel,
      entitySchema: EntitySchema,
      displayedColumns: IClientProperty[],
      additionalPropertyNames: IClientProperty[],
      preselectedProperties: IClientProperty[],
      type: 'list' | 'columns'
    },
    public dialogRef: MatDialogRef<AdditionalInfosComponent>) {
  }

  public ngOnInit(): void {
    this.possibleProperties = this.data.additionalPropertyNames.map(elem => elem)
      .concat(this.data.displayedColumns)
      .sort((elem1, elem2) => AdditionalInfosComponent.compareNames(elem1, elem2));

    this.optionals = this.data.preselectedProperties.filter(elem => this.isRemoveable(elem));
  }

  public drop(event: CdkDragDrop<string[]>): void {
    moveItemInArray(this.data.preselectedProperties, event.previousIndex, event.currentIndex);
  }

  public remove(property: IClientProperty): void {
    const position = this.data.preselectedProperties.findIndex(elem => elem.ColumnName === property.ColumnName);
    this.data.preselectedProperties.splice(position, 1);
  }

  public isChecked(property: IClientProperty): boolean {
    return this.data.preselectedProperties.find(elem => elem.ColumnName === property.ColumnName) != null;
  }

  public updateSelected(event: MatSelectionListChange): void {
    if (event.options[0].selected) {
      this.data.preselectedProperties.push(event.options[0].value);
      this.optionals.push(event.options[0].value);
    } else {
      let position = this.data.preselectedProperties.findIndex(elem => elem.ColumnName === event.options[0].value.ColumnName);
      this.data.preselectedProperties.splice(position, 1);

      position = this.optionals.findIndex(elem => elem.ColumnName === event.options[0].value.ColumnName);
      this.optionals.splice(position, 1);
    }
  }

  public isRemoveable(property: IClientProperty): boolean {
    return this.data.displayedColumns.find(elem => elem.ColumnName === property.ColumnName) == null;
  }

  private static compareNames(column1: IClientProperty, column2: IClientProperty): number {
    if (column1.Display == null || column2?.Display == null) {
      return column1.ColumnName?.localeCompare(column2.ColumnName);
    }
    return column1.ColumnName?.localeCompare(column2.ColumnName);
  }

}
