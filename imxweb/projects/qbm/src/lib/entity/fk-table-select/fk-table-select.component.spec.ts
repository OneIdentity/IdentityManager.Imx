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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { EuiCoreModule } from '@elemental-ui/core';
import { IForeignKeyInfo } from 'imx-qbm-dbts';
import { configureTestSuite } from 'ng-bullet';

import { MetadataService } from '../../base/metadata.service';
import { clearStylesFromDOM } from '../../testing/clear-styles.spec';
import { FkTableSelectComponent } from './fk-table-select.component';

describe('FkTableSelectComponent', () => {
  let component: FkTableSelectComponent;
  let fixture: ComponentFixture<FkTableSelectComponent>;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [
        FkTableSelectComponent
      ],
      imports: [
        EuiCoreModule,
        NoopAnimationsModule,
        MatProgressSpinnerModule
      ],
      providers: [
        {
          provide: MetadataService,
          useValue: {
            tables: {},
            updateNonExisting: __ => Promise.resolve({})
          }
        }
      ]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FkTableSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', async () => {
    const fkInfo = { TableName: 'some table name' };
    component.fkTables = [fkInfo as IForeignKeyInfo];

    await component.ngOnInit();

    expect(component.options[0].display).toEqual(fkInfo.TableName);
    expect(component.options[0].value).toEqual(fkInfo.TableName);
  });
});
