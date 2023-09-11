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

import { PortalTargetsystemTeams } from 'imx-api-o3t';
import { IEntityColumn, IEntity } from 'imx-qbm-dbts';
import { ISessionState } from 'qbm';
import { Subject } from 'rxjs';

export class O3tCommonTestData {

  public static mockConfigService: any = {
    getConfig: () => {
      return Promise.resolve({
        PersonConfig: {
          VI_MyData_WhitePages_ResultAttributes: {
            Columns: ['col1', 'col2']
          },
          VI_PersonalData_Fields: {
            Columns: ['col1', 'col2']
          }
        }
      });
    }
  };

  public static mockAppConfigService: any = {
    Config: {
      Title: '',
      routeConfig: {
        start: 'dashboard'
      }
    },
    client: {
      imx_multilanguage_getcaptions_get: () => Promise.resolve({}),
      imx_multilanguage_translations_get: () => Promise.resolve({})
    }
  };

  public static mockAuthenticationServiceStub = {
    onSessionResponse: new Subject<ISessionState>(),
    update: jasmine.createSpy('update')
  };

  public static mockSessionService: any = {
    TypedClient: {
      PortalTargetsystemUnsGroup: {
        Get: () => Promise.resolve({})
      },
      PortalTargetsystemUnsAccount: {
        Get: () => Promise.resolve({})
      },
      PortalPersonAll: {
        Get: () => Promise.resolve({})
      },
      PortalAdminPerson: {
        Get: () => Promise.resolve({})
      },
      PortalPerson: {
        Get: () => Promise.resolve({Data: ['test1', 'test2']})
      },
    }
  };

  public static teamSchemaMock: any = {
    Columns: {
      __Display: {},
      UID_O3EUnifiedGroup: {},
      WebUrl: {}
    }
  };

  public static teamChannelSchemaMock: any = {
    Columns: {
      DisplayName: {},
      Description: {},
      WebUrl: {}
    }
  };

  public static mockTeamsService = {
    teamsSchema: O3tCommonTestData.teamSchemaMock,
    teamChannelsSchema: O3tCommonTestData.teamChannelSchemaMock,
    getTeams: jasmine.createSpy('getTeams').and.returnValue(Promise.resolve({ Data: []})),
    getTeamChannels: jasmine.createSpy('getTeamChannels').and.returnValue(Promise.resolve({ Data: []})),
    handleOpenLoader: jasmine.createSpy('handleOpenLoader'),
    handleCloseLoader: jasmine.createSpy('handleCloseLoader'),
  };

  public static mockEntityColumn = {
    ColumnName: '',
    GetMetadata: () => {
      return {
        CanEdit: () =>  false,
        GetDisplay: () => '',
        GetMinLength: () => 0
      };
    },
    GetValue: () => ''

  } as IEntityColumn;

  public static mockEntityColumnWithValue = {
    ColumnName: '',
    GetMetadata: () => {
      return {
        CanEdit: () =>  false,
        GetDisplay: () => '',
        GetMinLength: () => 0
      };
    },
    GetValue: () => 'Test value 1'

  } as IEntityColumn;

  public static mockEntity = {
    GetDisplay: () => 'Display value',
    GetKeys: () => ['1'],
    GetColumn: (name) => O3tCommonTestData.mockEntityColumn,
    Commit: () => Promise.resolve()
  } as IEntity;

  public static mockTeam = {
    GetEntity: () => O3tCommonTestData.mockEntity,
    tmsAllowDeleteChannels: { Column: O3tCommonTestData.mockEntityColumn },
    tmsAllowCreateUpdateRemoveTabs: { Column: O3tCommonTestData.mockEntityColumn },
    tmsAllowCreateUpdateRemoveConn: { Column: O3tCommonTestData.mockEntityColumn },
    tmsAllowCreateUpdateChannels: { Column: O3tCommonTestData.mockEntityColumn },
    tmsAllowAddRemoveApps: { Column: O3tCommonTestData.mockEntityColumn },
    msAllowUserEditMessages: { Column: O3tCommonTestData.mockEntityColumn },
    msAllowUserDeleteMessages: { Column: O3tCommonTestData.mockEntityColumn },
    msAllowTeamMentions: { Column: O3tCommonTestData.mockEntityColumn },
    msAllowOwnerDeleteMessages: { Column: O3tCommonTestData.mockEntityColumn },
    msAllowChannelMentions: { Column: O3tCommonTestData.mockEntityColumn },
    gsAllowDeleteChannels: { Column: O3tCommonTestData.mockEntityColumn },
    IsArchived: { Column: O3tCommonTestData.mockEntityColumn },
    gsAllowCreateUpdateChannels: { Column: O3tCommonTestData.mockEntityColumn },
    fsGiphyContentRating: { Column: O3tCommonTestData.mockEntityColumn },
    fsAllowStickersAndMemes: { Column: O3tCommonTestData.mockEntityColumn },
    fsAllowGiphy: { Column: O3tCommonTestData.mockEntityColumn },
    fsAllowCustomMemes: { Column: O3tCommonTestData.mockEntityColumn },
  } as PortalTargetsystemTeams;
}
