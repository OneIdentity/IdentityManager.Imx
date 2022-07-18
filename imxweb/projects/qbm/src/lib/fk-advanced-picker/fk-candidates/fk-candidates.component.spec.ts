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
import { EuiLoadingService } from '@elemental-ui/core';
import { TypedEntity } from 'imx-qbm-dbts';
import { configureTestSuite } from 'ng-bullet';

import { clearStylesFromDOM } from '../../testing/clear-styles.spec';
import { FkCandidateEntityBuilderService } from './fk-candidate-entity-builder.service';
import { FkCandidatesData } from './fk-candidates-data.interface';
import { FkCandidatesComponent } from './fk-candidates.component';

describe('FkCandidatesComponent', () => {
  let component: FkCandidatesComponent;
  let fixture: ComponentFixture<FkCandidatesComponent>;

  configureTestSuite(() =>
    TestBed.configureTestingModule({
      declarations: [
        FkCandidatesComponent
      ],
      providers: [
        {
          provide: EuiLoadingService,
          useValue: {
            show: () => {},
            hide: () => {}
          }
        },
        {
          provide: FkCandidateEntityBuilderService,
          useValue: {
            build: entityCollectionData => ({
              totalCount: entityCollectionData.TotalCount,
              Data: entityCollectionData.Entities.map(__ => ({} as TypedEntity))
            })
          }
        }
      ]
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(FkCandidatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get data', async () => {
    // Arrange:
    component.settings = undefined;

    component.data = {
      get: __ => Promise.resolve({ TotalCount: 1, Entities: [{}] })
    } as FkCandidatesData;

    // Act:
    await component.getData();

    // Assert:
    expect(component.settings.dataSource.totalCount).toEqual(1);
  });
});
