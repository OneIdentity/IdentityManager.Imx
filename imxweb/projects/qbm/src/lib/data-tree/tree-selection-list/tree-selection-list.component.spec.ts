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


import { MatListModule } from '@angular/material/list';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { configureTestSuite } from 'ng-bullet';
import { EuiSidesheetRef, EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { MatCardModule } from '@angular/material/card';

import { TreeSelectionListComponent } from './tree-selection-list.component';
import { MetadataService } from '../../base/metadata.service';


describe('TreeSelectionListComponent', () => {
  let component: TreeSelectionListComponent;
  let fixture: ComponentFixture<TreeSelectionListComponent>;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [TreeSelectionListComponent],
      providers: [
        {
          provide: EuiSidesheetRef,
          useValue: {}
        },
        {
          provide: EUI_SIDESHEET_DATA,
          useValue: [{
            GetDisplayLong: () => 'item 1',
            GetKeys: () => ['key1', 'key2'],
            GetColumn: (elem) => ({
              GetValue: () => '<Key><T>tableDummy</T><P>key1</P></Key>'
            })
          }]
        },
        {
          provide: MetadataService,
          useValue: {
            tables: { tableDummy: { DisplaySingular: 'test table dummy' } },
            update: jasmine.createSpy('update')
          }
        }
      ],
      imports: [
        MatListModule,
        MatCardModule
      ]

    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TreeSelectionListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
