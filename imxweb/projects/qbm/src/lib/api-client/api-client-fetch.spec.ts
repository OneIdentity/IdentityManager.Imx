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
 * Copyright 2024 One Identity LLC.
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

import { of } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { ClassloggerService } from '../classlogger/classlogger.service';
import { ApiClientFetch } from './api-client-fetch';
import { ApiClientMethodFactoryMock } from './api-client.spec';
import { MethodDescriptorService } from './dynamic-method/method-descriptor.service';

describe('ApiClientFetch', () => {
  const methodFactory = new ApiClientMethodFactoryMock();

  const methods = [
    {
      path: '/imx/applications',
      type: 'GET',
      onInvoke: (client: any) => client.imx_applications_get(),
      value: [
        {
          Name: 'somename',
          DisplayName: 'somedisplayname',
          Description: 'somedescription',
          Path: 'somepath',
        },
      ],
    },
    {
      path: '/imx/sessions/someAppId',
      type: 'GET',
      onInvoke: (client: any) => client.imx_sessions_get('someAppId'),
      value: {},
    },
    {
      path: '/imx/multilanguage/getcaptions',
      type: 'GET',
      onInvoke: (client: any) => client.imx_multilanguage_getcaptions_get(null),
      value: {
        caption1: 'value1',
        caption2: 'value2',
      },
    },
    {
      path: '/imx/multilanguage/getcaptions?cultureName=someCultureName',
      type: 'GET',
      onInvoke: (client: any) => client.imx_multilanguage_getcaptions_get('someCultureName'),
      value: {
        caption1: 'value1',
        caption2: 'value2',
      },
    },
    {
      path: '/imx/login/someAppId',
      type: 'POST',
      onInvoke: (client: any) => client.imx_login_post('someAppId', {}),
      value: {},
      body: JSON.stringify({}),
    },
  ];
  methods.forEach((method) => {
    const json = method.value ? JSON.stringify(method.value) : '{}';
    const serverErrorMessage = '[{"Message":"Some error message","Level":"42","Number":"23"}]';
    [
      {
        status: 500,
        json: serverErrorMessage,
        expectedError: {
          userfriendly: 'Some error message [23]',
          message: serverErrorMessage,
        },
      },
      {
        status: 200,
        json: json,
        expectedJson: json,
      },
      {
        status: -1,
        json: serverErrorMessage,
        expectedError: {
          userfriendly: 'Some error message [23]',
          message: serverErrorMessage,
        },
      },
      {
        status: 204,
        json: null,
        expectedJson: null,
      },
    ].forEach((testcase) =>
      it(`has a method ${method.path}`, async () => {
        const client = new ApiClientFetch(
          '',
          <any>{
            debug: jasmine.createSpy('debug'),
          },
          <any>{
            get: jasmine.createSpy('get').and.callFake((key) => of(key.replace('#LDS#', ''))),
          },
          {
            fetch: (_0: RequestInfo, init: RequestInit) =>
              Promise.resolve({
                status: testcase.status,
                text: () => Promise.resolve(testcase.json),
                json: () => Promise.resolve(JSON.parse(testcase.json)),
                blob: () => Promise.resolve(new Blob()),
                headers: <any>{
                  get: jasmine.createSpy('get').and.returnValue(null),
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
                formData: null,
              } as Response),
          },
        );

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
      }),
    );
  });
});

describe('ApiClientFetch membership DELETE response contract', () => {
  const descriptor = new MethodDescriptorService().delete('/portal/ADSGroup/{groupId}/memberships/{accountId}', {
    groupId: 'test-group',
    accountId: 'test-account',
  });

  function createClient(response: Response): { client: ApiClientFetch; fetch: jasmine.Spy } {
    const logger = jasmine.createSpyObj<ClassloggerService>('ClassloggerService', ['debug', 'info']);
    const translation = jasmine.createSpyObj<TranslateService>('TranslateService', ['instant']);
    translation.instant.and.callFake((key: string) => key.replace('#LDS#', ''));
    const fetch = jasmine.createSpy('fetch').and.returnValue(Promise.resolve(response));
    return { client: new ApiClientFetch('', logger, translation, { fetch }), fetch };
  }

  it('accepts HTTP 204 without attempting to parse a body', async () => {
    const { client } = createClient(new Response(null, { status: 204 }));

    await expectAsync(client.processRequest(descriptor)).toBeResolvedTo(undefined);
  });

  it('preserves the JSON action-result array returned by a successful membership DELETE', async () => {
    const { client } = createClient(new Response('[]', { status: 200, headers: { 'Content-Type': 'application/json' } }));

    await expectAsync(client.processRequest(descriptor)).toBeResolvedTo([]);
  });

  it('preserves a nonempty text error returned with HTTP 200', async () => {
    const { client } = createClient(
      new Response('Membership cannot be removed', { status: 200, headers: { 'Content-Type': 'text/plain; charset=utf-8' } }),
    );

    await expectAsync(client.processRequest(descriptor)).toBeRejectedWithError('Membership cannot be removed');
  });

  it('does not accept an empty text response with an HTTP error status', async () => {
    const { client } = createClient(
      new Response('', { status: 500, statusText: 'Internal Server Error', headers: { 'Content-Type': 'text/plain; charset=utf-8' } }),
    );

    await expectAsync(client.processRequest(descriptor)).toBeRejectedWithError(
      'The server returned an unexpected data type. (Internal Server Error)',
    );
  });

  it('preserves structured server errors', async () => {
    const errors = [{ Message: 'Membership cannot be removed', Level: '42', Number: '23' }];
    const { client } = createClient(new Response(JSON.stringify(errors), { status: 500, headers: { 'Content-Type': 'application/json' } }));

    await expectAsync(client.processRequest(descriptor)).toBeRejectedWith(
      jasmine.objectContaining({
        message: JSON.stringify(errors),
        messageUserFriendly: 'Membership cannot be removed [23]',
      }),
    );
  });
});
