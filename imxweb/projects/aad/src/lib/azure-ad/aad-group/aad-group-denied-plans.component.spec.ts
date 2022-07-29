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

import { DynamicTabDataProviderDirective } from 'qbm';
import { AadCommonTestData } from '../../../test/aad-common-test-mocks';
import { AadTestBed } from '../../../test/aad-test-bed';
import { AzureAdService } from '../azure-ad.service';
import { AadGroupDeniedPlansComponent } from './aad-group-denied-plans.component';

describe('AadGroupDeniedPlansComponent', () => {
  let component: AadGroupDeniedPlansComponent;
  let fixture: ComponentFixture<AadGroupDeniedPlansComponent>;

  AadTestBed.configureTestingModule({
    declarations: [ AadGroupDeniedPlansComponent ],
    imports: [],
    providers: [
      {
        provide: AzureAdService,
        useValue: AadCommonTestData.mockAzureAdService
      },
      {
        provide: DynamicTabDataProviderDirective,
        useValue: {data: {referrer: {Keys: ['key1']}}}
      }
    ]
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AadGroupDeniedPlansComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
