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
 * Copyright 2021 One Identity LLC.
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

import { TestBed } from '@angular/core/testing';
import { configureTestSuite } from 'ng-bullet';

import { UserModelService } from './user-model.service';
import { QerApiService } from '../qer-api-client.service';

xdescribe('UserModelService', () => {
  const userGroups = [{}];

  const sessionServiceStub = {
    client: {
      portal_person_config_get: jasmine.createSpy('portal_person_config_get').and.returnValue(Promise.resolve([{}])),
      portal_pendingitems_get: jasmine.createSpy('portal_pendingitems_get').and.returnValue(Promise.resolve([{}])),
      portal_usergroups_get: jasmine.createSpy('portal_usergroups_get').and.returnValue(Promise.resolve(userGroups))
    }
  };

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      providers: [
        UserModelService,
        {
          provide: QerApiService,
          useValue: sessionServiceStub
        }
      ]
    });
  });

  beforeEach(() => {
    sessionServiceStub.client.portal_person_config_get.calls.reset();
    sessionServiceStub.client.portal_pendingitems_get.calls.reset();
    sessionServiceStub.client.portal_usergroups_get.calls.reset();
  });

  it('should be created', () => {
    const service: UserModelService = TestBed.get(UserModelService);
    expect(service).toBeTruthy();
  });


  it('should get user config', async () => {
    // Arrange
    const service: UserModelService = TestBed.get(UserModelService);

    // Act
    await service.getUserConfig();

    // Assert
    expect(sessionServiceStub.client.portal_person_config_get).toHaveBeenCalled();
  });

  it('should get pending items', async () => {
    // Arrange
    const service: UserModelService = TestBed.get(UserModelService);

    // Act
    await service.getPendingItems();

    // Assert
    expect(sessionServiceStub.client.portal_pendingitems_get).toHaveBeenCalled();
  });

  it('provides a get method for user groups', async () => {
    const service: UserModelService = TestBed.get(UserModelService);

    expect((await service.getGroups()).length).toEqual(userGroups.length);
    expect(sessionServiceStub.client.portal_usergroups_get).toHaveBeenCalled();
  });
});
