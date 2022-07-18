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
import { MatDialogModule } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { DynamicTabDataProviderDirective } from 'qbm';
import { AadCommonTestData } from '../../../test/aad-common-test-mocks';
import { AadTestBed } from '../../../test/aad-test-bed';
import { AadPermissionsService } from '../../admin/aad-permissions.service';
import { AzureAdService } from '../azure-ad.service';
import { AadUserDeniedPlansComponent } from './aad-user-denied-plans.component';

describe('AadUserDeniedPlansComponent', () => {
  let component: AadUserDeniedPlansComponent;
  let fixture: ComponentFixture<AadUserDeniedPlansComponent>;

  AadTestBed.configureTestingModule({
    declarations: [ AadUserDeniedPlansComponent ],
    imports: [
      MatDialogModule,
      NoopAnimationsModule
    ],
    providers: [
      {
        provide: AzureAdService,
        useValue: AadCommonTestData.mockAzureAdService
      },
      {
        provide: AadPermissionsService,
        useValue: {
          canReadInAzure: jasmine.createSpy('canReadInAzure').and.returnValue(Promise.resolve(true))
        }
      },
      {
        provide: DynamicTabDataProviderDirective,
        useValue: {data: {referrer: {Keys: ['key1']}}}
      }
    ]
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AadUserDeniedPlansComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

