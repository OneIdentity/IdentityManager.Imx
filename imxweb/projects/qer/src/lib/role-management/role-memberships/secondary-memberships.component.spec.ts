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
import { EuiLoadingService, EuiSidesheetService } from '@elemental-ui/core';
import { TypedEntity } from 'imx-qbm-dbts';
import { configureTestSuite } from 'ng-bullet';

import { clearStylesFromDOM, ConfirmationService, SnackBarService } from 'qbm';
import { RoleService } from '../role.service';
import { SecondaryMembershipsComponent } from './secondary-memberships.component';

describe('SecondaryMembershipsComponent', () => {
  let component: SecondaryMembershipsComponent;
  let fixture: ComponentFixture<SecondaryMembershipsComponent>;

  const euiLoadingServiceStub = {
    hide: jasmine.createSpy('hide'),
    show: jasmine.createSpy('show'),
  };

  const mockConfirmationService = {
    confirm: jasmine.createSpy('confirmDelete').and.callFake(() => Promise.resolve(true)),
  };

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [SecondaryMembershipsComponent],
      providers: [
        {
          provide: EuiSidesheetService,
          useValue: {},
        },
        {
          provide: RoleService,
          useValue: {
            GetUidPerson: jasmine.createSpy('GetUidPerson'),
            getMemberships: jasmine.createSpy('getMemberships'),
            getMembershipEntitySchema: jasmine.createSpy('getMembershipEntitySchema'),
          },
        },
        {
          provide: EuiLoadingService,
          useValue: euiLoadingServiceStub,
        },
        { provide: ConfirmationService, useValue: mockConfirmationService },
        {
          provide: SnackBarService,
          useValue: {
            open: jasmine.createSpy('open'),
          },
        },
      ],
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SecondaryMembershipsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterAll(() => {
    clearStylesFromDOM();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  for (const testcase of [
    {
      description: 'could click the delete-button, because one entity was selected',
      selectedEntities: [{}] as TypedEntity[],
      expectedResult: true,
    },
    {
      description: 'could not click the delete-button, because no entity was selected',
      selectedEntities: [] as TypedEntity[],
      expectedResult: false,
    },
  ]) {
    it(testcase.description, () => {
      component['selectedEntities'] = testcase.selectedEntities;
      expect(component.canDeleteAllSelected()).toBe(testcase.expectedResult);
    });
  }
});
