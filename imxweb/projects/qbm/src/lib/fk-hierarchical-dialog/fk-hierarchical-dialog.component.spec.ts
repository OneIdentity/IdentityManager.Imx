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
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { configureTestSuite } from 'ng-bullet';
import { LoggerTestingModule } from 'ngx-logger/testing';
import { EuiLoadingService, EuiSidesheetRef, EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { of } from 'rxjs';
import { MatCardModule } from '@angular/material/card';

import { MetadataService } from '../base/metadata.service';
import { clearStylesFromDOM } from '../testing/clear-styles.spec';
import { ConfirmationService } from '../confirmation/confirmation.service';
import { FkHierarchicalDialogComponent } from './fk-hierarchical-dialog.component';

@Component({
  selector: 'imx-data-tree',
  template: '<p>MockDataTree</p>'
})

class MockDataTree {
  @Input() public withMultiSelect: any;
  @Input() public selectedEntities: any;
  @Input() public database: any;
  @Output() public checkedNodesChanged = new EventEmitter<any>();
  @Output() public nodeSelected = new EventEmitter<any>();
}

const fkInfo = [
  { TableName: 'testtable1', ColumnName: 'testcolumn1', Get: _ => undefined },
  { TableName: 'testtable2', ColumnName: 'testcolumn2', Get: _ => undefined }
];

[
  { fkRelations: fkInfo, expectedMetadataCall: 1 },
  { fkRelations: [], expectedMetadataCall: 0 },
  { fkRelations: undefined, expectedMetadataCall: 0 }
].forEach(testcase =>
  describe('FkHierarchicalDialogComponent', () => {
    let component: FkHierarchicalDialogComponent;
    let fixture: ComponentFixture<FkHierarchicalDialogComponent>;

    const metadataServiceStub = {
      tables: {},
      update: jasmine.createSpy('update')
    };

    let confirm = true;
    const mockConfirmationService = {
      confirmLeaveWithUnsavedChanges: jasmine.createSpy('confirmLeaveWithUnsavedChanges')
        .and.callFake(() => Promise.resolve(confirm))
    }

    configureTestSuite(() => {
      TestBed.configureTestingModule({
        declarations: [
          MockDataTree,
          FkHierarchicalDialogComponent
        ],
        imports: [
          FormsModule,
          MatButtonModule,
          MatInputModule,
          MatSelectModule,
          MatTableModule,
          MatPaginatorModule,
          MatCardModule,
          MatRadioModule,
          LoggerTestingModule
        ],
        providers: [
          {
            provide: EUI_SIDESHEET_DATA,
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
            provide: EuiSidesheetRef,
            useValue: {
              closeClicked: jasmine.createSpy('closeClicked').and.returnValue(of(undefined))
            }
          },
          {
            provide: ConfirmationService,
            useValue: mockConfirmationService
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
      fixture = TestBed.createComponent(FkHierarchicalDialogComponent);
      component = fixture.componentInstance;
    });


    afterAll(() => {
      clearStylesFromDOM();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

  }));
