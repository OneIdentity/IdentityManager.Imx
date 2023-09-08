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

import { Component, Inject } from '@angular/core';
import { EuiSidesheetRef, EuiSidesheetService, EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';

import { IForeignKeyInfo, TypedEntity } from 'imx-qbm-dbts';
import { TypedEntityCandidateSidesheetComponent } from '../../typed-entity-candidate-sidesheet/typed-entity-candidate-sidesheet.component';
import { TypedEntityFkData } from '../typed-entity-fk-data.interface';

@Component({
  selector: 'imx-typed-entity-selector',
  templateUrl: './typed-entity-selector.component.html',
  styleUrls: ['./typed-entity-selector.component.scss']
})
export class TypedEntitySelectorComponent {
  public selectedItems: TypedEntity[];
  public selectedFkTable: IForeignKeyInfo;

  // TODO: Check Upgrade
  public readonly fkRelationData: TypedEntityFkData;

  constructor(
    @Inject(EUI_SIDESHEET_DATA) data: TypedEntityFkData,
    private sidesheet: EuiSidesheetService,
    private readonly translate: TranslateService,
    private readonly sideSheetRef: EuiSidesheetRef
  ) {
    this.fkRelationData = data;

    this.selectedItems = data.preselectedEntities?.slice();

    if (data.fkTables?.length > 0) {
      this.selectedFkTable = this.getTable(data.preselectedTableName) ?? data.fkTables[0];
    }
  }

  public selectionChanged(items: TypedEntity[]): void {
    this.selectedItems = items;
  }

  public applySelection(selected?: TypedEntity): void {
    if (selected) {
      this.selectedItems = [selected];
    }

    this.sideSheetRef.close(this.selectedItems);
  }

  public tableSelectionChanged(tableName: string): void {
    this.selectedFkTable = this.getTable(tableName);
  }


  public async showSelected(): Promise<void> {
    this.sidesheet.open(TypedEntityCandidateSidesheetComponent, {
      title: await this.translate.get('#LDS#Heading Selected Items').toPromise(),
      padding: '0',
      width: 'max(550px, 55%)',
      testId: 'typed-entity-selector-candidates-sidesheet',
      data: { entities: this.selectedItems, tables: this.fkRelationData.fkTables?.map(elem => elem.TableName) }
    }
    );
  }

  private getTable(tableName: string): IForeignKeyInfo {
    return this.fkRelationData.fkTables.find(item => item.TableName === tableName);
  }
}
