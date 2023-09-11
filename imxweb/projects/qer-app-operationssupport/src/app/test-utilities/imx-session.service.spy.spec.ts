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

import { Client } from 'imx-api-qbm';
import { DbObjectKey } from 'imx-qbm-dbts';
import { ISessionState, DbObjectInfo } from 'qbm';
import { ImxApiDataMock, ImxApiDtoMock } from '../test-utilities/imx-api-mock.spec';

export interface TypedEntityCollectionMock {
  tableName?: string;
  Data?: any[];
  totalCount: number;
}

export interface CurrentState {
  isLoggedIn?: boolean;
  isLoggedInOAuth?: boolean;
  oauthParameters?: string[];
}

export interface TypedClientConfig {
  typedEntityCollection?: TypedEntityCollectionMock;
}

export class SessionServiceSpy {
  private dummySearchGetResponse: Promise<DbObjectInfo[]> = Promise.resolve([
    { Key: new DbObjectKey('testtable', 'aKey'), Display: 'theDisplay' },
    { Key: new DbObjectKey('testtable', 'anotherKey'), Display: 'anotherDisplay' },
    { Key: new DbObjectKey('testtable', 'aThirdKey'), Display: 'aThirdDisplay' }
  ]);

  private dummyEntityCollectionData = Promise.resolve({
    Display: 'dummyDisplay',
    LongDisplay: 'dummyLongDisplay',
    Keys: ['', '', '', '', '', '', '', '', '', ''],
    Columns: {}
  });

  private historyEvents = [
    { ChangeTime: new Date(2019, 1, 1), IsRemoveEvent: true },
    { ChangeTime: new Date(2019, 1, 2), IsRemoveEvent: true }
  ];

  public dummyTranslationDict: {
    [key: string]: {
      [key: string]: string;
    };
  };

  public sessionResponseConfig = [];

  public dummyUserUid = 'UID-dummy-user';
  public dummyUserName = 'UserX';
  public dummySecondaryAuthName = 'SecAuth';
  public dummyMetaTableDisplay = 'dummyMetaTableDisplay';
  public dummyProviderUrl = 'dummyProviderUrl';
  public dummyCaptions = {
    text1_key: 'text1_value',
    text2_key: 'text2_value'
  } as { [key: string]: string };

  public dummyTypedEntityCollection = {
    totalCount: 10
  } as TypedEntityCollectionMock;

  public dbQueue = ImxApiDataMock.CreateDbQueue();
  public jobQueue = ImxApiDataMock.CreateJobQueue();
  public queue: string[] = ['queueName'];
  public currentState: CurrentState = {};

  public Client: jasmine.SpyObj<Client>;
  public getSessionState: jasmine.Spy;
  public login: jasmine.Spy;
  public logout: jasmine.Spy;
  public redirect: jasmine.Spy;
  public SessionState: jasmine.Spy;

  constructor() {
    this.init();
  }

  public init() {
    this.getSessionState = this.getSessionStateSpy();
    this.login = this.getLoginSpy();
    this.logout = this.getLogoutSpy();
    this.redirect = jasmine.createSpy('Redirect');
    this.Client = this.getClientSpy();
    this.SessionState = this.getSessionStateSpy();
  }

  private getClientSpy(): jasmine.SpyObj<Client> {
    const config = {
      starlingApi: {
        call: false,
        push: {},
        sms: false,
        verify: {}
      },
      systemStatusInformation: {
        IsDbSchedulerDisabled: true,
        IsJobServiceDisabled: false,
        IsCompilationRequired: true,
        IsInMaintenanceMode: true
      }
    };
    return jasmine.createSpyObj('Client', {
      imx_metadata_table_get: Promise.resolve({ Display: this.dummyMetaTableDisplay }),
      imx_multilanguage_getcaptions_get: Promise.resolve(this.dummyCaptions),
      imx_multilanguage_translations_get: Promise.resolve(this.dummyTranslationDict),
      imx_oauth_get: Promise.resolve(this.dummyProviderUrl),
      opsupport_dbobject_get: Promise.resolve({}),
      opsupport_history_get: Promise.resolve(this.historyEvents),
      opsupport_person_passcode_post: Promise.resolve({}),
      opsupport_queue_jobperformancequeues_get: Promise.resolve(this.queue),
      opsupport_queue_object_get: Promise.resolve({
        DbQueue: ImxApiDtoMock.CreateEntityDataCollection(this.dbQueue),
        JobQueue: ImxApiDtoMock.CreateEntityDataCollection(this.jobQueue),
        Unsupported: false
      }),
      opsupport_queue_reactivatejob_post: this.dummyEntityCollectionData,
      opsupport_search_get: this.dummySearchGetResponse,
      opsupport_starling_send_call_get: Promise.resolve(config.starlingApi.call),
      opsupport_starling_send_push_get: Promise.resolve(config.starlingApi.push),
      opsupport_starling_send_sms_get: Promise.resolve(config.starlingApi.sms),
      opsupport_starling_verify_get: Promise.resolve(config.starlingApi.verify),
      opsupport_sync_summary_get: Promise.resolve(),
      opsupport_systemstatus_get: Promise.resolve(config.systemStatusInformation),
      opsupport_systemstatus_post: Promise.resolve(config.systemStatusInformation)
    });
  }

  private getSessionStateSpy(): jasmine.Spy {
    return jasmine.createSpy('getSessionState').and.returnValue(Promise.resolve({
      IsLoggedOut: true,
      IsLoggedIn: this.currentState.isLoggedIn,
      Config: this.sessionResponseConfig,
      SecondaryAuthName: this.dummySecondaryAuthName,
      UserUid: this.dummyUserUid,
      Status: {
        PrimaryAuth: {
          IsAuthenticated: this.currentState.isLoggedIn
        }
      }
    }));
  }

  private getLogoutSpy(): jasmine.Spy {
    return jasmine.createSpy('logout').and.returnValue(
      Promise.resolve({
        IsLoggedOut: true
      })
    );
  }

  private getLoginSpy(): jasmine.Spy {
    return jasmine.createSpy('login').and.returnValue(
      Promise.resolve({
        IsLoggedIn: true,
        Config: this.sessionResponseConfig,
        Username: this.dummyUserName
      } as ISessionState)
    );
  }
}
