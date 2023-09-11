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
 * Copyright 2023 One Identity LLC.
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

import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MockBuilder, MockedComponentFixture, MockRender } from 'ng-mocks';

import { OpSupportUserService } from 'qer';
import { PermissionsService } from './permissions.service';

describe('PermissionsService', () => {
  let service: PermissionsService;
  let fixture: MockedComponentFixture<PermissionsService>;

  let userGroups: {
    Name: string;
  }[] = [];

  beforeEach(() => {
    return MockBuilder([PermissionsService])
      .mock(OpSupportUserService, {
        getGroups: jasmine.createSpy('userGroups').and.callFake(() => userGroups),
      })
      .beforeCompileComponents(testBed => {
        testBed.configureTestingModule({
          schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });
      });
  });

  beforeEach(() => {
    fixture = MockRender(PermissionsService);
    service = fixture.point.componentInstance;
    fixture.detectChanges();
  });

  for (const testcase of [
    { userGroups: [], canSee: false },
    { userGroups: [{ Name: 'wrong' }], canSee: false },
    { userGroups: [{ Name: 'QER_4_ManageOutstanding' }], canSee: true },
  ]) {
    it('checks permissions for outstanding managers', async () => {
      userGroups = testcase.userGroups;

      expect(await service.isOutstandingManager()).toEqual(testcase.canSee);
    });
  };
});
