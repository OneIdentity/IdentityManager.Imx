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

import { Component, Input, OnInit } from '@angular/core';
import { EuiLoadingService, EuiSidesheetService } from '@elemental-ui/core';
import { OverlayRef } from '@angular/cdk/overlay';
import { TranslateService } from '@ngx-translate/core';
import { PageEvent } from '@angular/material/paginator';

import { PasswordItemData } from 'imx-api-qer';
import { MetadataService } from 'qbm';
import { CheckPasswordsComponent } from './check-passwords.component';
import { PasswordHelper } from './password-helper';
import { PasswordService } from './password.service';
import { PasswordItem } from './password-item';
import { Column, GetLocalDataForPage, IColumn } from './helpers.model';

@Component({
  selector: 'imx-password-reset',
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.scss'],
})
export class PasswordResetComponent implements OnInit {
  public myPasswordVisibility: boolean;
  public showHelper = true;
  public passwordItems: PasswordItem[];
  public passwordHelper = new PasswordHelper();
  public columnDefs: { [id: string]: Column } = {};
  public dataCollection: { totalCount: number; Data: PasswordItem[] };

  public readonly dataColumns = ['display', 'tabledisplay'];
  public readonly paginatorConfig = {
    index: 0,
    size: 5,
    sizeOptions: [5, 10, 20, 50, 100, 200, 500],
    showFirstLastButtons: false,
    hidden: false,
  };

  private stateCached: { page: number; pageSize: number; skip: number };

  /** Identifier of the identity to set a password for. If this is not set, the logged-in user will be used. */
  @Input() set uidPerson(val: string) {
    this.passwordHelper.uidPerson = val;
  }

  public get embedded(): boolean {
    return this.passwordHelper.embedded;
  }
  @Input() public set embedded(val: boolean) {
    this.passwordHelper.embedded = val;
  }

  constructor(
    private readonly sideSheet: EuiSidesheetService,
    private readonly busy: EuiLoadingService,
    private readonly metadataSvc: MetadataService,
    private passwordSvc: PasswordService,
    private translate: TranslateService
  ) {
    this.addColumnDef({
      id: 'display',
      title: '#LDS#User account',
      getValue: (row: PasswordItem) => row.display,
    });

    this.addColumnDef({
      id: 'tabledisplay',
      title: '#LDS#Type',
      getValue: (row: PasswordItem) => row.tableDisplay,
    });

    this.addColumnDef({
      id: 'lastset',
      title: '#LDS#Last changed on',
      getValue: (row: PasswordItem) => row.dataItem.PasswordLastSet,
    });

    this.addColumnDef({
      id: 'actions',
      title: '#LDS#Type',
      getValue: (row: PasswordItem) => row.dataItem,
    });
  }

  public getDateDisplay(row: PasswordItem): string {
    const pls = row.dataItem.PasswordLastSet;
    if (!pls) { return ''; }
    const date = pls instanceof Date ? pls : new Date(pls);
    return date.toLocaleDateString(this.translate.currentLang);
  }

  public async ngOnInit(): Promise<void> {
    let overlayRef: OverlayRef;
    setTimeout(() => (overlayRef = this.busy.show()));
    try {
      this.passwordHelper.passwordItemData = await this.passwordSvc.getPasswordItems(this.passwordHelper.uidPerson);
      this.passwordItems = this.passwordHelper.passwordItemData.Items.map((elem) => new PasswordItem(elem));
    } finally {
      setTimeout(() => this.busy.hide(overlayRef));
    }

    await this.metadataSvc.update(this.passwordItems.map((elem) => elem.tableName));
    for (const p of this.passwordItems) {
      p.tableDisplay = this.metadataSvc.tables[p.tableName].DisplaySingular;
    }

    this.updateDataCollection();
  }

  public async enterPassword(item: PasswordItemData): Promise<void> {
    this.passwordHelper.selectItem(item);
    this.sideSheet.open(CheckPasswordsComponent, {
      title: await this.translate.get('#LDS#Heading Set New Password').toPromise(),
      padding: '0px',
      width: '50%',
      icon: 'password',
      disableClose: true,
      testId: 'set-new-password-sidesheet',
      data: this.passwordHelper,
    });
  }

  public handlePage(e: PageEvent): void {
    this.updateDataCollection({
      skip: e.pageIndex * e.pageSize,
      page: e.pageIndex,
      pageSize: e.pageSize,
    });
  }

  public onHelperDismissed(): void {
    this.showHelper = false;
  }

  private addColumnDef(def: IColumn): void {
    const column = new Column();
    column.id = def.id;
    column.title = def.title;
    column.getValue = def.getValue;
    this.columnDefs[def.id] = column;
  }

  private updateDataCollection(state?: { page: number; pageSize: number; skip: number }): void {
    if (state) {
      this.stateCached = state;
    }
    if (!this.stateCached) {
      this.stateCached = {
        skip: this.paginatorConfig.index * this.paginatorConfig.size,
        page: this.paginatorConfig.index,
        pageSize: this.paginatorConfig.size,
      };
    }

    this.dataCollection = {
      totalCount: this.passwordItems.length,
      Data: GetLocalDataForPage(this.passwordItems, this.stateCached),
    };
  }
}
