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
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { EuiCoreModule, EuiLoadingService } from '@elemental-ui/core';
import { configureTestSuite } from 'ng-bullet';

import { DataTreeModule } from '../../data-tree/data-tree.module';
import { LdsReplaceModule } from '../../lds-replace/lds-replace.module';
import { clearStylesFromDOM } from '../../testing/clear-styles.spec';
import { FilterTreeEntityWrapperService } from './filter-tree-entity-wrapper.service';
import { FilterTreeComponent } from './filter-tree.component';

describe('FilterTreeComponent', () => {
  let component: FilterTreeComponent;
  let fixture: ComponentFixture<FilterTreeComponent>;

  const dialogData = {
    filterTreeParameter: {filterMethode: _ => {return {Elements:[]}}}
  }

  const entityService = {
    convertToEntities: jasmine.createSpy('convertToEntities').and.returnValue(Promise.resolve([]))
  };

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [FilterTreeComponent],
      imports: [
        MatDialogModule,
        MatMenuModule,
        DataTreeModule,
        EuiCoreModule,
        LdsReplaceModule
      ],
      providers: [
        {
          provide: EuiLoadingService,
          useValue: {
            hide: jasmine.createSpy('hide'),
            show: jasmine.createSpy('show')
          }
        },
        {
          provide: MatDialogRef,
          useValue: {
            close: jasmine.createSpy('close')
          }
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: dialogData
        },
        {
          provide: FilterTreeEntityWrapperService,
          useValue: entityService
        }
      ]
    })
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FilterTreeComponent);
    component = fixture.componentInstance;
  });

  afterAll(() => {
    clearStylesFromDOM();
  });


  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
