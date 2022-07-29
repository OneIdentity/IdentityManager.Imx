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
import { EUI_SIDESHEET_DATA } from '@elemental-ui/core';

import { TypedEntityCandidateSidesheetComponent } from './typed-entity-candidate-sidesheet.component';
import { MetadataService } from '../../base/metadata.service';
import { DataTableModule } from '../../data-table/data-table.module';
import { DataSourceToolbarModule } from '../../data-source-toolbar/data-source-toolbar.module';
import { ImxTranslationProviderService } from '../../translation/imx-translation-provider.service';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('TypedEntityCandidateSidesheetComponent', () => {
  let component: TypedEntityCandidateSidesheetComponent;
  let fixture: ComponentFixture<TypedEntityCandidateSidesheetComponent>;
  const sidesheetData = [{
    GetEntity: () => ({ GetDisplay: () => 'item 1' })
  }];

  const metadataServiceStub = {
    tables: {},
    update: jasmine.createSpy('update')
  };
  
  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [ TypedEntityCandidateSidesheetComponent ],
      providers: [
        {
          provide: EUI_SIDESHEET_DATA,
          useValue: sidesheetData
        },
        {
          provide: MetadataService,
          useValue: metadataServiceStub
        },
        {
          provide: ImxTranslationProviderService,
          useValue: {}
        }
      ],
      imports: [
        NoopAnimationsModule,
        MatListModule,
        DataTableModule,
        DataSourceToolbarModule
      ]

    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TypedEntityCandidateSidesheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
