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

import { OverlayRef } from '@angular/cdk/overlay';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { EuiLoadingService } from '@elemental-ui/core';
import { CollectionLoadParameters } from 'imx-qbm-dbts';
import { O3tCommonTestData } from '../../test/o3t-common-test-mocks';
import { O3tTestBed } from '../../test/o3t-test-bed';
import { ApiService } from '../api.service';
import { TeamsService } from './teams.service';

describe('TeamsService', () => {
  let service: TeamsService;

  const mockO3tApiService = {
    typedClient: {
      PortalTargetsystemTeams: {
        Get: jasmine.createSpy('Get').and.returnValue(Promise.resolve({ Data: [{}]})),
        GetSchema: jasmine.createSpy('GetSchema').and.returnValue(O3tCommonTestData.teamSchemaMock)
      },
      PortalTargetsystemTeamsChannels: {
        Get: jasmine.createSpy('Get').and.returnValue(Promise.resolve({ Data: [{}]})),
        GetSchema: jasmine.createSpy('GetSchema').and.returnValue(O3tCommonTestData.teamChannelSchemaMock)
      }
    }
  };

  const mockBusyService = { show: jasmine.createSpy('show'), hide: jasmine.createSpy('hide') };
  let navigationState: CollectionLoadParameters;

  O3tTestBed.configureTestingModule({
    providers: [
      {
        provide: ApiService,
        useValue: mockO3tApiService
      },
      {
        provide: EuiLoadingService,
        useValue: mockBusyService
      }
    ]
  })

  beforeEach(() => {
    service = TestBed.inject(TeamsService);
    navigationState = { StartIndex: 1, PageSize: 50 };
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('GET teamsSchema() tests', () => {
    it('should return the teams schema', async () => {
      mockO3tApiService.typedClient.PortalTargetsystemTeams.GetSchema.calls.reset();
      expect(service.teamsSchema).toEqual(O3tCommonTestData.teamSchemaMock);
      expect(mockO3tApiService.typedClient.PortalTargetsystemTeams.GetSchema).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET teamChannelsSchema() tests', () => {
    it('should return the team channel schema', async () => {
      mockO3tApiService.typedClient.PortalTargetsystemTeamsChannels.GetSchema.calls.reset();
      expect(service.teamChannelsSchema).toEqual(O3tCommonTestData.teamChannelSchemaMock);
      expect(mockO3tApiService.typedClient.PortalTargetsystemTeamsChannels.GetSchema).toHaveBeenCalledTimes(1);
    });
  });

  describe('getTeams() tests', () => {
    it('should make a call to get the teams', async () => {
      mockO3tApiService.typedClient.PortalTargetsystemTeams.Get.calls.reset();
      const data = await service.getTeams(navigationState);
      expect(data).toBeDefined();
      expect(mockO3tApiService.typedClient.PortalTargetsystemTeams.Get).toHaveBeenCalledWith(navigationState);
    });
  });

  describe('getTeamChannels() tests', () => {
    it('should make a call to get the team channels', async () => {
      const mockTeamId = 'test-team-1';
      mockO3tApiService.typedClient.PortalTargetsystemTeamsChannels.Get.calls.reset();
      const data = await service.getTeamChannels(mockTeamId, navigationState);
      expect(data).toBeDefined();
      expect(mockO3tApiService.typedClient.PortalTargetsystemTeamsChannels.Get).toHaveBeenCalledWith(mockTeamId, navigationState);
    });
  });

  describe('handleOpenLoader() tests', () => {
    it(`should call the busy service to show a loader and store a reference to it
      when one is not already referenced`, () => {
        mockBusyService.show.calls.reset();
        service['busyIndicator'] = undefined;
        service.handleOpenLoader();
        expect(mockBusyService.show).toHaveBeenCalledTimes(1);

    });
    it(`should not call busy service show when a reference to one already exists`, () => {
      mockBusyService.show.calls.reset();
      service['busyIndicator'] = {} as OverlayRef;
      service.handleOpenLoader();
      expect(mockBusyService.show).not.toHaveBeenCalled();
    });
  });

  describe('handleCloseLoader() tests', () => {
    it(`should call the busy service to hide the loader and clear the reference to it
      when one is already referenced`, fakeAsync(() => {
        mockBusyService.hide.calls.reset();
        service['busyIndicator'] = {} as OverlayRef;
        service.handleCloseLoader();
        tick();
        expect(mockBusyService.hide).toHaveBeenCalledTimes(1);
        expect(service['busyIndicator']).toBeUndefined();

    }));
    it(`should not call busy service hide when a reference to a loader does not already exist`, fakeAsync(() => {
      mockBusyService.hide.calls.reset();
      service['busyIndicator'] = undefined;
      service.handleCloseLoader();
      tick();
      expect(mockBusyService.hide).not.toHaveBeenCalled();
    }));
  });
});
