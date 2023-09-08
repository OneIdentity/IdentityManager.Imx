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

import { MethodDescriptor, TimeZoneInfo } from 'imx-qbm-dbts';

interface INodeAppInfo {
  Name?: string;
  DisplayName?: string;
  Description?: string;
  Path?: string;
}

interface ISessionResponse {
  Status?: any;
  Config?: any[];
}

export class ApiClientMethodFactoryMock {
  imx_applications_get(): MethodDescriptor<INodeAppInfo[]> {
    return {
      path: '/imx/applications',
      method: 'get',
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: null,
      observe: 'response',
      responseType: 'json'
    };
  }

  imx_sessions_get(appId: string): MethodDescriptor<ISessionResponse> {
    return {
      path: '/imx/sessions/{appId}',
      parameters: [
        {
          name: 'appId',
          value: appId,
          in: 'path'
        }
      ],
      method: 'get',
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: 'include',
      observe: 'response',
      responseType: 'json'
    };
  }

  imx_multilanguage_getcaptions_get(cultureName: string): MethodDescriptor<{ [key: string]: string; }> {
    return {
      path: '/imx/multilanguage/getcaptions',
      parameters: [
        {
          name: 'cultureName',
          value: cultureName,
          in: 'query'
        }
      ],
      method: 'get',
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: 'include',
      observe: 'response',
      responseType: 'json'
    };
  }

  imx_login_post(appId: string, inputParameterName: { [key: string]: string; }): MethodDescriptor<ISessionResponse> {
    return {
      path: '/imx/login/{appId}',
      parameters: [
        {
          name: 'appId',
          value: appId,
          in: 'path'
        },
        {
          name: 'inputParameterName',
          value: inputParameterName,
          in: 'body'
        },
      ],
      method: 'post',
      headers: {
        'imx-timezone': TimeZoneInfo.get(),
      },
      credentials: 'include',
      observe: 'response',
      responseType: 'json'
    };
  }
}

export interface Method<TValue> {
  path: string;
  type: string;
  onInvoke: (client: any) => any;
  value: TValue;
  body?: any;
}

export function createTestMethods(): Method<any>[] {
  return [
    {
      path: '/imx/applications',
      type: 'GET',
      onInvoke: (client: any) => client.imx_applications_get(),
      value: [{
        Name: 'somename',
        DisplayName: 'somedisplayname',
        Description: 'somedescription',
        Path: 'somepath'
      }]
    },
    {
      path: '/imx/sessions/someAppId',
      type: 'GET',
      onInvoke: (client: any) => client.imx_sessions_get('someAppId'),
      value: {}
    },
    {
      path: '/imx/multilanguage/getcaptions',
      type: 'GET',
      onInvoke: (client: any) => client.imx_multilanguage_getcaptions_get(null),
      value: {
        caption1: 'value1',
        caption2: 'value2'
      }
    },
    {
      path: '/imx/multilanguage/getcaptions?cultureName=someCultureName',
      type: 'GET',
      onInvoke: (client: any) => client.imx_multilanguage_getcaptions_get('someCultureName'),
      value: {
        caption1: 'value1',
        caption2: 'value2'
      }
    },
    {
      path: '/imx/login/someAppId',
      type: 'POST',
      onInvoke: (client: any) => client.imx_login_post('someAppId', {}),
      value: {},
      body: JSON.stringify({})
    }
  ];
}
