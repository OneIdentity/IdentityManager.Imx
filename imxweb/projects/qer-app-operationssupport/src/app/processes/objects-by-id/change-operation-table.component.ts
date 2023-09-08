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

import { Component, OnInit, Input } from "@angular/core";
import { EuiSidesheetService } from "@elemental-ui/core";
import { TranslateService } from "@ngx-translate/core";
import { HistoryOperation, ChangeType } from "imx-api-qbm";
import { ChangeOperationSidesheetComponent } from "./change-operation-sidesheet/change-operation-sidesheet.component";

interface IColumn {
  id: string;
  title: string;
  getValue: (row: HistoryOperation) => string;
}
class Column implements IColumn {
  public id: string;
  public getTitle: () => string;
  public getValue: (row: HistoryOperation) => string;
  public title: string;
}

@Component({
  templateUrl: './change-operation-table.component.html',
  selector: 'imx-change-operation-table',
  styleUrls: ['./change-operation-table.component.scss']
})
export class ChangeOperationTableComponent implements OnInit {

  constructor(private translationProvider: TranslateService,
    private sidesheet: EuiSidesheetService,
  ) {
  }

  @Input() public data: HistoryOperation[] = [];

  public columnDefs: Column[] = [];

  public get columns(): string[] {
    return this.columnDefs.map(c => c.id);
  }

  ngOnInit(): void {
    this.changeTypeTableColumn();
  }

  private async addColumnDef(def: IColumn): Promise<void> {
    const column = new Column();
    column.id = def.id;
    column.title = await this.translationProvider.get(def.title).toPromise();
    column.getValue = def.getValue;
    column.getTitle = () => column.title;
    this.columnDefs.push(column);
  }

  private async changeTypeTableColumn(){
    await this.addColumnDef({
      id: 'ChangeTime',
      title: '#LDS#Operation performed on',
      getValue: (row: HistoryOperation) => new Date(row.ChangeTime).toLocaleString(this.translationProvider.currentLang)
    });
    await this.addColumnDef({
      id: 'ChangeType',
      title: '#LDS#Type of operation',
      getValue: (row: HistoryOperation) => Object.values(ChangeType)[row.ChangeType].toString()
    });
    await this.addColumnDef({
      id: 'ObjectDisplay',
      title: '#LDS#Object name',
      getValue: (row: HistoryOperation) => row.ObjectDisplay
    });
    await this.addColumnDef({
      id: 'DisplayType',
      title: '#LDS#Object type',
      getValue: (row: HistoryOperation) => row.DisplayType
    });
    await this.addColumnDef({
      id: 'User',
      title: '#LDS#Operation performed by',
      getValue: (row: HistoryOperation) => row.User
    });
  }

  public async displayChangedPropertyListSidesheet(row: HistoryOperation) {
    if (row.Columns && row.Columns.length > 0) {
      let title = await this.translationProvider.get('#LDS#Heading View Operation Details').toPromise();
      let subtitle = await this.translationProvider.get('#LDS#Type of operation').toPromise() + Object.values(ChangeType)[row.ChangeType].toString();

      if( row.ObjectDisplay)
        subtitle += await this.translationProvider.get('#LDS#Object').toPromise() + row.ObjectDisplay

      this.sidesheet.open(ChangeOperationSidesheetComponent,
        {
          title: title,
          subTitle: subtitle ,
          width: 'max(400px, 40%)',
          data: row,
          testId: 'data-change-details-sidesheet'
        }
      );
    }
  }
}
