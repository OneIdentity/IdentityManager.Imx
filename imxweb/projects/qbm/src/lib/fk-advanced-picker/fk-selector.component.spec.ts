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

import { FormsModule } from '@angular/forms';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { configureTestSuite } from 'ng-bullet';
import { LoggerTestingModule } from 'ngx-logger/testing';
import { EuiLoadingService } from '@elemental-ui/core';

import { MetadataService } from '../base/metadata.service';
import { clearStylesFromDOM } from '../testing/clear-styles.spec';
import { FkSelectorComponent } from './fk-selector.component';
import { IForeignKeyInfo } from 'imx-qbm-dbts';

const fkInfo = [
  { TableName: 'testtable1', ColumnName: 'testcolumn1', Get: _ => undefined, GetDataModel: _ => ({ Filters: [] }), GetFilterTree: _ => ({ Elements: [] }) },
  { TableName: 'testtable2', ColumnName: 'testcolumn2', Get: _ => undefined, GetDataModel: _ => ({ Filters: [] }), GetFilterTree: _ => ({ Elements: [] }) }
];

[
  { fkRelations: fkInfo, expectedMetadataCall: 1 },
  { fkRelations: [], expectedMetadataCall: 0 },
  { fkRelations: undefined, expectedMetadataCall: 0 }
].forEach(testcase =>
  describe('FkSelectorComponent', () => {
    let component: FkSelectorComponent
    let fixture: ComponentFixture<FkSelectorComponent>;

    const metadataServiceStub = {
      tables: {},
      update: jasmine.createSpy('update')
    };

    configureTestSuite(() => {
      TestBed.configureTestingModule({
        declarations: [
          FkSelectorComponent
        ],
        imports: [
          FormsModule,
          MatButtonModule,
          MatInputModule,
          MatSelectModule,
          MatTableModule,
          MatPaginatorModule,
          MatRadioModule,
          LoggerTestingModule
        ],
        providers: [
          {
            provide: MAT_DIALOG_DATA,
            useValue: {
              fkRelations: testcase.fkRelations,
              displayValue: 'some title'
            }
          },
          {
            provide: MetadataService,
            useValue: metadataServiceStub
          },
          {
            provide: MatDialogRef,
            useValue: {}
          },
          {
            provide: EuiLoadingService,
            useValue: {
              show: () => { },
              hide: () => { }
            }
          },
        ]
      });
    });

    beforeEach(() => {
      fixture = TestBed.createComponent(FkSelectorComponent);
      component = fixture.componentInstance;
    });


    afterAll(() => {
      clearStylesFromDOM();
    });

    it('should call update meta data on init', fakeAsync(() => {
      component.data = { fkRelations: testcase.fkRelations as unknown as IForeignKeyInfo[] }
      fixture.detectChanges();

      tick(Infinity);

      expect(metadataServiceStub.update).toHaveBeenCalledTimes(testcase.expectedMetadataCall);
    }));


  }));
