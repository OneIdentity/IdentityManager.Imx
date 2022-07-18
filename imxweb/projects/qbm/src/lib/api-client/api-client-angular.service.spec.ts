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

import { TestBed, getTestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { configureTestSuite } from 'ng-bullet';

import { ApiClientAngularService, BASE_URL } from './api-client-angular.service';
import { Method, createTestMethods, ApiClientMethodFactoryMock } from './api-client.spec';
import { MethodDescriptor } from 'imx-qbm-dbts';

interface MethodAngular<TValue> extends Method<TValue> {
  onInvoke: (methodFactory: ApiClientMethodFactoryMock) => MethodDescriptor<TValue>;
}

describe('ApiClientAngular', () => {
  let injector: TestBed;
  let client: ApiClientAngularService;
  let httpMock: HttpTestingController;

  const methodFactory = new ApiClientMethodFactoryMock();
  const mockBaseUrl = '';

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ApiClientAngularService,
        { provide: BASE_URL, useValue: mockBaseUrl }
      ]
    });
  });

  beforeEach(() => {
    injector = getTestBed();
    client = injector.get(ApiClientAngularService);
    httpMock = injector.get(HttpTestingController);
  });

  const methods: MethodAngular<any>[] = createTestMethods();
  methods.forEach(method => {
    const json = method.value ? JSON.stringify(method.value) : '{}';
    const expectedResponse = {
      status: 200,
      json,
      expectedJson: json
    };

    it(`has a method ${method.path}`, () => {
      client.processRequest(method.onInvoke(methodFactory)).subscribe(actualResponse => {
        expect(JSON.stringify(actualResponse)).toEqual(expectedResponse.expectedJson);
      });

      const mock = httpMock.expectOne(_ => true);
      expect(mock.request.urlWithParams).toEqual(`${mockBaseUrl}${method.path}`);
      expect(mock.request.method).toBe(method.type);
      if (method.type === 'POST') {
        expect(mock.request.body).toEqual(method.body);
      } else {
        expect(mock.request.body).toBeNull();
      }
      mock.flush(expectedResponse.json ? JSON.parse(expectedResponse.json) : expectedResponse.json, {
        status: expectedResponse.status, statusText: null
      });
    });
  });
});
