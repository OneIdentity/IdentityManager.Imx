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

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatTreeModule } from '@angular/material/tree';
import { EuiCoreModule, EuiMaterialModule } from '@elemental-ui/core';
import { configureTestSuite } from 'ng-bullet';
import { LoggerTestingModule } from 'ngx-logger/testing';

import { DataTreeComponent } from './data-tree.component';
import { SnackBarService } from '../snackbar/snack-bar.service';
import { clearStylesFromDOM } from '../testing/clear-styles.spec';


@Component({
  selector: 'imx-checkable-tree',
  template: '<p>MockDataTree</p>'
})

class MockCheckableTree {
  @Input() public withMultiSelect: any;
  @Input() public selectedEntities: any;
  @Input() public database: any;
  @Input() public emptyNodeCaption:any;
  @Output() public checkedNodesChanged = new EventEmitter();
  @Output() public nodeSelected = new EventEmitter<any>();
}

@Component({
  selector: 'imx-data-tree-search-results',
  template: '<p>MockDataTree</p>'
})

class MockSearchResults {
  @Input() public withMultiSelect: any;
  @Input() public selectedEntities: any;
  @Input() public database: any;
  @Input() public searchString:any;
  @Output() public checkedNodesChanged = new EventEmitter();
  @Output() public nodeSelected = new EventEmitter<any>();
}

describe('DataTreeComponent', () => {
  let component: DataTreeComponent;
  let fixture: ComponentFixture<DataTreeComponent>;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [
        DataTreeComponent,
        MockCheckableTree,
        MockSearchResults
      ],
      imports: [
        LoggerTestingModule,
        EuiCoreModule,
        EuiMaterialModule,
        MatTreeModule,
        NoopAnimationsModule
      ],
      providers: [
        {
          provide: SnackBarService,
          useValue: {
            open: jasmine.createSpy('open')
          }
        },
      ]
    })
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DataTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

 
});
