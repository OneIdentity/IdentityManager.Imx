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

import { ApiClientMethodFactoryMock } from './api-client.spec';
import { ApiClientFetch } from './api-client-fetch';
import { of } from 'rxjs';

describe('ApiClientFetch', () => {
  const methodFactory = new ApiClientMethodFactoryMock();

  const methods = [
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
  methods.forEach(method => {
    const json = method.value ? JSON.stringify(method.value) : '{}';
    const serverErrorMessage = '[{"Message":"Some error message","Level":"42","Number":"23"}]';
    [
      {
        status: 500,
        json: serverErrorMessage,
        expectedError: {
          userfriendly: 'Some error message [23]',
          message: serverErrorMessage
        }
      },
      {
        status: 200,
        json: json,
        expectedJson: json
      },
      {
        status: -1,
        json: serverErrorMessage,
        expectedError: {
          userfriendly: 'Some error message [23]',
          message: serverErrorMessage
        }
      },
      {
        status: 204,
        json: null,
        expectedJson: null
      }
    ].forEach(testcase =>
      it(`has a method ${method.path}`, async () => {
        const client = new ApiClientFetch(
          '',
          <any>{
            debug: jasmine.createSpy('debug')
          },
          <any>{
            get: jasmine.createSpy('get').and.callFake(key => of(key.replace('#LDS#', '')))
          },
          {
            fetch: (_0: RequestInfo, init: RequestInit) => Promise.resolve({
              status: testcase.status,
              text: () => Promise.resolve(testcase.json),
              json: () => Promise.resolve(JSON.parse(testcase.json)),
              blob: () => Promise.resolve(new Blob()),
              headers: <any>{
                get: jasmine.createSpy('get').and.returnValue(null)
              },
              ok: null,
              redirected: null,
              statusText: null,
              trailer: null,
              type: null,
              url: null,
              clone: null,
              body: init.body,
              bodyUsed: init.body != null,
              arrayBuffer: null,
              formData: null
            } as Response)
          });

        let actualResponse = null;
        let catchedError = null;
        try {
          actualResponse = await client.processRequest(method.onInvoke(methodFactory));
        } catch (error) {
          catchedError = error;
        }

        if (testcase.expectedError) {
          expect(catchedError.toString()).toEqual(testcase.expectedError.userfriendly);
          expect(catchedError.message).toEqual(testcase.expectedError.message);
        } else {
          expect(catchedError).toBeNull();
          if (testcase.expectedJson) {
            expect(JSON.stringify(actualResponse)).toEqual(testcase.expectedJson);
          }
        }
      })
    );
  });
});
