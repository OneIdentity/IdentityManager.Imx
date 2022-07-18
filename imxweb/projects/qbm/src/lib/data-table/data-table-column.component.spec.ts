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
 * Copyright 2022 One Identity LLC.
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

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { EuiCoreModule, EuiMaterialModule } from '@elemental-ui/core';
import { configureTestSuite } from 'ng-bullet';

import { ValType } from 'imx-qbm-dbts';

import { DataTableColumnComponent } from './data-table-column.component';
import { ImxTranslationProviderService } from '../translation/imx-translation-provider.service';
import { clearStylesFromDOM } from '../testing/clear-styles.spec';

describe('DataTableColumnComponent', () => {
  let component: DataTableColumnComponent<any>;
  let fixture: ComponentFixture<DataTableColumnComponent<any>>;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [DataTableColumnComponent],
      imports: [
        CommonModule,
        BrowserModule,
        EuiCoreModule,
        EuiMaterialModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatPaginatorModule,
        MatSortModule,
        MatTableModule,
        MatButtonModule,
        MatMenuModule,
        MatDividerModule,
        MatSidenavModule,
        MatCardModule,
        MatToolbarModule,
        NoopAnimationsModule
      ],
      providers: [
        {
          provide: ImxTranslationProviderService,
          useClass: class { }
        }
      ]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DataTableColumnComponent);
    component = fixture.componentInstance;
    component.entityColumn = {
      ColumnName: "MessageDate",
      Type: ValType.Date
    }
    fixture.detectChanges();
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });
});
