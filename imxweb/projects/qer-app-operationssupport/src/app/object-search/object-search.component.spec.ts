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
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { configureTestSuite } from 'ng-bullet';

import { ObjectSearchComponent } from './object-search.component';
import { EntityData, DbObjectKey } from 'imx-qbm-dbts';
import { imx_QBM_SearchService, MetadataService, DbObjectInfo, clearStylesFromDOM } from 'qbm';
import { EuiLoadingService } from '@elemental-ui/core';

describe('ObjectSearchComponent', () => {
  let component: ObjectSearchComponent;
  let fixture: ComponentFixture<ObjectSearchComponent>;

  const RouterNavigateSpy = jasmine.createSpy('navigate');

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule
      ],
      declarations: [
        ObjectSearchComponent
      ],
      schemas: [
        NO_ERRORS_SCHEMA
      ],
      providers: [
        {
          provide: Router,
          useClass: class {
            navigate = RouterNavigateSpy;
          }
        },
        {
          provide: imx_QBM_SearchService,
          useClass: class {
            search(term: string, tables: string): Promise<any[]> {
              return Promise.resolve([term, tables]);
            }
            getIndexedTables(): Promise<EntityData[]> {
              return Promise.resolve([]);
            }
          }
        },
        {
          provide: MetadataService,
          useClass: class {
            GetTableMetadata = jasmine.createSpy('GetTableMetadata').and.returnValue(
              Promise.resolve({
                Columns: {},
                Display: 'tableDisplayDummy',
                DisplaySingular: 'tableDisplaySingularDummy',
                ImageId: '',
                IsDeactivated: false,
                IsMAllTable: false,
                IsMNTable: false
              })
            );
          }
        }
      ]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ObjectSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });

  it('should navigate to item, if ItemSelected(item) is called', () => {
    const db: DbObjectInfo = {
      Display: 'Test',
      Key: new DbObjectKey('Person', 'Uid_1')
    };

    const expectedRoute = '/object/' + db.Key.TableName + '/' + db.Key.Keys[0];

    fixture.componentInstance.itemSelected(db);

    expect(RouterNavigateSpy).toHaveBeenCalledWith([expectedRoute]);
  });
});
